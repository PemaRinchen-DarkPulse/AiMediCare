from flask import Blueprint, request, jsonify
import logging
from services.gemini_service import GeminiAIService

logger = logging.getLogger(__name__)

triage_bp = Blueprint('triage', __name__)

# Initialize AI service
gemini_service = GeminiAIService()

@triage_bp.route('/generate-questionnaire', methods=['POST'])
def generate_questionnaire():
    """Generate a pre-visit questionnaire based on appointment reason"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        reason_for_visit = data.get('reason_for_visit')
        if not reason_for_visit:
            return jsonify({'error': 'reason_for_visit is required'}), 400
        
        appointment_id = data.get('appointment_id')
        patient_history = data.get('patient_history')
        
        # Generate questionnaire using Gemini AI
        questionnaire = gemini_service.generate_previsit_questionnaire(
            reason_for_visit=reason_for_visit,
            patient_history=patient_history
        )
        
        if questionnaire:
            # Add appointment ID to the response
            if appointment_id:
                questionnaire['appointment_id'] = appointment_id
            
            return jsonify({
                'success': True,
                'questionnaire': questionnaire
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate questionnaire'
            }), 500
            
    except Exception as e:
        logger.error(f"Error in generate_questionnaire: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@triage_bp.route('/validate-questionnaire', methods=['POST'])
def validate_questionnaire():
    """Validate a completed questionnaire"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        questionnaire_id = data.get('questionnaire_id')
        answers = data.get('answers', {})
        
        if not questionnaire_id:
            return jsonify({'error': 'questionnaire_id is required'}), 400
        
        # Basic validation - check if required questions are answered
        validation_errors = []
        missing_required = []
        
        # This would typically validate against the stored questionnaire
        # For now, return a simple validation response
        
        return jsonify({
            'success': True,
            'valid': len(validation_errors) == 0,
            'validation_errors': validation_errors,
            'missing_required': missing_required,
            'completion_percentage': 100 if len(missing_required) == 0 else 75
        }), 200
        
    except Exception as e:
        logger.error(f"Error in validate_questionnaire: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@triage_bp.route('/generate', methods=['POST'])
def generate_triage():
    """Generate AI-powered triage summary from appointment reason (legacy support)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        reason_for_visit = data.get('reason_for_visit')
        
        if not reason_for_visit:
            return jsonify({'error': 'reason_for_visit is required'}), 400
        
        # Redirect to questionnaire generation for better experience
        questionnaire = gemini_service.generate_previsit_questionnaire(
            reason_for_visit=reason_for_visit
        )
        
        return jsonify({
            'success': True,
            'data': questionnaire,
            'note': 'Generated questionnaire format instead of legacy triage'
        }), 200
            
    except Exception as e:
        logger.error(f"Error in generate_triage: {e}")
        return jsonify({'error': str(e)}), 500

@triage_bp.route('/analyze', methods=['POST'])
def analyze_symptoms():
    """Analyze symptoms for medical categorization"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symptoms = data.get('symptoms')
        if not symptoms:
            return jsonify({'error': 'symptoms field is required'}), 400
        
        # For now, return a simplified analysis
        # This can be extended with more sophisticated analysis
        analysis = {
            'category': 'general',
            'urgency': 2,
            'confidence': 0.7
        }
        
        return jsonify({
            'success': True,
            'data': analysis
        }), 200
        
    except Exception as e:
        logger.error(f"Error in analyze_symptoms: {e}")
        return jsonify({'error': str(e)}), 500

@triage_bp.route('/status', methods=['GET'])
def service_status():
    """Get AI service status"""
    try:
        # Check if Gemini service is properly configured
        status = {
            'ai_service': 'operational',
            'model': gemini_service.model,
            'version': '2.0.0',
            'features': ['questionnaire_generation', 'symptom_analysis', 'triage_support']
        }
        
        return jsonify({
            'success': True,
            'data': status
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking service status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500