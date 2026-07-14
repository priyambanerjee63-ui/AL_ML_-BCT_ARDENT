from flask import Blueprint, render_template, request, jsonify
from app import db
from app.models.models import Expense, Budget, Investment, FinancialGoal
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/')

@dashboard_bp.route('/')
def index():
    """Dashboard home page"""
    return render_template('dashboard.html')

@dashboard_bp.route('/dashboard')
def dashboard():
    """Dashboard page with overview"""
    return render_template('dashboard.html')

@dashboard_bp.route('/dashboard/api/summary')
def get_summary():
    """Get financial summary"""
    user_id = request.args.get('user_id', 1, type=int)  # Default to user 1 for demo
    
    try:
        # Get current month
        today = datetime.utcnow()
        month_start = today.replace(day=1)
        
        # Calculate total expenses this month
        expenses = Expense.query.filter(
            Expense.user_id == user_id,
            Expense.date >= month_start
        ).all()
        total_expenses = sum(e.amount for e in expenses)
        
        # Get budgets
        budgets = Budget.query.filter_by(user_id=user_id).all()
        total_budget = sum(b.limit_amount for b in budgets)
        
        # Get investments
        investments = Investment.query.filter_by(user_id=user_id).all()
        total_investment_value = sum(inv.get_current_value() for inv in investments)
        total_investment_gain_loss = sum(inv.get_gain_loss() for inv in investments)
        
        # Get goals
        goals = FinancialGoal.query.filter_by(user_id=user_id).all()
        total_goal_progress = sum(g.current_amount for g in goals)
        total_goal_target = sum(g.target_amount for g in goals)
        
        # Get expense categories breakdown
        category_breakdown = {}
        for expense in expenses:
            if expense.category not in category_breakdown:
                category_breakdown[expense.category] = 0
            category_breakdown[expense.category] += expense.amount
        
        return jsonify({
            'success': True,
            'data': {
                'total_expenses_month': round(total_expenses, 2),
                'total_budget': round(total_budget, 2),
                'budget_remaining': round(total_budget - total_expenses, 2),
                'total_investment_value': round(total_investment_value, 2),
                'total_investment_gain_loss': round(total_investment_gain_loss, 2),
                'total_goal_progress': round(total_goal_progress, 2),
                'total_goal_target': round(total_goal_target, 2),
                'goal_progress_percentage': round((total_goal_progress / total_goal_target * 100) if total_goal_target > 0 else 0, 2),
                'category_breakdown': category_breakdown,
                'total_expenses_count': len(expenses)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
