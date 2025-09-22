import requests
import json
import re
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DiagnosticAnalysisService:
    def __init__(self, gemini_service):
        """
        Initialize the diagnostic analysis service
        
        Args:
            gemini_service: Instance of GeminiService (wrapper) for AI analysis
        """
        self.gemini_service = gemini_service
        
    def analyze_diagnostic_report(self, ocr_text: str, test_type: str = None, 
                                findings: str = None) -> Dict[str, Any]:
        """
        Analyze diagnostic test report using AI
        
        Args:
            ocr_text: Text extracted from the diagnostic report via OCR
            test_type: Type of diagnostic test (optional)
            findings: Additional findings from the report (optional)
            
        Returns:
            Dictionary containing structured analysis results
        """
        try:
            # Create comprehensive prompt for Gemini
            analysis_prompt = self._create_analysis_prompt(ocr_text, test_type, findings)
            
            # Get AI analysis from Gemini
            ai_response = self.gemini_service.generate_response(analysis_prompt)
            
            # Parse and structure the AI response
            structured_result = self._parse_ai_response(ai_response)
            
            return {
                'success': True,
                'data': structured_result
            }
            
        except Exception as e:
            logger.error(f"Error analyzing diagnostic report: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': None
            }
    
    def _create_analysis_prompt(self, ocr_text: str, test_type: str = None, 
                              findings: str = None) -> str:
        """Create a comprehensive prompt for diagnostic analysis"""
        
        prompt = f"""
You are a medical AI assistant specializing in diagnostic test analysis. Please analyze the following diagnostic report and provide a structured response.

DIAGNOSTIC REPORT TEXT:
{ocr_text}

ADDITIONAL CONTEXT:
- Test Type: {test_type or 'Not specified'}
- Clinical Findings: {findings or 'Not provided'}

INSTRUCTIONS:
Please provide a comprehensive analysis in the following JSON format:

{{
  "extractedText": "cleaned and formatted version of the OCR text",
  "structuredData": {{
    "testValues": [
      {{
        "parameter": "test parameter name",
        "value": "measured value",
        "unit": "unit of measurement",
        "referenceRange": "normal reference range",
        "isAbnormal": true/false
      }}
    ],
    "patientInfo": {{
      "name": "patient name if found",
      "age": "patient age if found",
      "gender": "patient gender if found",
      "testDate": "test date if found"
    }},
    "laboratoryInfo": {{
      "name": "lab name if found",
      "address": "lab address if found",
      "phone": "lab phone if found"
    }}
  }},
  "abnormalFindings": [
    {{
      "parameter": "abnormal parameter name",
      "value": "abnormal value",
      "severity": "low/moderate/high/critical",
      "description": "detailed description of the abnormality",
      "recommendation": "clinical recommendation for this finding"
    }}
  ],
  "aiSummary": "comprehensive natural language summary of the test results, highlighting key findings and their clinical significance",
  "riskAssessment": {{
    "level": "low/moderate/high/critical",
    "description": "overall risk assessment based on all findings"
  }},
  "confidence": 0.85
}}

ANALYSIS GUIDELINES:
1. Extract all numerical test values with their reference ranges
2. Identify any values outside normal ranges
3. Assess clinical significance of abnormal findings
4. Provide severity ratings: low (slightly abnormal), moderate (concerning), high (requires attention), critical (urgent)
5. Generate clear, professional language suitable for both patients and healthcare providers
6. If information is unclear or missing, indicate this appropriately
7. Confidence score should reflect how clearly the data could be extracted and analyzed

Please respond ONLY with the JSON object, no additional text.
"""
        
        return prompt
    
    def _parse_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """Parse and validate the AI response"""
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                parsed_data = json.loads(json_str)
            else:
                # If no JSON found, try parsing the entire response
                parsed_data = json.loads(ai_response)
            
            # Validate and structure the response
            structured_result = {
                'extractedText': parsed_data.get('extractedText', ''),
                'structuredData': self._validate_structured_data(parsed_data.get('structuredData', {})),
                'abnormalFindings': self._validate_abnormal_findings(parsed_data.get('abnormalFindings', [])),
                'aiSummary': parsed_data.get('aiSummary', ''),
                'riskAssessment': self._validate_risk_assessment(parsed_data.get('riskAssessment', {})),
                'confidence': max(0.0, min(1.0, float(parsed_data.get('confidence', 0.0)))),
                'aiModel': 'gemini-1.5-flash'
            }
            
            return structured_result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            # Return a basic structure with the raw response
            return {
                'extractedText': ai_response,
                'structuredData': {'testValues': [], 'patientInfo': {}, 'laboratoryInfo': {}},
                'abnormalFindings': [],
                'aiSummary': f"AI analysis completed but response formatting failed. Raw response: {ai_response[:500]}...",
                'riskAssessment': {'level': 'low', 'description': 'Unable to determine risk level due to parsing error'},
                'confidence': 0.1,
                'aiModel': 'gemini-1.5-flash'
            }
        except Exception as e:
            logger.error(f"Error parsing AI response: {str(e)}")
            raise
    
    def _validate_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean structured data"""
        return {
            'testValues': [
                {
                    'parameter': str(tv.get('parameter', '')),
                    'value': str(tv.get('value', '')),
                    'unit': str(tv.get('unit', '')),
                    'referenceRange': str(tv.get('referenceRange', '')),
                    'isAbnormal': bool(tv.get('isAbnormal', False))
                }
                for tv in data.get('testValues', [])
                if isinstance(tv, dict)
            ],
            'patientInfo': {
                'name': str(data.get('patientInfo', {}).get('name', '')),
                'age': str(data.get('patientInfo', {}).get('age', '')),
                'gender': str(data.get('patientInfo', {}).get('gender', '')),
                'testDate': str(data.get('patientInfo', {}).get('testDate', ''))
            },
            'laboratoryInfo': {
                'name': str(data.get('laboratoryInfo', {}).get('name', '')),
                'address': str(data.get('laboratoryInfo', {}).get('address', '')),
                'phone': str(data.get('laboratoryInfo', {}).get('phone', ''))
            }
        }
    
    def _validate_abnormal_findings(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and clean abnormal findings"""
        valid_severities = ['low', 'moderate', 'high', 'critical']
        
        return [
            {
                'parameter': str(finding.get('parameter', '')),
                'value': str(finding.get('value', '')),
                'severity': finding.get('severity', 'moderate') if finding.get('severity') in valid_severities else 'moderate',
                'description': str(finding.get('description', '')),
                'recommendation': str(finding.get('recommendation', ''))
            }
            for finding in findings
            if isinstance(finding, dict) and finding.get('parameter')
        ]
    
    def _validate_risk_assessment(self, assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean risk assessment"""
        valid_levels = ['low', 'moderate', 'high', 'critical']
        level = assessment.get('level', 'low')
        
        return {
            'level': level if level in valid_levels else 'low',
            'description': str(assessment.get('description', ''))
        }
    
    def extract_key_metrics(self, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key metrics for quick overview"""
        test_values = structured_data.get('testValues', [])
        
        total_tests = len(test_values)
        abnormal_tests = sum(1 for tv in test_values if tv.get('isAbnormal', False))
        
        return {
            'totalTests': total_tests,
            'abnormalTests': abnormal_tests,
            'normalTests': total_tests - abnormal_tests,
            'abnormalPercentage': round((abnormal_tests / total_tests * 100) if total_tests > 0 else 0, 1)
        }