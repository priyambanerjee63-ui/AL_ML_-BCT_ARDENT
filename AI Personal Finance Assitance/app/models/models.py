from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade='all, delete-orphan')
    budgets = db.relationship('Budget', backref='user', lazy=True, cascade='all, delete-orphan')
    investments = db.relationship('Investment', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('FinancialGoal', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'


class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # e.g., 'food', 'transport', 'utilities', etc.
    description = db.Column(db.String(255))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Expense {self.category}: ${self.amount}>'


class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    limit_amount = db.Column(db.Float, nullable=False)
    spent_amount = db.Column(db.Float, default=0.0)
    month = db.Column(db.String(10))  # Format: 'YYYY-MM'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Budget {self.category}: ${self.limit_amount}>'


class Investment(db.Model):
    __tablename__ = 'investments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    asset_name = db.Column(db.String(120), nullable=False)
    asset_type = db.Column(db.String(50), nullable=False)  # e.g., 'stock', 'mutual_fund', 'crypto', etc.
    purchase_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Investment {self.asset_name}>'
    
    def get_current_value(self):
        return self.current_price * self.quantity
    
    def get_gain_loss(self):
        return self.get_current_value() - (self.purchase_price * self.quantity)


class FinancialGoal(db.Model):
    __tablename__ = 'financial_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.DateTime)
    category = db.Column(db.String(50))  # e.g., 'savings', 'investment', 'debt_payoff'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Goal {self.title}>'
    
    def get_progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return (self.current_amount / self.target_amount) * 100
