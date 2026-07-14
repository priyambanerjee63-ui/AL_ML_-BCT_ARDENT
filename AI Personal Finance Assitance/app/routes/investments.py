from flask import Blueprint, jsonify, request
from app import db
from app.models.models import Investment
from datetime import datetime

investments_bp = Blueprint('investments', __name__, url_prefix='/api/investments')

@investments_bp.route('', methods=['GET'])
def get_investments():
    """Get all investments"""
    investments = Investment.query.all()
    return jsonify([{
        'id': i.id,
        'asset_name': i.asset_name,
        'asset_type': i.asset_type,
        'purchase_price': i.purchase_price,
        'current_price': i.current_price,
        'quantity': i.quantity,
        'current_value': i.get_current_value(),
        'gain_loss': i.get_gain_loss(),
        'gain_loss_percentage': (i.get_gain_loss() / (i.purchase_price * i.quantity) * 100) if (i.purchase_price * i.quantity) != 0 else 0
    } for i in investments])

@investments_bp.route('', methods=['POST'])
def add_investment():
    """Add a new investment"""
    data = request.json
    
    required_fields = ['asset_name', 'asset_type', 'purchase_price', 'current_price', 'quantity']
    if not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    investment = Investment(
        user_id=1,  # Replace with actual user ID
        asset_name=data['asset_name'],
        asset_type=data['asset_type'],
        purchase_price=data['purchase_price'],
        current_price=data['current_price'],
        quantity=data['quantity'],
        purchase_date=datetime.fromisoformat(data.get('purchase_date', datetime.now().isoformat()))
    )
    
    db.session.add(investment)
    db.session.commit()
    
    return jsonify({
        'id': investment.id,
        'asset_name': investment.asset_name,
        'message': 'Investment added successfully'
    }), 201

@investments_bp.route('/<int:investment_id>', methods=['PUT'])
def update_investment(investment_id):
    """Update investment price"""
    investment = Investment.query.get_or_404(investment_id)
    data = request.json
    
    if 'current_price' in data:
        investment.current_price = data['current_price']
    
    db.session.commit()
    
    return jsonify({
        'id': investment.id,
        'current_value': investment.get_current_value(),
        'gain_loss': investment.get_gain_loss(),
        'message': 'Investment updated'
    }), 200

@investments_bp.route('/summary', methods=['GET'])
def get_investment_summary():
    """Get investment portfolio summary"""
    investments = Investment.query.all()
    
    total_invested = sum(i.purchase_price * i.quantity for i in investments)
    total_current_value = sum(i.get_current_value() for i in investments)
    total_gain_loss = sum(i.get_gain_loss() for i in investments)
    
    return jsonify({
        'total_invested': total_invested,
        'total_current_value': total_current_value,
        'total_gain_loss': total_gain_loss,
        'gain_loss_percentage': (total_gain_loss / total_invested * 100) if total_invested != 0 else 0
    })
