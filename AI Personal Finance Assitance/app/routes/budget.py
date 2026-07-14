from flask import Blueprint, jsonify, request
from app import db
from app.models.models import Budget
from datetime import datetime

budget_bp = Blueprint('budget', __name__, url_prefix='/api/budget')

@budget_bp.route('', methods=['GET'])
def get_budgets():
    """Get all budgets"""
    budgets = Budget.query.all()
    return jsonify([{
        'id': b.id,
        'category': b.category,
        'limit_amount': b.limit_amount,
        'spent_amount': b.spent_amount,
        'month': b.month,
        'remaining': b.limit_amount - b.spent_amount
    } for b in budgets])

@budget_bp.route('', methods=['POST'])
def create_budget():
    """Create a new budget"""
    data = request.json
    
    if not all(k in data for k in ['category', 'limit_amount']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    current_month = datetime.now().strftime('%Y-%m')
    
    budget = Budget(
        user_id=1,  # Replace with actual user ID
        category=data['category'],
        limit_amount=data['limit_amount'],
        month=data.get('month', current_month)
    )
    
    db.session.add(budget)
    db.session.commit()
    
    return jsonify({
        'id': budget.id,
        'category': budget.category,
        'limit_amount': budget.limit_amount,
        'message': 'Budget created successfully'
    }), 201

@budget_bp.route('/<int:budget_id>', methods=['PUT'])
def update_budget(budget_id):
    """Update a budget"""
    budget = Budget.query.get_or_404(budget_id)
    data = request.json
    
    if 'limit_amount' in data:
        budget.limit_amount = data['limit_amount']
    if 'spent_amount' in data:
        budget.spent_amount = data['spent_amount']
    
    db.session.commit()
    
    return jsonify({
        'id': budget.id,
        'message': 'Budget updated successfully'
    }), 200
