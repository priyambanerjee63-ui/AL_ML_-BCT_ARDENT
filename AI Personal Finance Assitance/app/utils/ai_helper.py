import openai

class AIHelper:
    def __init__(self, api_key=''):
        self.api_key = api_key
        if api_key:
            openai.api_key = api_key
        self.model = "gpt-3.5-turbo"
    
    def get_financial_advice(self, message):
        """Get financial advice from OpenAI"""
        if not self.api_key:
            return self._get_mock_response(message)
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful personal finance advisor. Provide practical and actionable financial advice."},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message['content']
        except Exception as e:
            return f"Error getting AI response: {str(e)}"
    
    def _get_mock_response(self, message):
        """Return mock response when API key is not available"""
        responses = {
            'budget': 'Create a budget by tracking your income and expenses. Allocate 50% for needs, 30% for wants, and 20% for savings.',
            'saving': 'Start by saving 10-20% of your income. Build an emergency fund of 3-6 months of expenses first.',
            'investment': 'Diversify your investments across stocks, bonds, and real estate. Consider your risk tolerance and time horizon.',
            'debt': 'Pay off high-interest debt first. Consider the avalanche or snowball method for debt repayment.',
            'default': 'That\'s a great financial question! Remember to track your spending, create a budget, and invest for the future. Would you like specific advice on budgeting, saving, or investing?'
        }
        
        message_lower = message.lower()
        for key, value in responses.items():
            if key in message_lower:
                return value
        
        return responses['default']
