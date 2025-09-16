# 🏥 AiMediCare - Intelligent Triage System

An advanced telehealth platform with AI-powered triage question generation for healthcare providers in Bhutan and beyond.

## 🚀 New Features: AI-Powered Intelligent Triage

This enhanced version introduces a sophisticated AI/ML system for generating personalized triage questions that help healthcare providers better understand patient conditions before appointments.

### ✨ Key AI Features

- **🤖 Intelligent Question Generation**: AI analyzes appointment reasons to generate contextually relevant triage questions
- **🔄 Fallback System**: Robust fallback to pre-defined questions when AI confidence is low
- **🌍 Multilingual Support**: English + Dzongkha language support for Bhutanese context
- **📊 Confidence Scoring**: AI confidence tracking for quality assurance
- **⚡ Real-time Analysis**: Instant appointment reason analysis and categorization
- **🛡️ Safety First**: Medical safety checks and emergency detection

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Node.js API    │────│  Python AI/ML   │
│   (Frontend)    │    │   (Backend)     │    │    Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                         ┌─────────────────┐    ┌─────────────────┐
                         │     MongoDB     │    │   OpenAI API    │
                         │   (Database)    │    │ (AI Provider)   │
                         └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB** 7.0+
- **Docker** and Docker Compose (optional)
- **OpenAI API Key** (for AI features)

## 🛠️ Installation & Setup

### Method 1: Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/PemaRinchen-DarkPulse/AiMediCare.git
cd AiMediCare
```

#### 2. Setup Python AI Service
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env file with your OpenAI API key and configuration
```

#### 3. Setup Node.js Backend
```bash
cd ../server

# Install dependencies
npm install

# Add environment variables to your .env file
echo "AI_SERVICE_URL=http://localhost:8001" >> .env
echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env
```

#### 4. Setup React Frontend
```bash
cd ../client

# Install dependencies
npm install

# Add AI service URL to your .env
echo "VITE_AI_SERVICE_URL=http://localhost:8001" >> .env
```

#### 5. Start Services

**Terminal 1 - AI Service:**
```bash
cd ai-service
python start.py
# Service runs on http://localhost:8001
```

**Terminal 2 - Backend:**
```bash
cd server
npm run server
# API runs on http://localhost:5000
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Method 2: Docker Setup

#### 1. Setup Environment
```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

#### 2. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### 3. Access Services
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8001
- **AI Docs**: http://localhost:8001/docs

## 🔧 Configuration

### AI Service Configuration (.env)
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo

# Service Configuration
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8001
AI_SERVICE_ENV=development

# Backend Integration
BACKEND_URL=http://localhost:5000

# Language Support
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,dz
CONFIDENCE_THRESHOLD=0.7
```

### Backend Configuration
```env
# Add to existing .env
AI_SERVICE_URL=http://localhost:8001
```

## 🎯 Usage

### For Patients

1. **Book Appointment**: Describe your symptoms/reason for visit
2. **AI Analysis**: System analyzes your input and generates relevant questions
3. **Complete Triage**: Answer the personalized pre-visit questionnaire
4. **Attend Appointment**: Doctor receives your responses for better preparation

### For Healthcare Providers

1. **Review Triage**: Access AI-generated patient responses before appointments
2. **Analyze Insights**: View AI analysis of patient conditions and urgency levels
3. **Manage Questions**: Review and customize AI-generated question sets
4. **Monitor Quality**: Check AI confidence scores and generation methods

### AI Service Features

#### Generate Triage Questions
```bash
POST /generate-triage
{
  "appointment_reason": "I have been having chest pain",
  "additional_notes": "Pain started yesterday evening",
  "language": "en",
  "use_ai": true,
  "max_questions": 5
}
```

#### Analyze Appointment Reason
```bash
POST /analyze-reason
{
  "reason": "Severe headache for 3 days",
  "notes": "Getting worse, affecting vision"
}
```

#### Health Check
```bash
GET /health
```

## 🏥 Fallback System

The system includes a robust fallback mechanism:

1. **AI Generation**: Primary method using OpenAI API
2. **Fallback Questions**: Pre-defined medical questionnaires by category
3. **Emergency Fallback**: Basic questions if all else fails
4. **Quality Assurance**: Confidence scoring to ensure question relevance

### Fallback Categories
- General symptoms assessment
- Pain evaluation
- Vital signs monitoring
- Medication history
- Allergy information
- Emergency symptoms detection
- Mental health screening

## 🌍 Multilingual Support

### Supported Languages
- **English** (en): Full AI and fallback support
- **Dzongkha** (dz): Fallback questions and UI support

### Language Features
- Auto-detection of appointment language
- Culturally appropriate questions for Bhutanese context
- Medical terminology translation
- Emergency phrase recognition

## 📊 Monitoring & Analytics

### AI Service Metrics
- Question generation success rate
- AI confidence scores
- Processing times
- Fallback usage patterns
- Language distribution

### Quality Assurance
- Medical safety validation
- Question relevance scoring
- Emergency detection accuracy
- User feedback integration

## 🔒 Security & Privacy

### Data Protection
- All medical data encrypted in transit and at rest
- HIPAA-compliant data handling
- No patient data stored in AI service logs
- Secure API authentication

### AI Safety
- Medical safety validation for all generated questions
- Emergency symptom detection and escalation
- Human oversight capabilities
- Audit trail for all AI decisions

## 🧪 Testing

### Run AI Service Tests
```bash
cd ai-service
pytest tests/ -v
```

### Run Backend Tests
```bash
cd server
npm test
```

### Run Frontend Tests
```bash
cd client
npm run test
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **AI Service**: Deploy on cloud with appropriate scaling
4. **Backend**: Deploy on Node.js hosting service
5. **Frontend**: Build and deploy to CDN

### Performance Optimization

- **AI Service**: Use Redis caching for common questions
- **Database**: Index frequently queried fields
- **Frontend**: Implement code splitting and lazy loading
- **CDN**: Serve static assets from CDN

## 📝 API Documentation

### AI Service API
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Backend API
- **Base URL**: http://localhost:5000/api
- **Authentication**: Bearer token required
- **Triage Endpoints**: `/api/triage/*`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**AI Service Not Starting:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip install -r requirements.txt

# Check OpenAI API key
echo $OPENAI_API_KEY
```

**Backend Connection Issues:**
```bash
# Check AI service URL
curl http://localhost:8001/health

# Check environment variables
cat server/.env | grep AI_SERVICE_URL
```

### Get Help
- 📧 Email: support@aimedicare.com
- 🐛 Issues: [GitHub Issues](https://github.com/PemaRinchen-DarkPulse/AiMediCare/issues)
- 📖 Documentation: [Wiki](https://github.com/PemaRinchen-DarkPulse/AiMediCare/wiki)

---

Made with ❤️ for healthcare providers in Bhutan and worldwide 🏥🌍