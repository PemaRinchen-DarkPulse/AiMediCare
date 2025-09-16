# AI-Powered Pre-Visit Questionnaire System

## Overview
This system generates AI-powered, structured questionnaires for pre-visit triage using OpenRouter's Gemini 2.0 Flash model. Questionnaires are dynamically created based on the patient's reason for visit and stored in MongoDB.

## System Architecture

### Components
1. **Python Flask AI Service** (Port 8001) - Generates questionnaires using Gemini AI
2. **Node.js Express Backend** (Port 5000) - Handles questionnaire CRUD operations
3. **React Frontend** - Patient questionnaire forms and doctor review interface
4. **MongoDB Database** - Stores questionnaire data and patient responses

### AI Service Configuration
- **Model**: `google/gemini-2.0-flash-exp:free`
- **Provider**: OpenRouter API
- **Features**: Dynamic question generation, fallback support, multiple question types

## Quick Start Guide

### 1. Set Up the AI Service

#### Install Python Dependencies
```bash
cd ai_service
pip install flask flask-cors requests python-dotenv
```

#### Configure Environment
Your `.env` file is already configured with:
```bash
OPENROUTER_API_KEY=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
GEMINI_MODEL=google/gemini-2.0-flash-exp:free
FLASK_ENV=development
```

#### Start the AI Service
```bash
cd ai_service
python app.py
```
The service will start on `http://localhost:8001`

### 2. Start the Backend
```bash
cd server
npm install
npm start
```
Backend runs on `http://localhost:5000`

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

## API Endpoints

### AI Service (Port 8001)
- `POST /api/triage/generate-questionnaire` - Generate questionnaire
- `GET /api/triage/status` - Service health check

### Backend Service (Port 5000)
- `POST /api/previsit-triage/questionnaire/generate/:appointmentId` - Generate questionnaire
- `POST /api/previsit-triage/questionnaire/:triageId/submit` - Submit answers
- `GET /api/previsit-triage/questionnaire/completed` - Get completed questionnaires
- `GET /api/previsit-triage/appointment/:appointmentId` - Get questionnaire by appointment

## How It Works

### 1. Questionnaire Generation
1. Patient books appointment with "Reason for Visit"
2. System automatically calls AI service to generate questionnaire
3. AI analyzes the reason and creates 8-12 relevant questions
4. Questions include multiple types: text, multiple choice, yes/no, scale (1-10)
5. Questionnaire stored in MongoDB with urgency level and preparation notes

### 2. Patient Experience
1. Patient receives questionnaire before appointment
2. Interactive form with progress tracking
3. Real-time validation and auto-save
4. Completion percentage and estimated duration
5. Preparation notes and urgency warnings

### 3. Doctor Review
1. Doctors see completed questionnaires in dashboard
2. Organized by urgency level and completion status
3. Detailed review modal with patient responses
4. Mark questionnaires as reviewed
5. Export capabilities for medical records

## Question Types Supported

### Text Input
```json
{
  "type": "text",
  "question": "Please describe your symptoms in detail",
  "required": true
}
```

### Multiple Choice
```json
{
  "type": "multiple_choice",
  "question": "How long have you experienced this?",
  "options": ["Less than 1 day", "1-3 days", "1 week", "More than 1 month"],
  "required": true
}
```

### Yes/No
```json
{
  "type": "yes_no",
  "question": "Have you taken any medication for this condition?",
  "required": false
}
```

### Scale (1-10)
```json
{
  "type": "scale",
  "question": "Rate your pain level from 1-10",
  "required": true
}
```

## Urgency Levels
- **Low**: Routine, can wait weeks
- **Medium**: Standard appointment, within days
- **High**: Should be seen within 24-48 hours
- **Critical**: Requires immediate attention

## Frontend Components

### QuestionnaireForm.jsx
- Interactive patient questionnaire
- Progress tracking and validation
- Real-time completion percentage
- Support for all question types

### QuestionnaireList.jsx
- Doctor dashboard for reviewing completed questionnaires
- Filterable by urgency and completion status
- Detailed review modal

## Database Schema

### PrevisitTriage Collection
```javascript
{
  appointmentId: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  reasonForVisit: String,
  title: String,
  urgencyLevel: String, // Low/Medium/High/Critical
  questions: [{
    id: Number,
    type: String,
    question: String,
    required: Boolean,
    options: [String]
  }],
  answers: [{
    questionId: Number,
    answer: Mixed,
    answeredAt: Date
  }],
  isCompleted: Boolean,
  completionPercentage: Number,
  aiGenerated: Boolean,
  status: String // pending/generated/completed/reviewed
}
```

## Testing the System

### 1. Test AI Service Health
```bash
curl http://localhost:8001/api/health
```

### 2. Generate Test Questionnaire
```bash
curl -X POST http://localhost:8001/api/triage/generate-questionnaire \
  -H "Content-Type: application/json" \
  -d '{"reason_for_visit": "headache and nausea"}'
```

### 3. Expected Response
```json
{
  "success": true,
  "questionnaire": {
    "title": "Pre-Visit Questionnaire: headache and nausea",
    "urgency_level": "Medium",
    "questions": [...],
    "preparation_notes": "...",
    "urgency_notes": "..."
  }
}
```

## Troubleshooting

### AI Service Issues
1. **API Key Error**: Verify OpenRouter API key in `.env`
2. **Model Not Found**: Ensure `google/gemini-2.0-flash-exp:free` is available
3. **Timeout**: Check internet connection and OpenRouter service status

### Fallback System
If AI service fails, the system automatically uses a fallback questionnaire with generic medical questions.

### Common Issues
1. **CORS Errors**: Ensure Flask-CORS is properly configured
2. **MongoDB Connection**: Verify MongoDB is running and accessible
3. **Port Conflicts**: Check that ports 8001, 5000, 3000 are available

## Production Considerations

### Security
- Use environment variables for API keys
- Implement rate limiting on AI service
- Add request validation and sanitization
- Use HTTPS in production

### Scalability
- Consider Redis for caching questionnaires
- Implement database indexing for performance
- Add load balancing for multiple AI service instances
- Monitor OpenRouter API usage limits

### Monitoring
- Add logging for AI service requests
- Monitor questionnaire completion rates
- Track AI service response times
- Alert on service failures

## Next Steps
1. Add patient notification system
2. Implement questionnaire templates
3. Add analytics dashboard
4. Integrate with EHR systems
5. Add multi-language support