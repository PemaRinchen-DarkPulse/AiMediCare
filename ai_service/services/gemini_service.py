import requests
import os
import logging
import json
from datetime import datetime

class GeminiAIService:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.base_url = 'https://openrouter.ai/api/v1/chat/completions'
        self.model = os.getenv('GEMINI_MODEL', 'google/gemini-2.0-flash-exp:free')
        
        if not self.api_key:
            raise ValueError("OpenRouter API key not found in environment variables")
    
    def generate_previsit_questionnaire(self, reason_for_visit, patient_history=None):
        """
        Generate a structured pre-visit questionnaire based on the reason for visit
        """
        try:
            # Create the prompt for questionnaire generation
            prompt = self._create_questionnaire_prompt(reason_for_visit, patient_history)
            
            # Make request to OpenRouter API
            response = self._make_api_request(prompt)
            
            if response and 'choices' in response:
                content = response['choices'][0]['message']['content']
                return self._parse_questionnaire_response(content, reason_for_visit)
            else:
                return self._generate_fallback_questionnaire(reason_for_visit)
                
        except Exception as e:
            logging.error(f"Error generating questionnaire: {str(e)}")
            return self._generate_fallback_questionnaire(reason_for_visit)
    
    def _create_questionnaire_prompt(self, reason_for_visit, patient_history):
        """Create a structured prompt for questionnaire generation"""
        prompt = f"""
        As a medical AI assistant, create a comprehensive pre-visit questionnaire for a patient coming in for: {reason_for_visit}

        Generate a structured questionnaire with 8-12 relevant questions that will help the doctor prepare for the visit and gather important information beforehand.

        Include different types of questions:
        - Text input questions for detailed descriptions
        - Multiple choice questions for specific symptoms
        - Yes/No questions for medical history
        - Scale questions for pain/severity ratings (1-10)

        Format your response as a JSON object with this exact structure:
        {{
            "title": "Pre-Visit Questionnaire: [Reason for Visit]",
            "urgency_level": "Low|Medium|High|Critical",
            "estimated_duration": "5-10 minutes",
            "questions": [
                {{
                    "id": 1,
                    "type": "text|multiple_choice|yes_no|scale",
                    "question": "The actual question text",
                    "required": true|false,
                    "options": ["option1", "option2"] // only for multiple_choice
                }}
            ],
            "preparation_notes": "What the patient should prepare or bring",
            "urgency_notes": "Any urgent symptoms to watch for"
        }}

        Make the questions medically relevant, easy to understand, and focused on gathering information that would be valuable for the doctor to know before the appointment.
        """
        
        if patient_history:
            prompt += f"\n\nConsider this patient history when creating questions: {patient_history}"
        
        return prompt
    
    def _make_api_request(self, prompt):
        """Make the actual API request to OpenRouter"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aimedicare.local',
            'X-Title': 'AiMediCare Questionnaire System'
        }
        
        data = {
            'model': self.model,
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a medical AI assistant specialized in creating pre-visit questionnaires. Generate comprehensive, medically relevant questions that help doctors prepare for patient visits. Always respond with valid JSON format.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.3,
            'max_tokens': 2000
        }
        
        response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        return response.json()
    
    def _parse_questionnaire_response(self, content, reason_for_visit):
        """Parse the AI response into structured questionnaire data"""
        try:
            # Try to extract JSON from the response
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_content = content[json_start:json_end]
                questionnaire_data = json.loads(json_content)
                
                # Validate and enhance the questionnaire
                if 'questions' not in questionnaire_data:
                    raise ValueError("No questions found in response")
                
                # Add metadata
                questionnaire_data['ai_generated'] = True
                questionnaire_data['generated_at'] = datetime.now().isoformat()
                questionnaire_data['model_used'] = self.model
                questionnaire_data['reason_for_visit'] = reason_for_visit
                
                # Ensure required fields exist
                if 'urgency_level' not in questionnaire_data:
                    questionnaire_data['urgency_level'] = 'Medium'
                if 'estimated_duration' not in questionnaire_data:
                    questionnaire_data['estimated_duration'] = '5-10 minutes'
                
                return questionnaire_data
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Error parsing questionnaire response: {str(e)}")
            return self._generate_fallback_questionnaire(reason_for_visit)
    
    def _generate_fallback_questionnaire(self, reason_for_visit):
        """Generate a basic fallback questionnaire when AI fails"""
        return {
            'title': f'Pre-Visit Questionnaire: {reason_for_visit}',
            'urgency_level': 'Medium',
            'estimated_duration': '5-10 minutes',
            'reason_for_visit': reason_for_visit,
            'questions': [
                {
                    'id': 1,
                    'type': 'text',
                    'question': f'Please describe your {reason_for_visit.lower()} in detail, including when it started and any symptoms you\'ve noticed.',
                    'required': True
                },
                {
                    'id': 2,
                    'type': 'scale',
                    'question': 'On a scale of 1-10, how would you rate your current discomfort or concern level?',
                    'required': True
                },
                {
                    'id': 3,
                    'type': 'multiple_choice',
                    'question': 'How long have you been experiencing this issue?',
                    'required': True,
                    'options': ['Less than 1 day', '1-3 days', '1 week', '1-4 weeks', 'More than 1 month']
                },
                {
                    'id': 4,
                    'type': 'yes_no',
                    'question': 'Have you taken any medication or treatment for this condition?',
                    'required': False
                },
                {
                    'id': 5,
                    'type': 'text',
                    'question': 'Are you currently taking any medications? If yes, please list them.',
                    'required': False
                },
                {
                    'id': 6,
                    'type': 'yes_no',
                    'question': 'Do you have any allergies to medications?',
                    'required': True
                },
                {
                    'id': 7,
                    'type': 'text',
                    'question': 'Is there anything else you would like the doctor to know before your appointment?',
                    'required': False
                }
            ],
            'preparation_notes': 'Please bring your insurance card, a list of current medications, and any relevant medical records.',
            'urgency_notes': 'If you experience severe symptoms such as difficulty breathing, chest pain, or severe bleeding, please seek immediate medical attention.',
            'ai_generated': False,
            'generated_at': datetime.now().isoformat(),
            'model_used': 'fallback',
            'fallback_reason': 'AI service unavailable'
        }

    def generate_content_sync(self, prompt):
        """
        Generate content using Gemini AI synchronously for health insights
        """
        try:
            response = self._make_api_request(prompt)
            
            if response and 'choices' in response:
                return response['choices'][0]['message']['content']
            else:
                raise Exception("No valid response from AI service")
                
        except Exception as e:
            logging.error(f"Error generating content: {str(e)}")
            raise