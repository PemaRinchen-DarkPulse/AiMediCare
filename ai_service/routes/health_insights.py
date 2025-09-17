from flask import Blueprint, request, jsonify
import logging
import traceback
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from services.gemini_service import GeminiAIService

# Create blueprint for health insights
health_insights_bp = Blueprint('health_insights', __name__)

# Initialize Gemini service
gemini_service = GeminiAIService()

@health_insights_bp.route('/health-insights', methods=['POST'])
def generate_health_insights():
    """
    Generate AI-powered health insights from patient data
    """
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        patient_data = data.get('patient_data', {})
        analysis_type = data.get('analysis_type', 'comprehensive')
        include_trends = data.get('include_trends', True)
        include_recommendations = data.get('include_recommendations', True)

        # Validate patient data
        if not patient_data:
            return jsonify({
                'success': False,
                'error': 'Patient data is required'
            }), 400

        # Generate insights using Gemini
        insights = generate_comprehensive_insights(
            patient_data, 
            analysis_type,
            include_trends,
            include_recommendations
        )

        return jsonify({
            'success': True,
            'insights': insights,
            'generated_at': datetime.utcnow().isoformat(),
            'model_used': 'gemini-pro'
        })

    except Exception as e:
        logging.error(f"Error generating health insights: {str(e)}")
        logging.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': 'Failed to generate health insights',
            'details': str(e)
        }), 500


def generate_comprehensive_insights(
    patient_data: Dict[str, Any],
    analysis_type: str = 'comprehensive',
    include_trends: bool = True,
    include_recommendations: bool = True
) -> Dict[str, Any]:
    """
    Generate comprehensive health insights using Gemini AI
    """
    
    # Build the analysis prompt
    prompt = build_health_insights_prompt(patient_data, analysis_type, include_trends, include_recommendations)
    
    try:
        # Get insights from Gemini (sync call)
        response = gemini_service.generate_content_sync(prompt)
        
        # Parse the structured response
        insights = parse_gemini_insights_response(response)
        
        # Add metadata and validation
        insights['generated_at'] = datetime.utcnow().isoformat()
        insights['model_used'] = 'gemini-pro'
        insights['analysis_type'] = analysis_type
        
        return insights
        
    except Exception as e:
        logging.error(f"Error in Gemini insights generation: {str(e)}")
        # Return fallback insights
        return generate_fallback_insights(patient_data)


def build_health_insights_prompt(
    patient_data: Dict[str, Any],
    analysis_type: str,
    include_trends: bool,
    include_recommendations: bool
) -> str:
    """
    Build a comprehensive prompt for health insights generation
    """
    
    patient = patient_data.get('patient', {})
    vitals = patient_data.get('vitals', {})
    medications = patient_data.get('medications', [])
    conditions = patient_data.get('conditions', [])
    allergies = patient_data.get('allergies', [])
    
    prompt = f"""
You are an expert medical AI assistant tasked with analyzing patient health data to provide comprehensive insights, trend analysis, and personalized recommendations.

PATIENT PROFILE:
- Age: {patient.get('age', 'N/A')}
- Gender: {patient.get('gender', 'N/A')}
- Blood Type: {patient.get('bloodType', 'N/A')}
- Height: {patient.get('height', 'N/A')}
- Weight: {patient.get('weight', 'N/A')}

VITALS DATA:
"""
    
    # Add vitals information
    for vital_type, readings in vitals.items():
        if readings and len(readings) > 0:
            prompt += f"\n{vital_type.upper()}:\n"
            # Add recent readings (limit to prevent token overflow)
            recent_readings = readings[:10] if len(readings) > 10 else readings
            for reading in recent_readings:
                if vital_type == 'bloodPressure':
                    prompt += f"  - {reading.get('date', 'N/A')}: {reading.get('systolic', 'N/A')}/{reading.get('diastolic', 'N/A')} mmHg\n"
                else:
                    prompt += f"  - {reading.get('date', 'N/A')}: {reading.get('value', 'N/A')}\n"
    
    # Add medications
    if medications:
        prompt += f"\nCURRENT MEDICATIONS:\n"
        for med in medications:
            prompt += f"  - {med.get('name', 'N/A')} ({med.get('dosage', 'N/A')}) - {med.get('frequency', 'N/A')}\n"
            prompt += f"    Purpose: {med.get('purpose', 'N/A')}, Adherence: {med.get('adherence', 'N/A')}%\n"
    
    # Add chronic conditions
    if conditions:
        prompt += f"\nCHRONIC CONDITIONS:\n"
        for condition in conditions:
            prompt += f"  - {condition.get('condition', 'N/A')} (Status: {condition.get('status', 'N/A')})\n"
            prompt += f"    Diagnosed: {condition.get('diagnosedDate', 'N/A')}\n"
    
    # Add allergies
    if allergies:
        prompt += f"\nALLERGIES:\n"
        for allergy in allergies:
            prompt += f"  - {allergy.get('allergen', 'N/A')} (Severity: {allergy.get('severity', 'N/A')})\n"
            prompt += f"    Reaction: {allergy.get('reaction', 'N/A')}\n"
    
    prompt += f"""

ANALYSIS REQUIREMENTS:
Please provide a comprehensive health analysis in the following JSON format:

{{
  "trendAnalysis": {{
    "bloodPressure": {{
      "trend": "improving|stable|declining|concerning",
      "confidence": 0.0-1.0,
      "summary": "Brief analysis of blood pressure trends",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"]
    }},
    "bloodSugar": {{
      "trend": "improving|stable|declining|concerning",
      "confidence": 0.0-1.0,
      "summary": "Brief analysis of blood sugar trends",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"]
    }},
    "heartRate": {{
      "trend": "improving|stable|declining|concerning",
      "confidence": 0.0-1.0,
      "summary": "Brief analysis of heart rate trends",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"]
    }},
    "weight": {{
      "trend": "improving|stable|declining|concerning",
      "confidence": 0.0-1.0,
      "summary": "Brief analysis of weight trends",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"]
    }},
    "cholesterol": {{
      "trend": "improving|stable|declining|concerning",
      "confidence": 0.0-1.0,
      "summary": "Brief analysis of cholesterol trends",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"]
    }}
  }},
  "personalizedTips": [
    {{
      "category": "medication|lifestyle|diet|exercise|monitoring|general",
      "priority": "high|medium|low",
      "title": "Tip title",
      "description": "Detailed actionable advice",
      "actionable": true|false
    }}
  ],
  "healthScore": {{
    "overall": 0-100,
    "breakdown": {{
      "vitals": 0-100,
      "medications": 0-100,
      "lifestyle": 0-100
    }}
  }},
  "riskFactors": [
    {{
      "condition": "Condition name",
      "riskLevel": "low|moderate|high",
      "factors": ["factor 1", "factor 2"],
      "preventionTips": ["prevention tip 1", "prevention tip 2"]
    }}
  ]
}}

IMPORTANT GUIDELINES:
1. Only analyze vitals that have data available
2. Be specific and actionable in recommendations
3. Consider medication adherence in your analysis
4. Factor in chronic conditions when assessing trends
5. Provide realistic and achievable health tips
6. Base health scores on actual data patterns
7. Identify genuine risk factors based on the patient's profile
8. Use medical knowledge but avoid specific diagnoses
9. Encourage professional medical consultation when appropriate
10. Return ONLY valid JSON format

Please analyze this patient's health data and provide comprehensive insights:
"""
    
    return prompt


def parse_gemini_insights_response(response: str) -> Dict[str, Any]:
    """
    Parse the Gemini response into structured insights
    """
    try:
        # Clean the response - remove any markdown formatting
        cleaned_response = response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
        
        # Parse JSON
        insights = json.loads(cleaned_response)
        
        # Validate the structure
        validate_insights_structure(insights)
        
        return insights
        
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse Gemini JSON response: {str(e)}")
        logging.error(f"Response was: {response}")
        raise ValueError("Invalid JSON response from AI service")
    except Exception as e:
        logging.error(f"Error parsing insights response: {str(e)}")
        raise


def validate_insights_structure(insights: Dict[str, Any]) -> None:
    """
    Validate that the insights have the expected structure
    """
    required_keys = ['trendAnalysis', 'personalizedTips', 'healthScore', 'riskFactors']
    
    for key in required_keys:
        if key not in insights:
            raise ValueError(f"Missing required key: {key}")
    
    # Validate trend analysis structure
    trend_analysis = insights['trendAnalysis']
    for vital_type, analysis in trend_analysis.items():
        if not isinstance(analysis, dict):
            continue
        required_trend_keys = ['trend', 'confidence', 'summary', 'recommendations']
        for trend_key in required_trend_keys:
            if trend_key not in analysis:
                insights['trendAnalysis'][vital_type][trend_key] = get_default_trend_value(trend_key)
    
    # Validate health score
    if 'overall' not in insights['healthScore']:
        insights['healthScore']['overall'] = 75
    
    if 'breakdown' not in insights['healthScore']:
        insights['healthScore']['breakdown'] = {'vitals': 75, 'medications': 75, 'lifestyle': 75}


def get_default_trend_value(key: str) -> Any:
    """
    Get default values for missing trend analysis keys
    """
    defaults = {
        'trend': 'stable',
        'confidence': 0.6,
        'summary': 'Insufficient data for detailed analysis',
        'recommendations': ['Continue monitoring', 'Consult with healthcare provider']
    }
    return defaults.get(key, 'N/A')


def generate_fallback_insights(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate fallback insights when AI service fails
    """
    
    vitals = patient_data.get('vitals', {})
    medications = patient_data.get('medications', [])
    conditions = patient_data.get('conditions', [])
    
    # Basic trend analysis
    trend_analysis = {}
    for vital_type in ['bloodPressure', 'bloodSugar', 'heartRate', 'weight', 'cholesterol']:
        if vital_type in vitals and vitals[vital_type]:
            trend_analysis[vital_type] = {
                'trend': 'stable',
                'confidence': 0.5,
                'summary': f'Based on available data, {vital_type} appears stable.',
                'recommendations': ['Continue regular monitoring', 'Discuss with healthcare provider']
            }
    
    # Basic personalized tips
    tips = [
        {
            'category': 'monitoring',
            'priority': 'medium',
            'title': 'Regular Health Monitoring',
            'description': 'Continue tracking your vital signs regularly to maintain awareness of your health status.',
            'actionable': True
        }
    ]
    
    if medications:
        tips.append({
            'category': 'medication',
            'priority': 'high',
            'title': 'Medication Adherence',
            'description': 'Take all medications as prescribed and report any side effects to your healthcare provider.',
            'actionable': True
        })
    
    if conditions:
        tips.append({
            'category': 'lifestyle',
            'priority': 'medium',
            'title': 'Chronic Condition Management',
            'description': 'Follow your treatment plan and maintain regular check-ups for optimal health management.',
            'actionable': True
        })
    
    return {
        'trendAnalysis': trend_analysis,
        'personalizedTips': tips,
        'healthScore': {
            'overall': 75,
            'breakdown': {
                'vitals': 70,
                'medications': 80,
                'lifestyle': 75
            }
        },
        'riskFactors': [],
        'generated_at': datetime.utcnow().isoformat(),
        'model_used': 'fallback'
    }