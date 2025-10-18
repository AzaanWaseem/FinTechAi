from flask import Flask
from flask_migrate import Migrate
from models import db, User, Account, Goal, Analysis
import os

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    
    return app

def init_db(app):
    """Initialize database with tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

def get_user_by_id(user_id):
    """Get user by ID"""
    return User.query.get(user_id)

def get_user_by_email(email):
    """Get user by email"""
    return User.query.filter_by(email=email).first()

def create_user(email, name):
    """Create a new user"""
    user = User(email=email, name=name)
    db.session.add(user)
    db.session.commit()
    return user

def get_user_accounts(user_id):
    """Get all accounts for a user"""
    return Account.query.filter_by(user_id=user_id).all()

def create_account(user_id, nessie_customer_id, nessie_account_id, account_type='checking'):
    """Create a new account for a user"""
    account = Account(
        user_id=user_id,
        nessie_customer_id=nessie_customer_id,
        nessie_account_id=nessie_account_id,
        account_type=account_type
    )
    db.session.add(account)
    db.session.commit()
    return account

def get_user_goals(user_id, active_only=True):
    """Get goals for a user"""
    query = Goal.query.filter_by(user_id=user_id)
    if active_only:
        query = query.filter_by(is_active=True)
    return query.all()

def create_goal(user_id, amount, goal_type='monthly_savings', goal_name='Monthly Savings Goal', description=None):
    """Create a new goal for a user"""
    goal = Goal(
        user_id=user_id,
        amount=amount,
        goal_type=goal_type,
        goal_name=goal_name,
        description=description
    )
    db.session.add(goal)
    db.session.commit()
    return goal

def get_latest_analysis(user_id, account_id=None):
    """Get the latest analysis for a user"""
    query = Analysis.query.filter_by(user_id=user_id)
    if account_id:
        query = query.filter_by(account_id=account_id)
    return query.order_by(Analysis.created_at.desc()).first()

def save_analysis(user_id, account_id, needs_total, wants_total, recommendation, analysis_data=None):
    """Save analysis results"""
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
