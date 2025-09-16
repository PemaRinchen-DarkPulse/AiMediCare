# AiMediCare AI Service

This directory contains the Python-based AI service for generating intelligent pre-visit triage summaries using OpenRouter's Gemini AI model.

## Setup

### 1. Install Dependencies

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
GEMINI_MODEL=google/gemini-flash-1.5-8b
```

### 3. Manual Setup (Alternative)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Generate Triage Summary
```
POST /api/triage/generate
{
    "reason_for_visit": "I have been having chest pain for 2 days",
    "additional_notes": "Pain gets worse when I exercise"
}
```

### Service Status
```
GET /api/triage/status
```

## Response Format

The AI service returns structured triage data:

```json
{
    "success": true,
    "data": {
        "medical_category": "cardiology",
        "urgency_level": 4,
        "key_symptoms": ["chest pain", "exercise-induced pain"],
        "suggested_specialty": "cardiology",
        "requires_immediate_attention": true,
        "preparation_notes": "Patient reports chest pain worsening with exercise...",
        "patient_instructions": "Please avoid strenuous activity before appointment",
        "estimated_duration": "30-45 minutes",
        "recommended_tests": ["ECG", "cardiac enzymes"],
        "ai_confidence": 0.85,
        "risk_factors": ["cardiac risk factors present"]
    }
}
```

## Urgency Levels

- 1: Routine (can wait weeks)
- 2: Non-urgent (can wait days)  
- 3: Moderate (24-48 hours)
- 4: Urgent (same day)
- 5: Emergency (immediate attention)

## Error Handling

The service includes comprehensive error handling and fallback mechanisms:
- If AI service fails, returns rule-based fallback analysis
- Validates all required fields in responses
- Provides detailed error messages for debugging