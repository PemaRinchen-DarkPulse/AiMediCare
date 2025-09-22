import os
import tempfile
import logging
from typing import Dict, Any, Optional
import requests
from PIL import Image
import pytesseract
import pdf2image
from pypdf import PdfReader
import io

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        """Initialize OCR service with Tesseract configuration"""
        # Configure Tesseract path if needed (adjust for your system)
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # OCR configuration for better medical document processing
        self.tesseract_config = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,()/:- '
        
    def extract_text_from_url(self, file_url: str) -> Dict[str, Any]:
        """
        Extract text from a file URL (supports PDF and images)
        
        Args:
            file_url: URL of the file to process
            
        Returns:
            Dictionary with extracted text and metadata
        """
        try:
            # Download the file
            response = requests.get(file_url, timeout=30)
            response.raise_for_status()
            
            # Determine file type from content-type or URL
            content_type = response.headers.get('content-type', '').lower()
            file_extension = os.path.splitext(file_url.lower())[1]
            
            file_content = response.content
            file_size = len(file_content)
            
            # Process based on file type
            if 'pdf' in content_type or file_extension == '.pdf':
                return self._extract_from_pdf(file_content, file_size)
            elif any(img_type in content_type for img_type in ['image/', 'jpeg', 'png', 'jpg', 'tiff']) or \
                 file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
                return self._extract_from_image(file_content, file_size)
            else:
                raise ValueError(f"Unsupported file type: {content_type} or {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from URL {file_url}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'metadata': {}
            }
    
    def _extract_from_pdf(self, file_content: bytes, file_size: int) -> Dict[str, Any]:
        """Extract text from PDF using PyPDF2 and OCR fallback"""
        try:
            extracted_text = ""
            metadata = {
                'file_type': 'pdf',
                'file_size': file_size,
                'pages_processed': 0,
                'extraction_method': 'hybrid'
            }
            
            # First try to extract text directly from PDF
            try:
                pdf_reader = PdfReader(io.BytesIO(file_content))
                direct_text = ""
                
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():
                        direct_text += f"\n--- Page {page_num + 1} ---\n{page_text}"
                
                metadata['pages_processed'] = len(pdf_reader.pages)
                
                # If we got reasonable text directly, use it
                if len(direct_text.strip()) > 100:  # Arbitrary threshold
                    extracted_text = direct_text
                    metadata['extraction_method'] = 'direct'
                else:
                    # Fall back to OCR if direct extraction didn't yield much text
                    extracted_text = self._ocr_pdf_pages(file_content)
                    metadata['extraction_method'] = 'ocr'
                    
            except Exception as e:
                logger.warning(f"Direct PDF text extraction failed, using OCR: {str(e)}")
                extracted_text = self._ocr_pdf_pages(file_content)
                metadata['extraction_method'] = 'ocr'
            
            return {
                'success': True,
                'extracted_text': extracted_text.strip(),
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'metadata': {'file_type': 'pdf', 'file_size': file_size}
            }
    
    def _ocr_pdf_pages(self, file_content: bytes) -> str:
        """Convert PDF pages to images and run OCR"""
        try:
            # Convert PDF to images
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
                temp_pdf.write(file_content)
                temp_pdf_path = temp_pdf.name
            
            try:
                # Convert PDF pages to images
                images = pdf2image.convert_from_path(temp_pdf_path, dpi=300, first_page=1, last_page=5)  # Limit to first 5 pages
                
                extracted_text = ""
                for page_num, image in enumerate(images):
                    # Run OCR on each page
                    page_text = pytesseract.image_to_string(image, config=self.tesseract_config)
                    if page_text.strip():
                        extracted_text += f"\n--- Page {page_num + 1} ---\n{page_text}"
                
                return extracted_text
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_pdf_path):
                    os.unlink(temp_pdf_path)
                    
        except Exception as e:
            logger.error(f"Error in OCR PDF processing: {str(e)}")
            return f"OCR processing failed: {str(e)}"
    
    def _extract_from_image(self, file_content: bytes, file_size: int) -> Dict[str, Any]:
        """Extract text from image using OCR"""
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(file_content))
            
            # Enhance image for better OCR results
            image = self._enhance_image_for_ocr(image)
            
            # Run OCR
            extracted_text = pytesseract.image_to_string(image, config=self.tesseract_config)
            
            metadata = {
                'file_type': 'image',
                'file_size': file_size,
                'image_dimensions': image.size,
                'extraction_method': 'ocr'
            }
            
            return {
                'success': True,
                'extracted_text': extracted_text.strip(),
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'metadata': {'file_type': 'image', 'file_size': file_size}
            }
    
    def _enhance_image_for_ocr(self, image: Image.Image) -> Image.Image:
        """Enhance image quality for better OCR results"""
        try:
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            # Resize if image is too small (OCR works better on larger images)
            width, height = image.size
            if width < 1000 or height < 1000:
                scale_factor = max(1000/width, 1000/height)
                new_size = (int(width * scale_factor), int(height * scale_factor))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            return image
            
        except Exception as e:
            logger.warning(f"Image enhancement failed, using original: {str(e)}")
            return image
    
    def extract_text_from_file_path(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text from a local file path
        
        Args:
            file_path: Path to the local file
            
        Returns:
            Dictionary with extracted text and metadata
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            file_size = os.path.getsize(file_path)
            file_extension = os.path.splitext(file_path.lower())[1]
            
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            if file_extension == '.pdf':
                return self._extract_from_pdf(file_content, file_size)
            elif file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
                return self._extract_from_image(file_content, file_size)
            else:
                raise ValueError(f"Unsupported file extension: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from file {file_path}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'metadata': {}
            }
    
    def validate_medical_document(self, extracted_text: str) -> Dict[str, Any]:
        """
        Validate if the extracted text appears to be from a medical document
        
        Args:
            extracted_text: Text extracted from document
            
        Returns:
            Dictionary with validation results
        """
        medical_keywords = [
            'patient', 'doctor', 'physician', 'laboratory', 'test', 'result',
            'blood', 'urine', 'sample', 'specimen', 'analysis', 'report',
            'normal', 'abnormal', 'reference', 'range', 'value', 'level',
            'diagnosis', 'clinical', 'medical', 'health', 'mg/dl', 'mmol/l',
            'count', 'hemoglobin', 'glucose', 'cholesterol', 'creatinine'
        ]
        
        text_lower = extracted_text.lower()
        keyword_matches = sum(1 for keyword in medical_keywords if keyword in text_lower)
        
        # Basic validation criteria
        has_numbers = bool(re.search(r'\d+', extracted_text))
        has_medical_units = bool(re.search(r'(mg/dl|mmol/l|g/dl|µg/ml|iu/l|%)', text_lower))
        
        confidence = min(1.0, keyword_matches / 10.0)  # Normalize to 0-1
        
        return {
            'is_likely_medical': keyword_matches >= 3 and has_numbers,
            'confidence': confidence,
            'keyword_matches': keyword_matches,
            'has_numbers': has_numbers,
            'has_medical_units': has_medical_units,
            'text_length': len(extracted_text)
        }