from flask import Blueprint, jsonify
import os
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check if required environment variables are present
        required_vars = ['OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL', 'GEMINI_MODEL']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            return jsonify({
                'status': 'unhealthy',
                'message': f'Missing environment variables: {", ".join(missing_vars)}',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        return jsonify({
            'status': 'healthy',
            'service': 'AiMediCare AI Service',
            'version': '1.0.0',
            'model': os.getenv('GEMINI_MODEL'),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500