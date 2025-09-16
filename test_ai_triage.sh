#!/bin/bash

# AI-Powered Triage System Test Script

echo "🏥 AiMediCare AI Triage System Test"
echo "=================================="

# Test 1: AI Service Health Check
echo ""
echo "1. Testing AI Service Health..."
AI_HEALTH=$(curl -s http://localhost:8001/api/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ AI Service is running"
    echo "   Response: $AI_HEALTH"
else
    echo "❌ AI Service is not responding"
    echo "   Make sure to start: cd ai_service && python app.py"
fi

# Test 2: Backend Health Check
echo ""
echo "2. Testing Backend Service..."
BACKEND_HEALTH=$(curl -s http://localhost:5000 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend Service is running"
else
    echo "❌ Backend Service is not responding"
    echo "   Make sure to start: cd server && npm start"
fi

# Test 3: Frontend Health Check
echo ""
echo "3. Testing Frontend Service..."
FRONTEND_HEALTH=$(curl -s http://localhost:5173 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Frontend Service is running"
else
    echo "❌ Frontend Service is not responding"
    echo "   Make sure to start: cd client && npm run dev"
fi

# Test 4: AI Triage Generation
echo ""
echo "4. Testing AI Triage Generation..."
TRIAGE_TEST=$(curl -s -X POST http://localhost:8001/api/triage/generate \
  -H "Content-Type: application/json" \
  -d '{"reason_for_visit": "I have been having headaches for a week", "additional_notes": "Getting worse in the morning"}' 2>/dev/null)

if [ $? -eq 0 ] && [[ $TRIAGE_TEST == *"success"* ]]; then
    echo "✅ AI Triage Generation is working"
    echo "   Generated triage data successfully"
else
    echo "❌ AI Triage Generation failed"
    echo "   Check OpenRouter API key in ai_service/.env"
fi

# Test 5: Check Required Files
echo ""
echo "5. Checking Required Files..."

FILES=(
    "ai_service/app.py"
    "ai_service/.env"
    "server/models/PrevisitTriage.js"
    "server/controllers/previsitTriageController.js"
    "server/routes/previsitTriageRoutes.js"
    "server/utils/aiServiceClient.js"
    "client/src/services/previsitTriageService.js"
    "client/src/components/triage/TriageDisplay.jsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Test 6: Check Environment Variables
echo ""
echo "6. Checking Environment Variables..."

if [ -f "ai_service/.env" ]; then
    if grep -q "OPENROUTER_API_KEY" ai_service/.env; then
        echo "✅ OPENROUTER_API_KEY configured in ai_service/.env"
    else
        echo "❌ OPENROUTER_API_KEY missing in ai_service/.env"
    fi
fi

if [ -f "server/.env" ]; then
    if grep -q "AI_SERVICE_URL" server/.env; then
        echo "✅ AI_SERVICE_URL configured in server/.env"
    else
        echo "❌ AI_SERVICE_URL missing in server/.env"
    fi
fi

echo ""
echo "Test completed! 🎉"
echo ""
echo "Next Steps:"
echo "1. If any services are down, start them using the commands shown above"
echo "2. If AI generation failed, add your OpenRouter API key to ai_service/.env"
echo "3. Book a test appointment to verify end-to-end functionality"
echo "4. Check MongoDB for PrevisitTriage collection entries"