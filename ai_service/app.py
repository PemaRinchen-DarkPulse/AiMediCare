from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Import route modules
from routes.triage import triage_bp
from routes.health import health_bp

# Register blueprints
app.register_blueprint(triage_bp, url_prefix='/api/triage')
app.register_blueprint(health_bp, url_prefix='/api')

@app.route('/')
def home():
    return jsonify({
        'service': 'AiMediCare AI Service',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting AI Service on {host}:{port}")
    app.run(host=host, port=port, debug=debug)