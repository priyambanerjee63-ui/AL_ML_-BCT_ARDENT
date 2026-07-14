const path = require('path');
const express = require('express');
const { config } = require('dotenv');
const { OpenAI } = require('openai');

config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ai-receipt', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  const data = req.body;
  const { businessName, receiptDate, customerName, items, taxRate, discount, notes } = data;

  if (!businessName || !receiptDate || !customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Please provide businessName, receiptDate, customerName, and at least one item.' });
  }

  const prompt = `Create a receipt in plain text from the following data:
Business: ${businessName}
Date: ${receiptDate}
Customer: ${customerName}
Items:
${items.map((item) => `- ${item.description} x${item.quantity} @ ${item.price}`).join('\n')}
Tax rate: ${taxRate}%
Discount: ${discount}%
Notes: ${notes || 'None'}

Include subtotal, tax amount, discount amount, total amount, and a friendly closing note.`;

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      max_output_tokens: 500
    });

    const text = response.output?.[0]?.content || response.output_text || '';
    return res.json({ receipt: text.trim() });
  } catch (error) {
    console.error('AI receipt generation error:', error);
    return res.status(500).json({ error: 'Failed to generate receipt with AI.' });
  }
});

app.listen(port, () => {
  console.log(`AI Receipt Generator server running at http://localhost:${port}`);
});
