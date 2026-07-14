# AI Personal Finance Assistant

A comprehensive web-based personal finance management application with AI-powered financial advice, expense tracking, budgeting, and investment analysis.

## Features

✨ **Core Features:**
- 📊 Dashboard with financial overview
- 💸 Expense tracking with category breakdown
- 📋 Budget management and monitoring
- 📈 Investment portfolio tracking
- 🎯 Financial goals setting and progress tracking
- 🤖 AI-powered financial advisor chatbot
- 💡 Personalized financial recommendations

## Technology Stack

**Backend:**
- Flask (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- OpenAI API (AI capabilities)

**Frontend:**
- HTML5
- CSS3 (with modern gradients and animations)
- Vanilla JavaScript
- Chart.js (Data visualization)

## Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

### Setup Steps

1. **Clone/Download the project**
```bash
cd "i:\AI Personal Finance Assitance"
```

2. **Create a virtual environment**
```bash
python -m venv venv
```

3. **Activate the virtual environment**
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Create a `.env` file** (optional, for OpenAI integration)
```bash
Copy the .env.example file and rename to .env
Add your OpenAI API key: OPENAI_API_KEY=your_api_key_here
```

6. **Run the application**
```bash
python run.py
```

7. **Access the application**
Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
AI Personal Finance Assitance/
├── app/
│   ├── templates/
│   │   └── dashboard.html       # Main UI template
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css        # Styling
│   │   └── js/
│   │       └── script.js        # Frontend logic
│   ├── routes/
│   │   ├── dashboard.py         # Dashboard routes
│   │   ├── expenses.py          # Expense management
│   │   ├── budget.py            # Budget management
│   │   ├── investments.py       # Investment tracking
│   │   └── ai_chat.py           # AI advisor routes
│   ├── models/
│   │   └── models.py            # Database models
│   ├── utils/
│   │   └── ai_helper.py         # AI integration helper
│   └── __init__.py              # Flask app factory
├── config.py                    # Configuration
├── run.py                       # Application entry point
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Database Models

### User
- username, email, password
- Relationships: expenses, budgets, investments, goals

### Expense
- amount, category, description, date
- Categories: food, transport, utilities, entertainment, shopping, health, other

### Budget
- category, limit_amount, spent_amount, month
- Track spending against budgets

### Investment
- asset_name, asset_type, purchase_price, current_price, quantity
- Types: stock, mutual_fund, bond, crypto, real_estate

### FinancialGoal
- title, description, target_amount, current_amount, deadline, category
- Categories: savings, investment, debt_payoff, emergency_fund

## API Endpoints

### Dashboard
- `GET /dashboard/api/summary` - Get financial summary

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/summary` - Get expense summary by category
- `DELETE /api/expenses/<id>` - Delete expense

### Budget
- `GET /api/budget` - Get all budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/<id>` - Update budget

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Add investment
- `PUT /api/investments/<id>` - Update investment
- `GET /api/investments/summary` - Get portfolio summary

### AI Advisor
- `POST /api/ai/chat` - Chat with AI advisor
- `GET /api/ai/recommendations` - Get financial recommendations
- `POST /api/ai/analyze` - Analyze spending patterns

## Usage Examples

### Adding an Expense
```javascript
const expense = {
    amount: 25.50,
    category: "food",
    description: "Lunch at restaurant",
    date: "2024-01-15"
};

fetch('/api/expenses', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(expense)
})
```

### Creating a Budget
```javascript
const budget = {
    category: "food",
    limit_amount: 500
};

fetch('/api/budget', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(budget)
})
```

### Chatting with AI Advisor
```javascript
const message = {
    message: "How can I improve my savings?"
};

fetch('/api/ai/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(message)
})
```

## Features in Detail

### 💰 Expense Tracking
- Log expenses with category and date
- View expense history
- Categorize spending (food, transport, utilities, etc.)
- Delete expenses

### 📋 Budget Management
- Create monthly budgets by category
- Monitor spending against budgets
- Visual progress indicators
- Budget utilization tracking

### 📈 Investment Portfolio
- Track multiple investments
- Monitor gain/loss
- Calculate returns
- Support various asset types

### 🎯 Financial Goals
- Set and track financial goals
- Monitor progress towards targets
- Categorize goals (savings, investment, debt payoff)
- Timeline tracking

### 🤖 AI Financial Advisor
- Ask financial questions
- Get personalized recommendations
- Analyze spending patterns
- Receive financial advice

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
FLASK_ENV=development
OPENAI_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
```

### Configuration Modes
- **Development**: Debug mode enabled, SQLite development database
- **Production**: Debug mode disabled, uses production database
- **Testing**: In-memory SQLite database

## Security Considerations

⚠️ **Important for Production:**
1. Change the SECRET_KEY in config.py
2. Set FLASK_ENV to 'production'
3. Use a proper database (PostgreSQL recommended)
4. Implement user authentication
5. Use HTTPS
6. Validate all user inputs
7. Keep dependencies updated

## Future Enhancements

- User authentication and authorization
- Multi-user support
- Mobile app
- Bank account integration
- Real-time stock price updates
- Advanced analytics and reporting
- Export functionality (PDF, CSV)
- Budget alerts and notifications
- Recurring transactions
- Tax optimization suggestions

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

### Database Issues
Delete `finance_assistant_dev.db` and restart the app to reset the database.

### Missing Dependencies
```bash
pip install -r requirements.txt
```

### CORS Issues
Make sure Flask-CORS is properly initialized in `app/__init__.py`

## Contributing

Feel free to fork, modify, and improve this project!

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on the repository.

## Disclaimer

This application is for educational purposes. Always consult with a professional financial advisor before making investment decisions.

---

**Happy budgeting! 💰**
