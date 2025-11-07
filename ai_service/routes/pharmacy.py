from flask import Blueprint, request, jsonify
import logging
from services.gemini_wrapper import GeminiService

logger = logging.getLogger(__name__)
pharmacy_bp = Blueprint('pharmacy', __name__)

@pharmacy_bp.route('/medication-interaction-analysis', methods=['POST'])
def analyze_medication_interactions():
    """
    Analyze potential drug interactions using AI
    """
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        patient_conditions = data.get('patient_conditions', [])
        patient_allergies = data.get('patient_allergies', [])
        patient_age = data.get('patient_age')
        patient_weight = data.get('patient_weight')
        
        if len(medications) < 2:
            return jsonify({
                'success': False,
                'message': 'At least 2 medications are required for interaction analysis'
            }), 400
            
        # Create prompt for AI analysis
        medications_list = ', '.join([f"{med.get('name', '')} {med.get('dosage', '')}" for med in medications])
        conditions_list = ', '.join(patient_conditions) if patient_conditions else 'None reported'
        allergies_list = ', '.join(patient_allergies) if patient_allergies else 'None reported'
        
        prompt = f"""
        As a clinical pharmacist, analyze the following medications for potential drug interactions and provide recommendations:

        MEDICATIONS:
        {medications_list}

        PATIENT INFORMATION:
        - Age: {patient_age or 'Not specified'}
        - Weight: {patient_weight or 'Not specified'}
        - Medical Conditions: {conditions_list}
        - Known Allergies: {allergies_list}

        Please provide:
        1. Major drug interactions (if any) with severity level (1-5)
        2. Moderate interactions with clinical significance
        3. Food/supplement interactions to consider
        4. Timing recommendations for administration
        5. Monitoring parameters needed
        6. Patient counseling points
        7. Age-specific considerations if applicable

        Format as JSON with the following structure:
        {{
            "major_interactions": [
                {{
                    "medications": ["med1", "med2"],
                    "severity": 4,
                    "description": "description",
                    "clinical_effect": "effect",
                    "management": "recommendation"
                }}
            ],
            "moderate_interactions": [...],
            "food_interactions": [...],
            "timing_recommendations": "recommendations",
            "monitoring_parameters": ["parameter1", "parameter2"],
            "counseling_points": ["point1", "point2"],
            "age_considerations": "considerations"
        }}
        """
        
        # Get AI analysis
        gemini_service = GeminiService()
        analysis = gemini_service.generate_response(prompt)
        
        return jsonify({
            'success': True,
            'data': {
                'analysis': analysis,
                'medications_analyzed': medications,
                'analysis_date': data.get('analysis_date')
            }
        })
        
    except Exception as e:
        logger.error(f"Medication interaction analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to analyze medication interactions',
            'error': str(e)
        }), 500

@pharmacy_bp.route('/medication-counseling', methods=['POST'])
def generate_medication_counseling():
    """
    Generate personalized medication counseling information
    """
    try:
        data = request.get_json()
        medication = data.get('medication', {})
        patient_info = data.get('patient_info', {})
        indication = data.get('indication', '')
        
        medication_name = medication.get('name', '')
        dosage = medication.get('dosage', '')
        frequency = medication.get('frequency', '')
        duration = medication.get('duration', '')
        
        if not medication_name:
            return jsonify({
                'success': False,
                'message': 'Medication name is required'
            }), 400
            
        prompt = f"""
        Create comprehensive patient counseling information for the following medication:

        MEDICATION: {medication_name}
        DOSAGE: {dosage}
        FREQUENCY: {frequency}
        DURATION: {duration}
        INDICATION: {indication}

        PATIENT INFORMATION:
        - Age: {patient_info.get('age', 'Not specified')}
        - Gender: {patient_info.get('gender', 'Not specified')}
        - Medical conditions: {', '.join(patient_info.get('conditions', [])) or 'None reported'}
        - Allergies: {', '.join(patient_info.get('allergies', [])) or 'None reported'}

        Please provide patient-friendly counseling information including:
        1. What this medication is for (in simple terms)
        2. How to take it properly
        3. Important side effects to watch for
        4. When to contact healthcare provider
        5. Food/drug interactions to avoid
        6. Storage instructions
        7. What to do if a dose is missed
        8. Special precautions or warnings
        9. Expected timeline for effectiveness
        10. Lifestyle modifications that may help

        Use simple, non-medical language that patients can understand.
        """
        
        # Get AI counseling content
        gemini_service = GeminiService()
        counseling_info = gemini_service.generate_response(prompt)
        
        return jsonify({
            'success': True,
            'data': {
                'counseling_information': counseling_info,
                'medication': medication,
                'patient_specific': True,
                'generated_date': data.get('generated_date')
            }
        })
        
    except Exception as e:
        logger.error(f"Medication counseling generation error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate counseling information',
            'error': str(e)
        }), 500

@pharmacy_bp.route('/medication-adherence-analysis', methods=['POST'])
def analyze_medication_adherence():
    """
    Analyze medication adherence patterns and provide recommendations
    """
    try:
        data = request.get_json()
        adherence_data = data.get('adherence_data', {})
        patient_barriers = data.get('barriers', [])
        medication_history = data.get('medication_history', [])
        
        prompt = f"""
        Analyze the following medication adherence data and provide recommendations:

        ADHERENCE SCORES:
        {', '.join([f"{med}: {score}%" for med, score in adherence_data.items()])}

        IDENTIFIED BARRIERS:
        {', '.join(patient_barriers) if patient_barriers else 'None identified'}

        MEDICATION HISTORY:
        {len(medication_history)} medications tracked over recent period

        Please provide:
        1. Overall adherence assessment
        2. Specific medications of concern
        3. Potential causes of poor adherence
        4. Targeted interventions for improvement
        5. Technology solutions that might help
        6. Frequency of follow-up recommendations
        7. Patient education priorities
        8. Potential medication regimen simplifications

        Focus on practical, actionable recommendations.
        """
        
        # Get AI analysis
        gemini_service = GeminiService()
        analysis = gemini_service.generate_response(prompt)
        
        return jsonify({
            'success': True,
            'data': {
                'adherence_analysis': analysis,
                'overall_score': sum(adherence_data.values()) / len(adherence_data) if adherence_data else 0,
                'medications_analyzed': len(adherence_data),
                'analysis_date': data.get('analysis_date')
            }
        })
        
    except Exception as e:
        logger.error(f"Adherence analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to analyze medication adherence',
            'error': str(e)
        }), 500

@pharmacy_bp.route('/clinical-decision-support', methods=['POST'])
def provide_clinical_decision_support():
    """
    Provide clinical decision support for pharmacists
    """
    try:
        data = request.get_json()
        clinical_scenario = data.get('scenario', '')
        patient_data = data.get('patient_data', {})
        question_type = data.get('question_type', 'general')
        
        if not clinical_scenario:
            return jsonify({
                'success': False,
                'message': 'Clinical scenario is required'
            }), 400
            
        prompt = f"""
        Provide clinical decision support for the following pharmacy scenario:

        CLINICAL SCENARIO:
        {clinical_scenario}

        PATIENT DATA:
        - Age: {patient_data.get('age', 'Not specified')}
        - Gender: {patient_data.get('gender', 'Not specified')}
        - Weight: {patient_data.get('weight', 'Not specified')}
        - Renal function: {patient_data.get('renal_function', 'Not specified')}
        - Hepatic function: {patient_data.get('hepatic_function', 'Not specified')}
        - Current medications: {', '.join(patient_data.get('current_medications', [])) or 'None listed'}
        - Allergies: {', '.join(patient_data.get('allergies', [])) or 'None listed'}
        - Medical conditions: {', '.join(patient_data.get('conditions', [])) or 'None listed'}

        QUESTION TYPE: {question_type}

        Please provide:
        1. Clinical assessment of the situation
        2. Evidence-based recommendations
        3. Safety considerations
        4. Alternative options if applicable
        5. Monitoring recommendations
        6. Patient counseling points
        7. When to consult with prescriber
        8. Documentation requirements

        Base recommendations on current clinical guidelines and evidence.
        """
        
        # Get AI analysis
        gemini_service = GeminiService()
        decision_support = gemini_service.generate_response(prompt)
        
        return jsonify({
            'success': True,
            'data': {
                'clinical_recommendation': decision_support,
                'scenario_type': question_type,
                'patient_specific': True,
                'consultation_date': data.get('consultation_date')
            }
        })
        
    except Exception as e:
        logger.error(f"Clinical decision support error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to provide clinical decision support',
            'error': str(e)
        }), 500

@pharmacy_bp.route('/inventory-optimization', methods=['POST'])
def optimize_inventory():
    """
    Provide AI-driven inventory optimization recommendations
    """
    try:
        data = request.get_json()
        inventory_data = data.get('inventory_data', [])
        sales_data = data.get('sales_data', [])
        seasonal_factors = data.get('seasonal_factors', {})
        
        if not inventory_data:
            return jsonify({
                'success': False,
                'message': 'Inventory data is required'
            }), 400
            
        # Prepare inventory summary for AI analysis
        low_stock_items = [item for item in inventory_data if item.get('stock_status') == 'low']
        overstocked_items = [item for item in inventory_data if item.get('stock_status') == 'overstock']
        expiring_items = [item for item in inventory_data if item.get('expiry_status') == 'expiring_soon']
        
        prompt = f"""
        Analyze pharmacy inventory and provide optimization recommendations:

        INVENTORY SUMMARY:
        - Total items: {len(inventory_data)}
        - Low stock items: {len(low_stock_items)}
        - Overstocked items: {len(overstocked_items)}
        - Items expiring soon: {len(expiring_items)}

        LOW STOCK MEDICATIONS:
        {', '.join([item.get('name', '') for item in low_stock_items[:10]])}

        OVERSTOCKED MEDICATIONS:
        {', '.join([item.get('name', '') for item in overstocked_items[:10]])}

        SEASONAL FACTORS:
        {seasonal_factors}

        Please provide:
        1. Priority reorder recommendations
        2. Suggested order quantities
        3. Strategies for overstocked items
        4. Expiry management recommendations
        5. Seasonal adjustments needed
        6. Cost optimization opportunities
        7. Safety stock recommendations
        8. Supplier diversification suggestions

        Focus on maintaining patient care while optimizing costs.
        """
        
        # Get AI analysis
        gemini_service = GeminiService()
        optimization_recommendations = gemini_service.generate_response(prompt)
        
        return jsonify({
            'success': True,
            'data': {
                'optimization_recommendations': optimization_recommendations,
                'inventory_stats': {
                    'total_items': len(inventory_data),
                    'low_stock_count': len(low_stock_items),
                    'overstock_count': len(overstocked_items),
                    'expiring_count': len(expiring_items)
                },
                'analysis_date': data.get('analysis_date')
            }
        })
        
    except Exception as e:
        logger.error(f"Inventory optimization error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to optimize inventory',
            'error': str(e)
        }), 500