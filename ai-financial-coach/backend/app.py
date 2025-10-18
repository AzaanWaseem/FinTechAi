from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from nessie_client import NessieClient
from gemini_client import GeminiClient
from apscheduler.schedulers.background import BackgroundScheduler
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Global session state for prototype
user_session_state = {
    "customer_id": None,
    "account_id": None,
    "savings_goal": 0,
    "monthly_budget": 0
}

# Initialize clients
nessie_client = NessieClient()
gemini_client = GeminiClient()

def analyze_spending():
    """Main function to analyze user spending patterns"""
    try:
        account_id = user_session_state.get("account_id")
        savings_goal = user_session_state.get("savings_goal", 0)
        
        if not account_id:
            return {"error": "No account found. Please complete onboarding first."}
        
        # Get transactions
        transactions = nessie_client.get_transactions(account_id)
        if not transactions:
            return {"error": "No transactions found."}
        
        # Format transaction descriptions for AI analysis
        transaction_descriptions = [tx.get('description', '') for tx in transactions]
        
        # Categorize transactions using Gemini
        categorized_result = gemini_client.categorize_transactions(transaction_descriptions)
        
        if not categorized_result or 'transactions' not in categorized_result:
            # Fallback categorization
            categorized_transactions = []
            for i, tx in enumerate(transactions):
                description = tx.get('description', '').lower()
                if any(word in description for word in ['grocery', 'food', 'gas', 'rent', 'utility', 'insurance', 'medical']):
                    category = 'Need'
                else:
                    category = 'Want'
                categorized_transactions.append({
                    'description': tx.get('description', ''),
                    'amount': tx.get('amount', 0),
                    'category': category
                })
        else:
            # Use AI categorization
            categorized_transactions = []
            for i, tx in enumerate(transactions):
                if i < len(categorized_result['transactions']):
                    category = categorized_result['transactions'][i]
                else:
                    category = 'Want'  # Default fallback
                
                categorized_transactions.append({
                    'description': tx.get('description', ''),
                    'amount': tx.get('amount', 0),
                    'category': category
                })
        
        # Calculate totals
        needs_total = sum(tx['amount'] for tx in categorized_transactions if tx['category'] == 'Need')
        wants_total = sum(tx['amount'] for tx in categorized_transactions if tx['category'] == 'Want')
        
        # Get AI recommendation
        want_transactions = [tx['description'] for tx in categorized_transactions if tx['category'] == 'Want']
        recommendation = gemini_client.get_recommendation(needs_total, wants_total, savings_goal, want_transactions)
        
        if not recommendation:
            # Fallback recommendation
            if wants_total > savings_goal * 0.5:
                recommendation = f"Consider reducing your 'Want' spending of ${wants_total:.2f} to better meet your ${savings_goal} savings goal!"
            else:
                recommendation = f"Great job! You're on track with your ${savings_goal} savings goal. Keep it up!"
        
        return {
            "needsTotal": needs_total,
            "wantsTotal": wants_total,
            "totalSpending": needs_total + wants_total,
            "monthlyBudget": user_session_state.get("monthly_budget", 0),
            "savingsGoal": user_session_state.get("savings_goal", 0),
            "recommendation": recommendation,
            "categorizedTransactions": categorized_transactions
        }
        
    except Exception as e:
        print(f"Error in analyze_spending: {e}")
        return {"error": "Analysis failed. Please try again."}

@app.route('/api/onboard', methods=['POST'])
def onboard():
    """Create a new customer and account, seed with transactions"""
    try:
        customer_id, account_id = nessie_client.create_customer_and_account()
        
        if customer_id and account_id:
            user_session_state["customer_id"] = customer_id
            user_session_state["account_id"] = account_id
            
            # Try to seed transactions (non-blocking)
            try:
                nessie_client.seed_transactions(account_id)
            except Exception as e:
                print(f"Warning: Could not seed transactions: {e}")
            
            return jsonify({
                "customerId": customer_id,
                "accountId": account_id
            })
        else:
            return jsonify({"error": "Failed to create account"}), 500
            
    except Exception as e:
        print(f"Error in onboard: {e}")
        return jsonify({"error": "Failed to create your financial account. Please try again."}), 500

@app.route('/api/set-goal', methods=['POST'])
def set_goal():
    """Set the user's monthly savings goal and budget"""
    try:
        data = request.get_json()
        goal = data.get('goal', 0)
        budget = data.get('budget', 0)
        
        if goal <= 0:
            return jsonify({"error": "Goal must be greater than 0"}), 400
        
        if budget <= 0:
            return jsonify({"error": "Budget must be greater than 0"}), 400
            
        if goal > budget:
            return jsonify({"error": "Savings goal cannot be greater than budget"}), 400
        
        user_session_state["savings_goal"] = goal
        user_session_state["monthly_budget"] = budget
        return jsonify({
            "status": "success",
            "goalSet": goal,
            "budgetSet": budget
        })
        
    except Exception as e:
        print(f"Error in set_goal: {e}")
        return jsonify({"error": "Failed to set goal"}), 500

@app.route('/api/analysis', methods=['GET'])
def analysis():
    """Get spending analysis and recommendations"""
    try:
        result = analyze_spending()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in analysis: {e}")
        return jsonify({"error": "Analysis failed"}), 500

@app.route('/api/investment-idea', methods=['GET'])
def investment_idea():
    """Get investment education if savings goal is met"""
    try:
        savings_goal = user_session_state.get("savings_goal", 0)
        
        # Get current analysis to check if goal is met
        analysis_result = analyze_spending()
        if "error" in analysis_result:
            return jsonify(analysis_result), 400
        
        wants_total = analysis_result.get("wantsTotal", 0)
        
        # Check if goal is met (simplified: if wants spending is less than half the goal)
        if wants_total <= savings_goal * 0.5:
            investment_concept = gemini_client.get_investment_concept(savings_goal)
            return jsonify(investment_concept)
        else:
            return jsonify({
                "title": "Keep Saving!",
                "explanation": f"You're making progress toward your ${savings_goal} goal. Keep up the good work!"
            })
            
    except Exception as e:
        print(f"Error in investment_idea: {e}")
        return jsonify({"error": "Failed to get investment idea"}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "AI Financial Coach API is running"})

def run_scheduled_analysis():
    """Scheduled function to run analysis and send notifications"""
    try:
        result = analyze_spending()
        if "error" not in result:
            print(f"📊 Weekly Analysis Complete:")
            print(f"   Needs: ${result.get('needsTotal', 0):.2f}")
            print(f"   Wants: ${result.get('wantsTotal', 0):.2f}")
            print(f"   Recommendation: {result.get('recommendation', 'N/A')}")
        else:
            print(f"❌ Analysis failed: {result.get('error')}")
    except Exception as e:
        print(f"❌ Scheduled analysis error: {e}")

# Configure scheduler
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(run_scheduled_analysis, 'interval', days=7)
scheduler.start()

if __name__ == '__main__':
    print("🚀 Starting AI Financial Coach Backend...")
    print("📊 Scheduler configured for weekly analysis")
    print("🔑 Make sure to set NESSIE_API_KEY and GEMINI_API_KEY in .env file")
    app.run(debug=True, port=5002)