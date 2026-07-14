from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()

def create_app(config_name='development'):
    app = Flask(__name__)
    CORS(app)
    
    # Configuration based on environment
    if config_name == 'development':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance_assistant_dev.db'
    elif config_name == 'production':
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///finance_assistant.db')
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    from app.routes.dashboard import dashboard_bp
    from app.routes.expenses import expenses_bp
    from app.routes.budget import budget_bp
    from app.routes.investments import investments_bp
    from app.routes.ai_chat import ai_chat_bp
    
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(investments_bp)
    app.register_blueprint(ai_chat_bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
