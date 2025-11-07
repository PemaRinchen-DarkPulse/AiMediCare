from flask import Blueprint, request, jsonify
import logging
import traceback
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from services.medication_recommendation_service import MedicationRecommendationService

# Create blueprint for medication recommendations
medication_bp = Blueprint('medication_recommendations', __name__)

# Initialize medication recommendation service
medication_service = MedicationRecommendationService()

@medication_bp.route('/medication-recommendations', methods=['POST'])
def generate_medication_recommendations():
    """
    Generate AI-powered medication recommendations based on patient data
    """
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No patient data provided'
            }), 400

        # Validate required patient data
        patient_data = data.get('patient_data', {})
        if not patient_data:
            return jsonify({
                'success': False,
                'error': 'Patient data is required for medication recommendations'
            }), 400

        # Log the request (without sensitive data)
        logging.info(f"Generating medication recommendations for patient")
        
        # Generate recommendations using AI service
        recommendations = medication_service.generate_medication_recommendations(patient_data)
        
        if recommendations:
            return jsonify({
                'success': True,
                'data': recommendations,
                'message': 'Medication recommendations generated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate medication recommendations'
            }), 500

    except Exception as e:
        logging.error(f"Error in medication recommendations endpoint: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Internal server error while generating recommendations'
        }), 500

@medication_bp.route('/medication-recommendations/validate', methods=['POST'])
def validate_medication_recommendation():
    """
    Validate a specific medication recommendation against patient data
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        medication = data.get('medication', {})
        patient_data = data.get('patient_data', {})
        
        if not medication or not patient_data:
            return jsonify({
                'success': False,
                'error': 'Both medication and patient data are required'
            }), 400

        # Perform validation checks
        validation_result = _validate_medication_against_patient(medication, patient_data)
        
        return jsonify({
            'success': True,
            'data': validation_result,
            'message': 'Medication validation completed'
        })

    except Exception as e:
        logging.error(f"Error in medication validation endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during validation'
        }), 500

def _validate_medication_against_patient(medication: Dict, patient_data: Dict) -> Dict:
    """
    Validate a medication against patient allergies, interactions, and contraindications
    """
    validation_result = {
        'is_safe': True,
        'warnings': [],
        'contraindications': [],
        'interactions': [],
        'recommendations': []
    }
    
    try:
        medication_name = medication.get('medication_name', '').lower()
        allergies = patient_data.get('allergies', [])
        current_medications = patient_data.get('current_medications', [])
        medical_history = patient_data.get('medical_history', [])
        
        # Check for allergies
        for allergy in allergies:
            if isinstance(allergy, dict):
                allergen = allergy.get('allergen', '').lower()
                if allergen and allergen in medication_name:
                    validation_result['is_safe'] = False
                    validation_result['contraindications'].append({
                        'type': 'allergy',
                        'message': f"Patient is allergic to {allergen}",
                        'severity': allergy.get('severity', 'unknown')
                    })
        
        # Check for basic drug interactions (simplified)
        interaction_warnings = _check_basic_interactions(medication_name, current_medications)
        validation_result['interactions'].extend(interaction_warnings)
        
        # Check medical history contraindications (simplified)
        contraindication_warnings = _check_medical_contraindications(medication_name, medical_history)
        validation_result['contraindications'].extend(contraindication_warnings)
        
        # Set overall safety flag
        if validation_result['contraindications'] or any(w.get('severity') == 'high' for w in validation_result['interactions']):
            validation_result['is_safe'] = False
            
    except Exception as e:
        logging.error(f"Error during medication validation: {str(e)}")
        validation_result['warnings'].append({
            'type': 'system',
            'message': 'Unable to complete full validation check',
            'severity': 'medium'
        })
    
    return validation_result

def _check_basic_interactions(medication_name: str, current_medications: List) -> List[Dict]:
    """
    Perform basic drug interaction checking (simplified version)
    """
    interactions = []
    
    # Basic interaction patterns (this would be much more sophisticated in production)
    interaction_patterns = {
        'warfarin': ['aspirin', 'ibuprofen', 'naproxen'],
        'metformin': ['alcohol'],
        'lisinopril': ['potassium', 'spironolactone'],
        'simvastatin': ['gemfibrozil', 'clarithromycin']
    }
    
    try:
        for current_med in current_medications:
            if isinstance(current_med, dict):
                current_med_name = current_med.get('name', '').lower()
            else:
                current_med_name = str(current_med).lower()
            
            # Check if current medication has known interactions
            if medication_name in interaction_patterns:
                for interacting_drug in interaction_patterns[medication_name]:
                    if interacting_drug in current_med_name:
                        interactions.append({
                            'type': 'drug_interaction',
                            'message': f"Potential interaction between {medication_name} and {current_med_name}",
                            'severity': 'medium',
                            'recommendation': 'Monitor closely or consider alternative'
                        })
    except Exception as e:
        logging.error(f"Error checking interactions: {str(e)}")
    
    return interactions

def _check_medical_contraindications(medication_name: str, medical_history: List) -> List[Dict]:
    """
    Check for medical history contraindications (simplified version)
    """
    contraindications = []
    
    # Basic contraindication patterns
    contraindication_patterns = {
        'aspirin': ['peptic ulcer', 'bleeding disorder'],
        'ibuprofen': ['kidney disease', 'heart failure'],
        'metformin': ['kidney disease', 'liver disease'],
        'ace inhibitor': ['kidney disease', 'hyperkalemia']
    }
    
    try:
        for condition in medical_history:
            if isinstance(condition, dict):
                condition_name = condition.get('condition', '').lower()
            else:
                condition_name = str(condition).lower()
            
            # Check for contraindications
            for med_pattern, contraindicated_conditions in contraindication_patterns.items():
                if med_pattern in medication_name:
                    for contraindicated in contraindicated_conditions:
                        if contraindicated in condition_name:
                            contraindications.append({
                                'type': 'medical_contraindication',
                                'message': f"{medication_name} may be contraindicated due to {condition_name}",
                                'severity': 'high',
                                'recommendation': 'Consider alternative medication'
                            })
    except Exception as e:
        logging.error(f"Error checking contraindications: {str(e)}")
    
    return contraindications

@medication_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@medication_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500