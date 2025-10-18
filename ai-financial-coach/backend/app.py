from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
from models import db, User, Account, Goal, Analysis
from nessie_client import NessieClient
from gemini_client import GeminiClient
from apscheduler.schedulers.background import BackgroundScheduler
import json
import time
import hashlib
import secrets
from datetime import datetime, timedelta
# Load environment variables
load_dotenv()

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///financial_coach.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    CORS(app)
    
    # Initialize clients
    nessie_client = NessieClient()
    gemini_client = GeminiClient()
    
    def analyze_spending(user_id, account_id):
        """Analyze spending for a specific user and account"""
        try:
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
            
            # Get user's active goal
            active_goal = Goal.query.filter_by(user_id=user_id, is_active=True).first()
            savings_goal = active_goal.amount if active_goal else 0
            
            # Get AI recommendation
            want_transactions = [tx['description'] for tx in categorized_transactions if tx['category'] == 'Want']
            recommendation = gemini_client.get_recommendation(needs_total, wants_total, savings_goal, want_transactions)
            
            if not recommendation:
                # Fallback recommendation
                if wants_total > savings_goal * 0.5:
                    recommendation = f"Consider reducing your 'Want' spending of ${wants_total:.2f} to better meet your ${savings_goal} savings goal!"
                else:
                    recommendation = f"Great job! You're on track with your ${savings_goal} savings goal. Keep it up!"
            
            # Save analysis to database
            analysis_data = {
                "categorizedTransactions": categorized_transactions,
                "needsTotal": needs_total,
                "wantsTotal": wants_total
            }
            
            save_analysis(user_id, account_id, needs_total, wants_total, recommendation, analysis_data)
            
            return {
                "needsTotal": needs_total,
                "wantsTotal": wants_total,
                "recommendation": recommendation,
                "categorizedTransactions": categorized_transactions
            }
            
        except Exception as e:
            print(f"Error in analyze_spending: {e}")
            return {"error": "Analysis failed. Please try again."}
    
    def save_analysis(user_id, account_id, needs_total, wants_total, recommendation, analysis_data=None):
        """Save analysis results to database"""
        analysis = Analysis(
            user_id=user_id,
            account_id=account_id,
            needs_total=needs_total,
            wants_total=wants_total,
            recommendation=recommendation,
            analysis_data=analysis_data
        )
        db.session.add(analysis)
        db.session.commit()
        return analysis

    @app.route('/api/users', methods=['POST'])
    def create_user():
        """Create a new user"""
        try:
            data = request.get_json()
            email = data.get('email')
            name = data.get('name')
            
            if not email or not name:
                return jsonify({"error": "Email and name are required"}), 400
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({"error": "User with this email already exists"}), 400
            
            # Create new user
            user = User(email=email, name=name)
            db.session.add(user)
            db.session.commit()
            
            return jsonify({
                "status": "success",
                "user": user.to_dict()
            }), 201
            
        except Exception as e:
            print(f"Error creating user: {e}")
            return jsonify({"error": "Failed to create user"}), 500

    @app.route('/api/users/<int:user_id>/accounts', methods=['POST'])
    def create_account(user_id):
        """Create a new account for a user"""
        try:
            # Check if user exists
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Create Nessie account
            customer_id, account_id = nessie_client.create_customer_and_account()
            
            if customer_id and account_id:
                # Create account in database
                account = Account(
                    user_id=user_id,
                    nessie_customer_id=customer_id,
                    nessie_account_id=account_id
                )
                db.session.add(account)
                db.session.commit()
                
                # Try to seed transactions (non-blocking)
                try:
                    nessie_client.seed_transactions(account_id)
                except Exception as e:
                    print(f"Warning: Could not seed transactions: {e}")
                
                return jsonify({
                    "status": "success",
                    "account": account.to_dict()
                }), 201
            else:
                return jsonify({"error": "Failed to create Nessie account"}), 500
                
        except Exception as e:
            print(f"Error creating account: {e}")
            return jsonify({"error": "Failed to create account"}), 500

    @app.route('/api/users/<int:user_id>/goals', methods=['POST'])
    def create_goal(user_id):
        """Create a new goal for a user"""
        try:
            # Check if user exists
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            data = request.get_json()
            amount = data.get('amount', 0)
            goal_name = data.get('goal_name', 'Monthly Savings Goal')
            description = data.get('description')
            
            if amount <= 0:
                return jsonify({"error": "Goal amount must be greater than 0"}), 400
            
            # Deactivate existing goals
            Goal.query.filter_by(user_id=user_id, is_active=True).update({'is_active': False})
            
            # Create new goal
            goal = Goal(
                user_id=user_id,
                amount=amount,
                goal_name=goal_name,
                description=description
            )
            db.session.add(goal)
            db.session.commit()
            
            return jsonify({
                "status": "success",
                "goal": goal.to_dict()
            }), 201
            
        except Exception as e:
            print(f"Error creating goal: {e}")
            return jsonify({"error": "Failed to create goal"}), 500

    @app.route('/api/users/<int:user_id>/analysis', methods=['GET'])
    def get_analysis(user_id):
        """Get spending analysis for a user"""
        try:
            # Check if user exists
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Get user's first account
            account = Account.query.filter_by(user_id=user_id).first()
            if not account:
                return jsonify({"error": "No account found. Please create an account first."}), 400
            
            # Run analysis
            result = analyze_spending(user_id, account.nessie_account_id)
            return jsonify(result)
            
        except Exception as e:
            print(f"Error in analysis: {e}")
            return jsonify({"error": "Analysis failed"}), 500

    @app.route('/api/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        """Get user information"""
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({
                "status": "success",
                "user": user.to_dict()
            })
            
        except Exception as e:
            print(f"Error getting user: {e}")
            return jsonify({"error": "Failed to get user"}), 500

    @app.route('/api/health', methods=['GET'])
    def health():
        """Health check endpoint"""
        return jsonify({"status": "healthy", "message": "AI Financial Coach API is running"})

    # Legacy endpoints for backward compatibility
    @app.route('/api/onboard', methods=['POST'])
    def onboard_legacy():
        """Legacy onboarding endpoint - creates user and account"""
        try:
            data = request.get_json()
            email = data.get('email', f'demo_{int(time.time())}@example.com')
            name = data.get('name', 'Demo User')
        
            # Check if user already exists, if so use existing user
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(email=email, name=name)
                db.session.add(user)
                db.session.commit()
            
            # Create account
            customer_id, account_id = nessie_client.create_customer_and_account()
            
            if customer_id and account_id:
                account = Account(
                    user_id=user.id,
                    nessie_customer_id=customer_id,
                    nessie_account_id=account_id
                )
                db.session.add(account)
                db.session.commit()
                
                # Try to seed transactions
                try:
                    nessie_client.seed_transactions(account_id)
                except Exception as e:
                    print(f"Warning: Could not seed transactions: {e}")
                
                return jsonify({
                    "customerId": customer_id,
                    "accountId": account_id,
                    "userId": user.id
                })
            else:
                return jsonify({"error": "Failed to create account"}), 500
                
        except Exception as e:
            print(f"Error in onboard: {e}")
            return jsonify({"error": "Failed to create your financial account. Please try again."}), 500

    @app.route('/api/set-goal', methods=['POST'])
    def set_goal_legacy():
        """Legacy goal setting endpoint"""
        try:
            data = request.get_json()
            goal = data.get('goal', 0)
            user_id = data.get('user_id', 1)  # Default to user 1 for legacy
            
            if goal <= 0:
                return jsonify({"error": "Goal must be greater than 0"}), 400
            
            # Deactivate existing goals
            Goal.query.filter_by(user_id=user_id, is_active=True).update({'is_active': False})
            
            # Create new goal
            goal_obj = Goal(user_id=user_id, amount=goal)
            db.session.add(goal_obj)
            db.session.commit()
            
            return jsonify({
                "status": "success",
                "goalSet": goal
            })
            
        except Exception as e:
            print(f"Error in set_goal: {e}")
            return jsonify({"error": "Failed to set goal"}), 500

    @app.route('/api/analysis', methods=['GET'])
    def analysis_legacy():
        """Legacy analysis endpoint"""
        try:
            user_id = request.args.get('user_id', 1)  # Default to user 1
            account = Account.query.filter_by(user_id=user_id).first()
            
            if not account:
                return jsonify({"error": "No account found"}), 400
            
            result = analyze_spending(user_id, account.nessie_account_id)
            return jsonify(result)
            
        except Exception as e:
            print(f"Error in analysis: {e}")
            return jsonify({"error": "Analysis failed"}), 500
        
    # Authentication Routes
        # Authentication Routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """Register a new user"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            name = data.get('name', '').strip()
            password = data.get('password', '')
            
            print(f"Registration attempt: {email}, {name}")
            
            # Validation
            if not email or not name or not password:
                return jsonify({"error": "Email, name, and password are required"}), 400
            
            if len(password) < 6:
                return jsonify({"error": "Password must be at least 6 characters"}), 400
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({"error": "User with this email already exists"}), 400
            
            # Create new user
            user = User(email=email, name=name)
            db.session.add(user)
            db.session.commit()
            
            print(f"User created successfully: {user.id}")
            
            return jsonify({
                "status": "success",
                "message": "User registered successfully",
                "user": user.to_dict()
            }), 201
            
        except Exception as e:
            print(f"Error in register: {e}")
            return jsonify({"error": "Registration failed"}), 500

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """Login user"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            
            print(f"Login attempt: {email}")
            
            if not email:
                return jsonify({"error": "Email is required"}), 400
            
            # Find user
            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            print(f"User found: {user.id}")
            
            return jsonify({
                "status": "success",
                "message": "Login successful",
                "user": user.to_dict()
            }), 200
            
        except Exception as e:
            print(f"Error in login: {e}")
            return jsonify({"error": "Login failed"}), 500
    return app
    

if __name__ == '__main__':
    app = create_app()
    
    # Initialize database
    with app.app_context():
        db.create_all()
        print("✅ Database initialized!")
    
    print("🚀 Starting AI Financial Coach Backend...")
    print("📊 Multi-user support enabled")
    print("🔑 Make sure to set NESSIE_API_KEY and GEMINI_API_KEY in .env file")
    app.run(debug=True, port=5002)


    # Authentication Routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """Register a new user"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            name = data.get('name', '').strip()
            password = data.get('password', '')
            
            # Validation
            if not email or not name or not password:
                return jsonify({"error": "Email, name, and password are required"}), 400
            
            if len(password) < 6:
                return jsonify({"error": "Password must be at least 6 characters"}), 400
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({"error": "User with this email already exists"}), 400
            
            # Create new user
            user = User(email=email, name=name)
            db.session.add(user)
            db.session.commit()
            
            return jsonify({
                "status": "success",
                "message": "User registered successfully",
                "user": user.to_dict()
            }), 201
            
        except Exception as e:
            print(f"Error in register: {e}")
            return jsonify({"error": "Registration failed"}), 500

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """Login user (simplified - just email for now)"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            
            if not email:
                return jsonify({"error": "Email is required"}), 400
            
            # Find user
            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({
                "status": "success",
                "message": "Login successful",
                "user": user.to_dict()
            }), 200
            
        except Exception as e:
            print(f"Error in login: {e}")
            return jsonify({"error": "Login failed"}), 500

    @app.route('/api/auth/user/<int:user_id>', methods=['GET'])
    def get_user_profile(user_id):
        """Get user profile with accounts and goals"""
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Get user's accounts and goals
            accounts = [account.to_dict() for account in user.accounts]
            goals = [goal.to_dict() for goal in user.goals if goal.is_active]
            
            user_data = user.to_dict()
            user_data['accounts'] = accounts
            user_data['goals'] = goals
            
            return jsonify({
                "status": "success",
                "user": user_data
            }), 200
            
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return jsonify({"error": "Failed to get user profile"}), 500
