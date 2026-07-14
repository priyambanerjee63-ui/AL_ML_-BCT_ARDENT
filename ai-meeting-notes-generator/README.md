# AI Image Caption Generator

A lightweight Flask app that lets you upload an image and generate a caption from the uploaded file name and an optional style prompt.

## Features
- Upload an image through a simple web form
- Generate a caption instantly
- View the caption on a dedicated result page

## Setup
1. Install Python 3.10+
2. Install dependencies:
   ```bash
   pip install flask pytest
   ```
3. Run the app:
   ```bash
   python app.py
   ```
4. Open http://127.0.0.1:5000/

## Testing
Run:
```bash
pytest -q
```
