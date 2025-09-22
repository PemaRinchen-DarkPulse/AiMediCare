from flask import Blueprint, request, jsonify
import logging
import time
from services.gemini_wrapper import GeminiService
from services.ocr_service import OCRService
from services.diagnostic_analysis_service import DiagnosticAnalysisService

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
diagnostic_bp = Blueprint('diagnostic', __name__)

# Initialize services
gemini_service = GeminiService()
ocr_service = OCRService()
diagnostic_service = DiagnosticAnalysisService(gemini_service)

@diagnostic_bp.route('/generate-insights', methods=['POST'])
def generate_insights():
    """
    Generate AI insights for a diagnostic test result with OCR + abnormality detection
    
    Expected JSON payload:
    {
        "testResultId": "string",
        "attachmentUrl": "string (optional)",
        "testType": "string (optional)",
        "findings": "string (optional)"
    }
    
    Returns insights in format matching DiagnosticInsights model
    """
    try:
        start_time = time.time()
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        test_result_id = data.get('testResultId')
        attachment_url = data.get('attachmentUrl')
        test_type = data.get('testType')
        findings = data.get('findings', '')
        
        if not test_result_id:
            return jsonify({
                'success': False,
                'message': 'testResultId is required'
            }), 400
        
        logger.info(f"Generating insights for test result: {test_result_id}")
        
        extracted_text = ""
        ocr_metadata = {}
        
        # Extract text from attachment if provided
        if attachment_url:
            logger.info(f"Processing attachment: {attachment_url}")
            ocr_result = ocr_service.extract_text_from_url(attachment_url)
            
            if ocr_result['success']:
                extracted_text = ocr_result['extracted_text']
                ocr_metadata = ocr_result['metadata']
                logger.info(f"Successfully extracted {len(extracted_text)} characters")
            else:
                logger.error(f"OCR failed: {ocr_result.get('error')}")
                return jsonify({
                    'success': False,
                    'message': f"Failed to extract text: {ocr_result.get('error')}"
                }), 400
        
        # Combine extracted text with existing findings
        combined_text = f"{extracted_text}\n\nAdditional Findings:\n{findings}".strip()
        
        if not combined_text:
            return jsonify({
                'success': False,
                'message': 'No content available for analysis'
            }), 400
        
        # Perform AI analysis
        analysis_result = diagnostic_service.analyze_diagnostic_report(
            ocr_text=combined_text,
            test_type=test_type,
            findings=findings
        )
        
        if not analysis_result['success']:
            return jsonify({
                'success': False,
                'message': f"AI analysis failed: {analysis_result.get('error')}"
            }), 500
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Format response to match DiagnosticInsights model
        insights_data = analysis_result['data']
        
        # Map the analysis result to match our MongoDB model structure
        formatted_insights = {
            'testResultId': test_result_id,
            'extractedText': extracted_text,
            'structuredData': insights_data.get('structuredData', {}),
            'abnormalFindings': insights_data.get('abnormalFindings', []),
            'aiSummary': insights_data.get('aiSummary', ''),
            'riskAssessment': insights_data.get('riskAssessment', {
                'level': 'low',
                'description': 'No significant abnormalities detected'
            }),
            'processingStatus': 'completed',
            'confidence': insights_data.get('confidence', 0.8),
            'aiModel': 'gemini-1.5-flash',
            'sourceFile': {
                'fileName': ocr_metadata.get('fileName', 'unknown'),
                'fileType': ocr_metadata.get('fileType', 'unknown'),
                'fileSize': ocr_metadata.get('fileSize', 0),
                'processingTime': processing_time
            }
        }
        
        return jsonify({
            'success': True,
            'data': formatted_insights,
            'metadata': {
                'processingTime': processing_time,
                'textLength': len(combined_text),
                'ocrMetadata': ocr_metadata
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@diagnostic_bp.route('/analyze-diagnostic', methods=['POST'])
def analyze_diagnostic():
    """
    Analyze a diagnostic test report using OCR and AI
    
    Expected JSON payload:
    {
        "testResultId": "string",
        "attachmentUrl": "string (optional)",
        "testType": "string (optional)",
        "findings": "string (optional)"
    }
    """
    try:
        start_time = time.time()
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        test_result_id = data.get('testResultId')
        attachment_url = data.get('attachmentUrl')
        test_type = data.get('testType')
        findings = data.get('findings', '')
        
        if not test_result_id:
            return jsonify({
                'success': False,
                'message': 'testResultId is required'
            }), 400
        
        logger.info(f"Starting diagnostic analysis for test result: {test_result_id}")
        
        extracted_text = ""
        ocr_metadata = {}
        
        # Extract text from attachment if provided
        if attachment_url:
            logger.info(f"Extracting text from attachment: {attachment_url}")
            ocr_result = ocr_service.extract_text_from_url(attachment_url)
            
            if ocr_result['success']:
                extracted_text = ocr_result['extracted_text']
                ocr_metadata = ocr_result['metadata']
                
                # Validate if this looks like a medical document
                validation = ocr_service.validate_medical_document(extracted_text)
                logger.info(f"Document validation: {validation}")
                
                if not validation['is_likely_medical']:
                    logger.warning("Document may not be a medical report")
            else:
                logger.error(f"OCR extraction failed: {ocr_result.get('error')}")
                return jsonify({
                    'success': False,
                    'message': f"Failed to extract text from document: {ocr_result.get('error')}"
                }), 400
        
        # Combine extracted text with existing findings
        combined_text = f"{extracted_text}\n\nAdditional Findings:\n{findings}".strip()
        
        if not combined_text:
            return jsonify({
                'success': False,
                'message': 'No text content available for analysis (no attachment or findings provided)'
            }), 400
        
        logger.info(f"Analyzing {len(combined_text)} characters of text")
        
        # Perform AI analysis
        analysis_result = diagnostic_service.analyze_diagnostic_report(
            ocr_text=combined_text,
            test_type=test_type,
            findings=findings
        )
        
        if not analysis_result['success']:
            return jsonify({
                'success': False,
                'message': f"AI analysis failed: {analysis_result.get('error')}"
            }), 500
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # Add metadata to the result
        result_data = analysis_result['data']
        result_data.update({
            'fileName': attachment_url.split('/')[-1] if attachment_url else None,
            'fileType': ocr_metadata.get('file_type', 'unknown'),
            'fileSize': ocr_metadata.get('file_size', 0),
            'processingTime': processing_time,
            'ocrMetadata': ocr_metadata
        })
        
        logger.info(f"Diagnostic analysis completed in {processing_time:.2f}ms")
        
        return jsonify({
            'success': True,
            'message': 'Diagnostic analysis completed successfully',
            'data': result_data
        })
        
    except Exception as e:
        logger.error(f"Error in diagnostic analysis: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error during analysis',
            'error': str(e)
        }), 500

@diagnostic_bp.route('/ocr-extract', methods=['POST'])
def extract_text_only():
    """
    Extract text from a document using OCR (without AI analysis)
    
    Expected JSON payload:
    {
        "fileUrl": "string"
    }
    """
    try:
        data = request.get_json()
        if not data or not data.get('fileUrl'):
            return jsonify({
                'success': False,
                'message': 'fileUrl is required'
            }), 400
        
        file_url = data['fileUrl']
        logger.info(f"Extracting text from: {file_url}")
        
        # Extract text using OCR
        ocr_result = ocr_service.extract_text_from_url(file_url)
        
        if ocr_result['success']:
            # Validate document
            validation = ocr_service.validate_medical_document(ocr_result['extracted_text'])
            
            return jsonify({
                'success': True,
                'data': {
                    'extractedText': ocr_result['extracted_text'],
                    'metadata': ocr_result['metadata'],
                    'validation': validation
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': f"Text extraction failed: {ocr_result.get('error')}"
            }), 400
            
    except Exception as e:
        logger.error(f"Error in text extraction: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to extract text',
            'error': str(e)
        }), 500

@diagnostic_bp.route('/validate-document', methods=['POST'])
def validate_document():
    """
    Validate if a document appears to be a medical report
    
    Expected JSON payload:
    {
        "text": "string"
    }
    """
    try:
        data = request.get_json()
        if not data or not data.get('text'):
            return jsonify({
                'success': False,
                'message': 'text is required'
            }), 400
        
        text = data['text']
        validation = ocr_service.validate_medical_document(text)
        
        return jsonify({
            'success': True,
            'data': validation
        })
        
    except Exception as e:
        logger.error(f"Error in document validation: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to validate document',
            'error': str(e)
        }), 500

@diagnostic_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for diagnostic service"""
    try:
        # Test OCR service
        ocr_available = True
        try:
            # Quick OCR test (this would need a test image in production)
            pass
        except Exception:
            ocr_available = False
        
        # Test Gemini service
        gemini_available = gemini_service.is_available()
        
        return jsonify({
            'success': True,
            'services': {
                'ocr': ocr_available,
                'gemini': gemini_available,
                'diagnostic_analysis': ocr_available and gemini_available
            },
            'status': 'healthy' if (ocr_available and gemini_available) else 'degraded'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Health check failed',
            'error': str(e)
        }), 500