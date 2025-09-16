# AI-Powered Pre-Visit Triage System

## Overview

This implementation adds an AI-powered pre-visit triage system to AiMediCare that automatically generates intelligent triage summaries from patient appointment reasons using OpenRouter's Gemini AI model.

## System Architecture

```
Frontend (React)
     ↓
Node.js Backend (Express)
     ↓
Python AI Service (Flask + OpenRouter Gemini)
     ↓
MongoDB (PrevisitTriage Collection)
```

## Setup Instructions

### 1. AI Service Setup (Python)

```bash
# Navigate to AI service directory
cd ai_service

# Install dependencies (Windows)
start.bat

# Or manually:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
# Edit .env file with your OpenRouter API key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Start the AI service
python app.py
```

### 2. Backend Setup (Node.js)

```bash
# Navigate to server directory
cd server

# Ensure environment variables are set
# Add to .env file:
AI_SERVICE_URL=http://localhost:8001

# The PrevisitTriage model is automatically loaded
# Routes are registered in index.js

# Start backend (if not already running)
npm start
```

### 3. Frontend Setup (React)

The triage components are located in `client/src/components/triage/`:
- `TriageDisplay.jsx` - Full triage information display
- `TriageSummary.jsx` - Compact triage summary
- `TriageList.jsx` - List of triage records

Services are in `client/src/services/previsitTriageService.js`.

## How It Works

### 1. Appointment Booking
- Patient fills out appointment form with "Reason for Visit"
- Form already exists and captures the required data

### 2. AI Triage Generation
- After appointment creation, system automatically calls AI service
- Python service uses OpenRouter Gemini to analyze the reason
- AI generates structured triage data including:
  - Medical category
  - Urgency level (1-5)
  - Key symptoms
  - Preparation notes
  - Recommended tests
  - Risk factors

### 3. Data Storage
- Triage data stored in new `PrevisitTriage` MongoDB collection
- Links to appointment, patient, and doctor
- Includes metadata about AI confidence and generation method

### 4. Display & Review
- Doctors can view triage information before appointments
- Patients can see their triage summaries
- Doctors can mark triage as reviewed with notes

## API Endpoints

### AI Service (Python - Port 8001)
- `GET /api/health` - Health check
- `POST /api/triage/generate` - Generate triage summary
- `GET /api/triage/status` - Service status

### Backend (Node.js - Port 5000)
- `GET /api/previsit-triage/appointment/:id` - Get triage by appointment
- `GET /api/previsit-triage/patient` - Get patient's triage data
- `GET /api/previsit-triage/doctor` - Get doctor's triage data
- `GET /api/previsit-triage/urgent` - Get urgent cases
- `POST /api/previsit-triage/generate/:id` - Manually trigger generation
- `PUT /api/previsit-triage/:id` - Update triage
- `POST /api/previsit-triage/:id/review` - Mark as reviewed
- `GET /api/previsit-triage/stats` - Get statistics

## Testing the System

### 1. Test AI Service
```bash
# Test health endpoint
curl http://localhost:8001/api/health

# Test triage generation
curl -X POST http://localhost:8001/api/triage/generate \
  -H "Content-Type: application/json" \
  -d '{"reason_for_visit": "I have been having chest pain for 2 days", "additional_notes": "Pain gets worse when I exercise"}'
```

### 2. Test End-to-End Workflow
1. Start all services (AI service, backend, frontend)
2. Book an appointment with a detailed reason for visit
3. Check MongoDB for PrevisitTriage collection entry
4. View triage information in doctor interface
5. Mark triage as reviewed

### 3. Test Error Scenarios
- Stop AI service and book appointment (should use fallback)
- Test with various appointment reasons
- Test review functionality

## Error Handling & Fallback

- If AI service is unavailable, system uses rule-based fallback
- Fallback analyzes keywords to determine urgency and category
- All errors are logged in the triage record
- System continues to function even if AI fails

## Data Model

### PrevisitTriage Schema
```javascript
{
  appointmentId: ObjectId,     // Links to appointment
  patientId: ObjectId,         // Patient reference  
  doctorId: ObjectId,          // Doctor reference
  reasonForVisit: String,      // Original reason
  additionalNotes: String,     // Additional notes
  medicalCategory: String,     // AI-determined category
  urgencyLevel: Number,        // 1-5 urgency scale
  keySymptoms: [String],       // Extracted symptoms
  suggestedSpecialty: String,  // Recommended specialty
  requiresImmediateAttention: Boolean,
  preparationNotes: String,    // For healthcare provider
  patientInstructions: String, // For patient
  estimatedDuration: String,   // Appointment duration
  recommendedTests: [String],  // Suggested tests
  riskFactors: [String],       // Risk factors
  aiConfidence: Number,        // AI confidence (0-1)
  generatedAt: String,         // Generation method
  modelUsed: String,           // AI model used
  status: String,              // pending/generated/reviewed
  reviewedBy: ObjectId,        // Doctor who reviewed
  reviewedAt: Date,            // Review date
  reviewNotes: String,         // Review notes
  errors: [Object],            // Error log
  version: Number              // Version control
}
```

## Security Features

- All endpoints require authentication
- Role-based access control (patients see their data, doctors see their patients)
- API keys stored in environment variables
- Input validation and sanitization
- Error information sanitized in responses

## Future Enhancements

- Multi-language support
- Integration with medical knowledge bases
- Machine learning model training on triage outcomes
- Real-time notifications for urgent cases
- Batch processing for multiple appointments

## Troubleshooting

### AI Service Not Starting
- Check Python version (3.11+ required)
- Verify OpenRouter API key in .env
- Check port 8001 availability

### Backend Errors
- Verify AI_SERVICE_URL in server/.env
- Check MongoDB connection
- Ensure PrevisitTriage routes are registered

### Frontend Issues
- Import triage components from components/triage
- Use previsitTriageService for API calls
- Check authentication tokens

## Monitoring & Maintenance

- Monitor AI service health via /api/health endpoint
- Track triage generation success rates
- Review AI confidence scores for quality assessment
- Monitor fallback usage for AI service availability
- Regular review of triage accuracy by medical staff

## Cost Considerations

- OpenRouter Gemini charges per API call
- Implement rate limiting if needed
- Monitor API usage in OpenRouter dashboard
- Consider caching for similar appointment reasons

This implementation provides a robust, scalable AI-powered triage system that enhances patient care preparation while maintaining reliability through comprehensive error handling and fallback mechanisms.