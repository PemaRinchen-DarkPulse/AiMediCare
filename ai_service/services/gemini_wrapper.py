from .gemini_service import GeminiAIService
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Wrapper class for GeminiAIService to provide a consistent interface
    for diagnostic analysis
    """
    
    def __init__(self):
        self.gemini_ai = GeminiAIService()
    
    def generate_response(self, prompt: str) -> str:
        """
        Generate a response using Gemini AI
        
        Args:
            prompt: The prompt to send to Gemini
            
        Returns:
            String response from Gemini
        """
        try:
            response = self.gemini_ai._make_api_request(prompt)
            
            if response and 'choices' in response:
                return response['choices'][0]['message']['content']
            else:
                raise Exception("Invalid response format from Gemini API")
                
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise
    
    def is_available(self) -> bool:
        """
        Check if the Gemini service is available
        
        Returns:
            Boolean indicating service availability
        """
        try:
            # Simple test prompt
            test_response = self.generate_response("Hello")
            return len(test_response) > 0
        except Exception:
            return False