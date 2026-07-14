const businessNameInput = document.getElementById('businessName');
const receiptDateInput = document.getElementById('receiptDate');
const customerNameInput = document.getElementById('customerName');
const taxRateInput = document.getElementById('taxRate');
const discountInput = document.getElementById('discount');
const notesInput = document.getElementById('notes');
const itemsList = document.getElementById('itemsList');
const addItemButton = document.getElementById('addItem');
const generateButton = document.getElementById('generateReceipt');
const generateAIButton = document.getElementById('generateAIReceipt');
const receiptOutput = document.getElementById('receiptOutput');

const items = [];

function createItemRow(item, index) {
  const row = document.createElement('div');
  row.className = 'item-row';

  const descriptionInput = document.createElement('input');
  descriptionInput.placeholder = 'Item description';
  descriptionInput.value = item.description;
  descriptionInput.addEventListener('input', (event) => {
    items[index].description = event.target.value;
  });

  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = '1';
  quantityInput.value = item.quantity;
  quantityInput.addEventListener('input', (event) => {
    items[index].quantity = Number(event.target.value);
  });

  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.min = '0';
  priceInput.step = '0.01';
  priceInput.value = item.price;
  priceInput.addEventListener('input', (event) => {
    items[index].price = Number(event.target.value);
  });

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.innerText = 'Delete';
  removeButton.addEventListener('click', () => {
    items.splice(index, 1);
    renderItems();
  });

  row.append(descriptionInput, quantityInput, priceInput, removeButton);
  return row;
}

function renderItems() {
  itemsList.innerHTML = '';
  items.forEach((item, index) => {
    const row = createItemRow(item, index);
    itemsList.appendChild(row);
  });
}

function addItem() {
  items.push({ description: '', quantity: 1, price: 0 });
  renderItems();
}

function calculateReceipt() {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = subtotal * (Number(taxRateInput.value) || 0) / 100;
  const discountAmount = subtotal * (Number(discountInput.value) || 0) / 100;
  const total = subtotal + taxAmount - discountAmount;

  return { subtotal, taxAmount, discountAmount, total };
}

function buildReceiptText({ isAI = false, aiText = '' } = {}) {
  const now = receiptDateInput.value || new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`Business: ${businessNameInput.value || 'N/A'}`);
  lines.push(`Date: ${now}`);
  lines.push(`Customer: ${customerNameInput.value || 'N/A'}`);
  lines.push('');
  lines.push('Items:');
  items.forEach((item) => {
    lines.push(`- ${item.description || 'Untitled'} x${item.quantity} @ $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`);
  });

  const { subtotal, taxAmount, discountAmount, total } = calculateReceipt();
  lines.push('');
  lines.push(`Subtotal: $${subtotal.toFixed(2)}`);
  lines.push(`Tax: $${taxAmount.toFixed(2)}`);
  lines.push(`Discount: -$${discountAmount.toFixed(2)}`);
  lines.push('-----------------------------------');
  lines.push(`Total: $${total.toFixed(2)}`);
  lines.push('');
  lines.push(`Notes: ${notesInput.value || 'None'}`);

  if (isAI) {
    lines.push('');
    lines.push('---');
    lines.push(aiText);
  }

  return lines.join('\n');
}

function showReceipt(text) {
  receiptOutput.textContent = text;
}

function generateReceipt() {
  if (items.length === 0) {
    alert('Please add at least one item.');
    return;
  }
  const receiptText = buildReceiptText();
  showReceipt(receiptText);
}

async function generateAIReceipt() {
  if (items.length === 0) {
    alert('Please add at least one item.');
    return;
  }

  showReceipt('Generating AI receipt...');

  const payload = {
    businessName: businessNameInput.value,
    receiptDate: receiptDateInput.value,
    customerName: customerNameInput.value,
    taxRate: Number(taxRateInput.value || 0),
    discount: Number(discountInput.value || 0),
    notes: notesInput.value,
    items,
  };

  try {
    const response = await fetch('/api/ai-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'AI receipt generation failed.');
    }

    showReceipt(result.receipt);
  } catch (error) {
    console.error(error);
    showReceipt('Error generating AI receipt. Check console for details.');
  }
}

addItemButton.addEventListener('click', addItem);
generateButton.addEventListener('click', generateReceipt);
generateAIButton.addEventListener('click', generateAIReceipt);

addItem();
renderItems();
