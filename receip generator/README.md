# AI Receipt Generator

A simple receipt generator with manual entry and optional OpenAI-powered receipt formatting.

## Features
- Enter business and customer details.
- Add multiple receipt items with quantity and price.
- Calculate subtotal, tax, discount, and total.
- Generate a formatted receipt instantly.
- Optionally generate a polished receipt using OpenAI.

## Setup
1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file and add your OpenAI API key:

```text
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the server:

```bash
npm start
```

4. Open the app in your browser:

```text
http://localhost:3000
```

## Notes
- AI receipt generation requires a valid `OPENAI_API_KEY`.
- Manual receipt generation works without an API key.
