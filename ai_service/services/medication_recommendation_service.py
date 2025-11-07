import requests
import os
import logging
import json
from datetime import datetime

class MedicationRecommendationService:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.base_url = 'https://openrouter.ai/api/v1/chat/completions'
        self.model = os.getenv('GEMINI_MODEL', 'google/gemini-2.0-flash-exp:free')
        
        if not self.api_key:
            raise ValueError("OpenRouter API key not found in environment variables")
    
    def generate_medication_recommendations(self, patient_data):
        """
        Generate AI-powered medication recommendations based on comprehensive patient data
        """
        try:
            # Create the prompt for medication recommendation
            prompt = self._create_medication_prompt(patient_data)
            
            # Make request to OpenRouter API
            response = self._make_api_request(prompt)
            
            if response and 'choices' in response:
                content = response['choices'][0]['message']['content']
                return self._parse_medication_response(content)
            else:
                return self._generate_fallback_recommendations()
                
        except Exception as e:
            logging.error(f"Error generating medication recommendations: {str(e)}")
            return self._generate_fallback_recommendations()
    
    def _create_medication_prompt(self, patient_data):
        """Create a comprehensive prompt for medication recommendation"""
        
        # Extract patient information
        symptoms = patient_data.get('symptoms', [])
        allergies = patient_data.get('allergies', [])
        medical_history = patient_data.get('medical_history', [])
        current_medications = patient_data.get('current_medications', [])
        triage_responses = patient_data.get('triage_responses', {})
        vital_signs = patient_data.get('vital_signs', {})
        patient_age = patient_data.get('age', 'Unknown')
        patient_gender = patient_data.get('gender', 'Unknown')
        chief_complaint = patient_data.get('chief_complaint', '')
        
        # Format allergies for safety
        allergy_list = []
        if allergies:
            for allergy in allergies:
                if isinstance(allergy, dict):
                    allergy_list.append(f"{allergy.get('allergen', 'Unknown')} - {allergy.get('severity', 'Unknown severity')}")
                else:
                    allergy_list.append(str(allergy))
        
        # Format medical history
        history_list = []
        if medical_history:
            for condition in medical_history:
                if isinstance(condition, dict):
                    history_list.append(f"{condition.get('condition', 'Unknown')} - {condition.get('diagnosedDate', 'Unknown date')}")
                else:
                    history_list.append(str(condition))
        
        # Format current medications
        current_meds_list = []
        if current_medications:
            for med in current_medications:
                if isinstance(med, dict):
                    current_meds_list.append(f"{med.get('name', 'Unknown')} - {med.get('dosage', 'Unknown dosage')}")
                else:
                    current_meds_list.append(str(med))
        
        prompt = f"""
        As an expert clinical pharmacist and medical AI assistant, analyze the following comprehensive patient data and provide evidence-based medication recommendations.

        PATIENT PROFILE:
        - Age: {patient_age}
        - Gender: {patient_gender}
        - Chief Complaint: {chief_complaint}

        CURRENT SYMPTOMS AND PRESENTATION:
        {json.dumps(symptoms, indent=2) if symptoms else "No specific symptoms documented"}

        PRE-VISIT TRIAGE RESPONSES:
        {json.dumps(triage_responses, indent=2) if triage_responses else "No triage data available"}

        VITAL SIGNS:
        {json.dumps(vital_signs, indent=2) if vital_signs else "No vital signs available"}

        KNOWN ALLERGIES (CRITICAL - MUST AVOID):
        {chr(10).join(allergy_list) if allergy_list else "No known allergies"}

        MEDICAL HISTORY:
        {chr(10).join(history_list) if history_list else "No significant medical history"}

        CURRENT MEDICATIONS:
        {chr(10).join(current_meds_list) if current_meds_list else "No current medications"}

        INSTRUCTIONS:
        1. Analyze the patient's condition based on symptoms, triage responses, and medical history
        2. Consider drug allergies and contraindications carefully
        3. Check for drug-drug interactions with current medications
        4. Recommend appropriate medications with proper dosing
        5. Include rationale for each recommendation
        6. Suggest monitoring parameters if needed
        7. Include any warnings or precautions

        Provide your response in the following JSON format:
        {{
            "analysis": {{
                "primary_diagnosis": "Most likely diagnosis based on presented data",
                "severity": "mild|moderate|severe",
                "risk_factors": ["list of identified risk factors"],
                "contraindications": ["list of contraindications found"]
            }},
            "recommendations": [
                {{
                    "medication_name": "Generic name of medication",
                    "brand_names": ["Common brand names"],
                    "dosage": "Recommended dosage",
                    "frequency": "How often to take",
                    "duration": "Recommended duration",
                    "route": "oral|topical|injection|etc",
                    "indication": "What this medication treats",
                    "rationale": "Why this medication is recommended",
                    "monitoring": "What to monitor while on this medication",
                    "side_effects": ["Common side effects to watch for"],
                    "priority": "primary|secondary|alternative",
                    "estimated_cost": "low|moderate|high"
                }}
            ],
            "warnings": [
                {{
                    "type": "allergy|interaction|contraindication|monitoring",
                    "message": "Specific warning message",
                    "severity": "low|medium|high|critical"
                }}
            ],
            "lifestyle_recommendations": [
                "Non-pharmacological recommendations"
            ],
            "follow_up": {{
                "timeline": "When to follow up",
                "parameters_to_monitor": ["What to check at follow-up"],
                "red_flags": ["Symptoms that require immediate attention"]
            }},
            "confidence_score": 0.85,
            "generated_at": "{datetime.now().isoformat()}",
            "disclaimer": "These are AI-generated recommendations for clinical consideration only. Final prescribing decisions should always be made by a licensed healthcare provider."
        }}

        IMPORTANT: Ensure all recommendations are safe given the patient's allergies and current medications. If insufficient data is available for safe recommendations, indicate this in the analysis.
        """
        
        return prompt
    
    def _make_api_request(self, prompt):
        """Make request to OpenRouter API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': self.model,
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are an expert clinical pharmacist AI assistant specializing in medication recommendations. Provide safe, evidence-based recommendations while considering patient safety above all else.'
                },
                {
                    'role': 'user', 
                    'content': prompt
                }
            ],
            'temperature': 0.3,  # Lower temperature for more consistent medical recommendations
            'max_tokens': 4000
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"API request failed: {str(e)}")
            return None
    
    def _parse_medication_response(self, content):
        """Parse and validate the AI response"""
        try:
            # Try to extract JSON from the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                recommendations = json.loads(json_str)
                
                # Validate required fields
                if self._validate_recommendations(recommendations):
                    return recommendations
                else:
                    logging.warning("Invalid recommendation format received")
                    return self._generate_fallback_recommendations()
            else:
                logging.warning("No valid JSON found in response")
                return self._generate_fallback_recommendations()
                
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse JSON response: {str(e)}")
            return self._generate_fallback_recommendations()
    
    def _validate_recommendations(self, recommendations):
        """Validate the structure of recommendations"""
        required_fields = ['analysis', 'recommendations', 'warnings', 'follow_up']
        
        if not isinstance(recommendations, dict):
            return False
        
        for field in required_fields:
            if field not in recommendations:
                return False
        
        # Validate recommendations array
        if not isinstance(recommendations['recommendations'], list):
            return False
        
        # Validate each recommendation has required fields
        for rec in recommendations['recommendations']:
            required_rec_fields = ['medication_name', 'dosage', 'frequency', 'indication', 'rationale']
            for req_field in required_rec_fields:
                if req_field not in rec:
                    return False
        
        return True
    
    def _generate_fallback_recommendations(self):
        """Generate fallback recommendations when AI fails"""
        return {
            "analysis": {
                "primary_diagnosis": "Unable to determine - insufficient data",
                "severity": "unknown",
                "risk_factors": [],
                "contraindications": []
            },
            "recommendations": [
                {
                    "medication_name": "Assessment Required",
                    "brand_names": [],
                    "dosage": "N/A",
                    "frequency": "N/A", 
                    "duration": "N/A",
                    "route": "N/A",
                    "indication": "Unable to generate recommendations",
                    "rationale": "Insufficient patient data or AI service unavailable",
                    "monitoring": "Clinical assessment required",
                    "side_effects": [],
                    "priority": "primary",
                    "estimated_cost": "unknown"
                }
            ],
            "warnings": [
                {
                    "type": "system",
                    "message": "AI medication recommendation service is currently unavailable. Please conduct manual assessment.",
                    "severity": "high"
                }
            ],
            "lifestyle_recommendations": [
                "Consult with healthcare provider for proper assessment"
            ],
            "follow_up": {
                "timeline": "As soon as possible",
                "parameters_to_monitor": ["Clinical assessment needed"],
                "red_flags": ["Any worsening symptoms"]
            },
            "confidence_score": 0.0,
            "generated_at": datetime.now().isoformat(),
            "disclaimer": "AI service unavailable. Manual clinical assessment required."
        }