from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """User model for storing user information"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('Account', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'accounts_count': len(self.accounts),
            'goals_count': len(self.goals)
        }
    
    def __repr__(self):
        return f'<User {self.email}>'

class Account(db.Model):
    """Account model for storing Nessie account information"""
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    nessie_customer_id = db.Column(db.String(50), nullable=False)
    nessie_account_id = db.Column(db.String(50), nullable=False)
    account_type = db.Column(db.String(20), default='checking')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert account to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'nessie_customer_id': self.nessie_customer_id,
            'nessie_account_id': self.nessie_account_id,
            'account_type': self.account_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Account {self.nessie_account_id} for User {self.user_id}>'

class Goal(db.Model):
    """Goal model for storing user savings goals"""
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    goal_type = db.Column(db.String(20), default='monthly_savings')
    goal_name = db.Column(db.String(100), default='Monthly Savings Goal')
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        """Convert goal to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'goal_type': self.goal_type,
            'goal_name': self.goal_name,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Goal {self.goal_name}: ${self.amount} for User {self.user_id}>'

class Analysis(db.Model):
    """Analysis model for storing user spending analysis results"""
    __tablename__ = 'analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    needs_total = db.Column(db.Float, nullable=False, default=0.0)
    wants_total = db.Column(db.Float, nullable=False, default=0.0)
    recommendation = db.Column(db.Text, nullable=True)
    analysis_data = db.Column(db.JSON, nullable=True)  # Store full analysis results
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='analyses')
    account = db.relationship('Account', backref='analyses')
    
    def to_dict(self):
        """Convert analysis to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'account_id': self.account_id,
            'needs_total': self.needs_total,
            'wants_total': self.wants_total,
            'recommendation': self.recommendation,
            'analysis_data': self.analysis_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Analysis for User {self.user_id} on {self.created_at}>'
