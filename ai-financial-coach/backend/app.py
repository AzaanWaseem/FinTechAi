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
# Note: tracks transactions the user has chosen to remove/hide (account_id -> [ id | {description, amount} ])
user_session_state.setdefault('removed_transactions', {})

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
        # Merge any in-memory mock transactions the user added via UI
        mock_tx = user_session_state.get('mock_transactions', {}).get(account_id, [])
        if mock_tx:
            # Ensure mock txs have id and source
            merged = []
            for m in mock_tx:
                if not isinstance(m, dict):
                    continue
                tx_id = m.get('id')
                if not tx_id:
                    import uuid as _uuid
                    tx_id = str(_uuid.uuid4())
                merged.append({
                    'id': tx_id,
                    'description': m.get('description', ''),
                    'amount': float(m.get('amount', 0)),
                    'source': m.get('source', 'added')
                })
            transactions = transactions + merged

        # Filter out any transactions the user removed/hidden
        removed_tx = user_session_state.get('removed_transactions', {}).get(account_id, [])
        if removed_tx:
            removed_ids = set([r for r in removed_tx if isinstance(r, str)])
            removed_pairs = [r for r in removed_tx if isinstance(r, dict)]

            def is_removed(tx):
                # If tx has an id and id is in removed_ids
                try:
                    if tx.get('id') and str(tx.get('id')) in removed_ids:
                        return True
                except:
                    pass
                # Fallback: match by description+amount for dict entries
                try:
                    tx_desc = (tx.get('description') or '').strip().lower()
                    tx_amount = float(tx.get('amount') or 0)
                except:
                    return False
                for r in removed_pairs:
                    try:
                        r_desc = (r.get('description') or '').strip().lower()
                        r_amount = float(r.get('amount') or 0)
                    except:
                        continue
                    if tx_desc == r_desc and tx_amount == r_amount:
                        return True
                return False

            transactions = [tx for tx in transactions if not is_removed(tx)]
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
                    'id': tx.get('id'),
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
                    'id': tx.get('id'),
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
            "categorizedTransactions": categorized_transactions,
            "savingsGoal": savings_goal
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
            try:
                nessie_client.seed_transactions(account_id)
            except Exception as e:
                print(f"Error during seeding: {e}")
                return jsonify({"error": "Failed to seed transactions on Nessie"}), 500

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


@app.route('/api/seed-transactions', methods=['POST'])
def seed_transactions():
    """Seed mock transactions for the current account"""
    try:
        account_id = user_session_state.get("account_id")
        if not account_id:
            return jsonify({"error": "No account found. Please complete onboarding first."}), 400
        try:
            nessie_client.seed_transactions(account_id)
            return jsonify({"status": "success", "message": "Transactions seeded"})
        except Exception as e:
            print(f"Error seeding transactions: {e}")
            return jsonify({"error": "Failed to seed transactions"}), 500
    except Exception as e:
        print(f"Error seeding transactions: {e}")
        return jsonify({"error": "Failed to seed transactions"}), 500


@app.route('/api/add-transaction', methods=['POST'])
def add_transaction():
    """Add a single mock transaction to the in-memory store for the account"""
    try:
        data = request.get_json() or {}
        description = data.get('description')
        amount = data.get('amount')

        if not description or amount is None:
            return jsonify({"error": "description and amount are required"}), 400

        account_id = user_session_state.get('account_id')

        # ensure amount is numeric
        try:
            amount = float(amount)
        except:
            return jsonify({"error": "Invalid amount"}), 400

        # If there's no Nessie account yet, fall back to an in-memory store so users
        # can add transactions (useful during onboarding or when Nessie is unreachable)
        if not account_id:
            import uuid as _uuid
            mock_tx = {
                'id': str(_uuid.uuid4()),
                'description': description,
                'amount': amount,
                'source': 'local'
            }
            user_session_state.setdefault('mock_transactions', {})
            user_session_state['mock_transactions'].setdefault('local', [])
            user_session_state['mock_transactions']['local'].append(mock_tx)
            return jsonify({"status": "success", "transaction": mock_tx})

        # Attempt to create transaction in Nessie for persistence
        try:
            created = nessie_client.create_transaction(account_id, {"description": description, "amount": amount})
        except Exception as e:
            created = None

        # If Nessie creation failed, fall back to in-memory for this account
        if not created:
            import uuid as _uuid
            mock_tx = {
                'id': str(_uuid.uuid4()),
                'description': description,
                'amount': amount,
                'source': 'local'
            }
            user_session_state.setdefault('mock_transactions', {})
            user_session_state['mock_transactions'].setdefault(account_id, [])
            user_session_state['mock_transactions'][account_id].append(mock_tx)
            return jsonify({"status": "success", "transaction": mock_tx})

        return jsonify({"status": "success", "transaction": created})
    except Exception as e:
        print(f"Error in add_transaction: {e}")
        return jsonify({"error": "Failed to add transaction"}), 500


@app.route('/api/remove-transaction', methods=['POST'])
def remove_transaction():
    """Mark a transaction as removed/hidden in the in-memory store for the account"""
    try:
        data = request.get_json() or {}
        tx_id = data.get('id')
        if not tx_id:
            return jsonify({"error": "id is required for removal"}), 400

        account_id = user_session_state.get('account_id')
        # If no account exists, try to remove from the local mock store
        if not account_id:
            local_list = user_session_state.get('mock_transactions', {}).get('local', [])
            before = len(local_list)
            local_list = [t for t in local_list if str(t.get('id')) != str(tx_id)]
            user_session_state.setdefault('mock_transactions', {})['local'] = local_list
            if len(local_list) < before:
                return jsonify({"status": "success", "removed": {"id": tx_id}})
            else:
                # mark as removed for safety
                user_session_state.setdefault('removed_transactions', {}).setdefault('local', []).append(str(tx_id))
                return jsonify({"status": "success", "removed": {"id": tx_id}})

        # Try to delete from Nessie; if it fails, fall back to marking removed in memory
        try:
            try:
                success = nessie_client.delete_transaction(account_id, tx_id)
            except Exception:
                success = False

            if success:
                return jsonify({"status": "success", "removed": {"id": tx_id}})

            # Fallback: remove from mock_transactions for this account if present
            acct_list = user_session_state.get('mock_transactions', {}).get(account_id, [])
            before = len(acct_list)
            acct_list = [t for t in acct_list if str(t.get('id')) != str(tx_id)]
            user_session_state.setdefault('mock_transactions', {})[account_id] = acct_list
            if len(acct_list) < before:
                return jsonify({"status": "success", "removed": {"id": tx_id}})

            # Otherwise mark id as removed so analysis will filter it
            user_session_state.setdefault('removed_transactions', {}).setdefault(account_id, []).append(str(tx_id))
            return jsonify({"status": "success", "removed": {"id": tx_id}})
        except Exception as e:
            print(f"Error deleting transaction: {e}")
            return jsonify({"error": "Failed to delete transaction"}), 500
    except Exception as e:
        print(f"Error in remove_transaction: {e}")
        return jsonify({"error": "Failed to remove transaction"}), 500

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