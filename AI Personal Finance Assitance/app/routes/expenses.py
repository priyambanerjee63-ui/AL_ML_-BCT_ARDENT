from flask import Blueprint, jsonify, request
from app import db
from app.models.models import Expense
from datetime import datetime, timedelta

expenses_bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

@expenses_bp.route('', methods=['GET'])
def get_expenses():
    """Get all expenses"""
    expenses = Expense.query.all()
    return jsonify([{
        'id': e.id,
        'amount': e.amount,
        'category': e.category,
        'description': e.description,
        'date': e.date.isoformat() if e.date else None
    } for e in expenses])

@expenses_bp.route('', methods=['POST'])
def add_expense():
    """Add a new expense"""
    data = request.json
    
    if not all(k in data for k in ['amount', 'category']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    expense = Expense(
        user_id=1,  # Replace with actual user ID
        amount=data['amount'],
        category=data['category'],
        description=data.get('description', ''),
        date=datetime.fromisoformat(data.get('date', datetime.now().isoformat()))
    )
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify({
        'id': expense.id,
        'amount': expense.amount,
        'category': expense.category,
        'message': 'Expense added successfully'
    }), 201

@expenses_bp.route('/summary', methods=['GET'])
def get_expense_summary():
    """Get expense summary by category"""
    expenses = Expense.query.all()
    
    summary = {}
    for expense in expenses:
        if expense.category not in summary:
            summary[expense.category] = 0
        summary[expense.category] += expense.amount
    
    return jsonify(summary)

@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense"""
    expense = Expense.query.get_or_404(expense_id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted'}), 200
