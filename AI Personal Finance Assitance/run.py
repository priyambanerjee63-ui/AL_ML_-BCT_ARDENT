import os
from app import create_app, db

if __name__ == '__main__':
    # Get configuration from environment or use default
    config_name = os.environ.get('FLASK_ENV', 'development')
    
    # Create Flask app
    app = create_app(config_name)
    
    # Create database context and tables
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")
    
    # Run the application
    debug = os.environ.get('DEBUG', True)
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    
    print(f"Starting AI Personal Finance Assistant...")
    print(f"Environment: {config_name}")
    print(f"Debug Mode: {debug}")
    print(f"Server: http://{host}:{port}")
    
    app.run(debug=debug, host=host, port=port)
