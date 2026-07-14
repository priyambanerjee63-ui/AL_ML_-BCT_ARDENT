from flask import Blueprint, jsonify, request
from app.utils.ai_helper import AIHelper
import os

ai_chat_bp = Blueprint('ai_chat', __name__, url_prefix='/api/ai')

ai_helper = AIHelper(api_key=os.environ.get('OPENAI_API_KEY', ''))

@ai_chat_bp.route('/chat', methods=['POST'])
def chat():
    """Chat with AI financial advisor"""
    data = request.json
    
    if 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    user_message = data['message']
    
    try:
        response = ai_helper.get_financial_advice(user_message)
        return jsonify({
            'message': user_message,
            'response': response
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_chat_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get AI-powered financial recommendations"""
    try:
        # Get financial summary
        prompt = """Based on typical personal finance scenarios, provide 3-5 key financial recommendations.
        Focus on budgeting, saving, and investment strategies."""
        
        recommendations = ai_helper.get_financial_advice(prompt)
        
        return jsonify({
            'recommendations': recommendations
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_chat_bp.route('/analyze', methods=['POST'])
def analyze_spending():
    """Analyze spending patterns using AI"""
    data = request.json
    
    if 'expenses' not in data:
        return jsonify({'error': 'Expenses data is required'}), 400
    
    try:
        expenses_summary = data['expenses']
        prompt = f"""Analyze the following spending data and provide insights:
        {expenses_summary}
        
        Please provide:
        1. Summary of spending patterns
        2. Areas of overspending
        3. Recommendations for improvement"""
        
        analysis = ai_helper.get_financial_advice(prompt)
        
        return jsonify({
            'analysis': analysis
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
