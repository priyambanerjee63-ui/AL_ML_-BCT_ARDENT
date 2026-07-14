// Navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Mark nav item as active
    event.target.classList.add('active');

    // Load data for the section
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'expenses':
            loadExpenses();
            break;
        case 'budget':
            loadBudgets();
            break;
        case 'investments':
            loadInvestments();
            break;
        case 'ai_advisor':
            loadAIAdvisor();
            break;
    }
}

// Store chart reference globally
let expenseChartInstance = null;

// Dashboard
function loadDashboard() {
    fetch('/dashboard/api/summary')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const summary = data.data;
                document.getElementById('monthly-expenses').textContent = 
                    '$' + summary.total_expenses_month.toFixed(2);
                document.getElementById('budget-remaining').textContent = 
                    '$' + summary.budget_remaining.toFixed(2);
                document.getElementById('investment-value').textContent = 
                    '$' + summary.total_investment_value.toFixed(2);
                document.getElementById('investment-gain').textContent = 
                    (summary.total_investment_gain_loss >= 0 ? '+' : '') + 
                    '$' + summary.total_investment_gain_loss.toFixed(2);
                document.getElementById('goals-progress').textContent = 
                    summary.goal_progress_percentage.toFixed(0) + '%';
                
                // Update chart
                updateExpenseChart(summary.category_breakdown);
            }
        })
        .catch(error => console.error('Error loading dashboard:', error));
}

function updateExpenseChart(data) {
    const ctx = document.getElementById('expenseChart');
    if (ctx) {
        // Destroy existing chart if it exists
        if (expenseChartInstance) {
            expenseChartInstance.destroy();
        }
        
        const labels = Object.keys(data);
        const values = Object.values(data);
        
        expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#48bb78',
                        '#4299e1',
                        '#ed8936',
                        '#f56565'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Expenses
function loadExpenses() {
    fetch('/api/expenses')
        .then(response => response.json())
        .then(expenses => {
            const expensesList = document.getElementById('expensesList');
            expensesList.innerHTML = '';
            
            expenses.forEach(expense => {
                const item = document.createElement('div');
                item.className = 'item';
                item.innerHTML = `
                    <div class="item-info">
                        <h4>${expense.category}</h4>
                        <p>${expense.description || 'No description'}</p>
                        <p style="font-size: 0.85rem; color: #999;">${new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="item-amount">$${expense.amount.toFixed(2)}</span>
                        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button>
                    </div>
                `;
                expensesList.appendChild(item);
            });
        })
        .catch(error => console.error('Error loading expenses:', error));
}

// Add expense
document.getElementById('expenseForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const expense = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        date: document.getElementById('expenseDate').value || new Date().toISOString().split('T')[0]
    };
    
    fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(expense)
    })
    .then(response => response.json())
    .then(data => {
        alert('Expense added successfully!');
        this.reset();
        loadExpenses();
    })
    .catch(error => console.error('Error adding expense:', error));
});

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        fetch(`/api/expenses/${expenseId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert('Expense deleted!');
            loadExpenses();
        })
        .catch(error => console.error('Error deleting expense:', error));
    }
}

// Budgets
function loadBudgets() {
    fetch('/api/budget')
        .then(response => response.json())
        .then(budgets => {
            const budgetsList = document.getElementById('budgetsList');
            budgetsList.innerHTML = '';
            
            budgets.forEach(budget => {
                const percentage = (budget.spent_amount / budget.limit_amount * 100).toFixed(0);
                const item = document.createElement('div');
                item.className = 'item';
                item.innerHTML = `
                    <div class="item-info">
                        <h4>${budget.category}</h4>
                        <div style="width: 200px; height: 8px; background: #e2e8f0; border-radius: 4px; margin: 8px 0; overflow: hidden;">
                            <div style="width: ${Math.min(percentage, 100)}%; height: 100%; background: ${percentage > 80 ? '#f56565' : '#48bb78'};"></div>
                        </div>
                        <p style="font-size: 0.85rem;">$${budget.spent_amount.toFixed(2)} / $${budget.limit_amount.toFixed(2)} (${percentage}%)</p>
                    </div>
                    <div class="item-amount">$${budget.remaining.toFixed(2)}</div>
                `;
                budgetsList.appendChild(item);
            });
        })
        .catch(error => console.error('Error loading budgets:', error));
}

// Add budget
document.getElementById('budgetForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const budget = {
        category: document.getElementById('budgetCategory').value,
        limit_amount: parseFloat(document.getElementById('budgetLimit').value)
    };
    
    fetch('/api/budget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(budget)
    })
    .then(response => response.json())
    .then(data => {
        alert('Budget created successfully!');
        this.reset();
        loadBudgets();
    })
    .catch(error => console.error('Error creating budget:', error));
});

// Investments
function loadInvestments() {
    fetch('/api/investments')
        .then(response => response.json())
        .then(investments => {
            const investmentsList = document.getElementById('investmentsList');
            investmentsList.innerHTML = '';
            
            investments.forEach(investment => {
                const item = document.createElement('div');
                item.className = 'item';
                const gainLossColor = investment.gain_loss >= 0 ? '#48bb78' : '#f56565';
                item.innerHTML = `
                    <div class="item-info">
                        <h4>${investment.asset_name}</h4>
                        <p>${investment.asset_type}</p>
                        <p style="font-size: 0.85rem;">Qty: ${investment.quantity}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="color: ${gainLossColor}; font-weight: bold;">
                            ${investment.gain_loss >= 0 ? '+' : ''}${investment.gain_loss.toFixed(2)} (${investment.gain_loss_percentage.toFixed(2)}%)
                        </p>
                        <p style="font-size: 0.9rem;">Value: $${investment.current_value.toFixed(2)}</p>
                    </div>
                `;
                investmentsList.appendChild(item);
            });
        })
        .catch(error => console.error('Error loading investments:', error));
}

// Add investment
document.getElementById('investmentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const investment = {
        asset_name: document.getElementById('assetName').value,
        asset_type: document.getElementById('assetType').value,
        purchase_price: parseFloat(document.getElementById('purchasePrice').value),
        current_price: parseFloat(document.getElementById('currentPrice').value),
        quantity: parseFloat(document.getElementById('quantity').value),
        purchase_date: document.getElementById('purchaseDate').value
    };
    
    fetch('/api/investments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(investment)
    })
    .then(response => response.json())
    .then(data => {
        alert('Investment added successfully!');
        this.reset();
        loadInvestments();
    })
    .catch(error => console.error('Error adding investment:', error));
});

// AI Advisor
function loadAIAdvisor() {
    // Load initial tips
    fetch('/api/ai/recommendations')
        .then(response => response.json())
        .then(data => {
            const tipsContainer = document.getElementById('tipsContainer');
            if (tipsContainer) {
                tipsContainer.innerHTML = `<p>${data.recommendations}</p>`;
            }
        })
        .catch(error => console.error('Error loading recommendations:', error));
}

// Chat with AI
document.getElementById('chatForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const message = document.getElementById('chatInput').value;
    
    // Add user message to chat
    const chatBox = document.getElementById('chatBox');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(userMessage);
    
    // Clear input
    document.getElementById('chatInput').value = '';
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Get AI response
    fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        botMessage.innerHTML = `<p>${data.response}</p>`;
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error('Error getting AI response:', error));
});

// Initialize dashboard on page load
window.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});
