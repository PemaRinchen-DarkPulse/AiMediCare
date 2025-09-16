@echo off

REM AI-Powered Triage System Test Script for Windows

echo 🏥 AiMediCare AI Triage System Test
echo ==================================

REM Test 1: AI Service Health Check
echo.
echo 1. Testing AI Service Health...
curl -s http://localhost:8001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ AI Service is running
) else (
    echo ❌ AI Service is not responding
    echo    Make sure to start: cd ai_service ^&^& python app.py
)

REM Test 2: Backend Health Check
echo.
echo 2. Testing Backend Service...
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend Service is running
) else (
    echo ❌ Backend Service is not responding
    echo    Make sure to start: cd server ^&^& npm start
)

REM Test 3: Frontend Health Check
echo.
echo 3. Testing Frontend Service...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend Service is running
) else (
    echo ❌ Frontend Service is not responding
    echo    Make sure to start: cd client ^&^& npm run dev
)

REM Test 4: Check Required Files
echo.
echo 4. Checking Required Files...

if exist "ai_service\app.py" (
    echo ✅ ai_service\app.py exists
) else (
    echo ❌ ai_service\app.py missing
)

if exist "ai_service\.env" (
    echo ✅ ai_service\.env exists
) else (
    echo ❌ ai_service\.env missing
)

if exist "server\models\PrevisitTriage.js" (
    echo ✅ server\models\PrevisitTriage.js exists
) else (
    echo ❌ server\models\PrevisitTriage.js missing
)

if exist "server\controllers\previsitTriageController.js" (
    echo ✅ server\controllers\previsitTriageController.js exists
) else (
    echo ❌ server\controllers\previsitTriageController.js missing
)

if exist "server\routes\previsitTriageRoutes.js" (
    echo ✅ server\routes\previsitTriageRoutes.js exists
) else (
    echo ❌ server\routes\previsitTriageRoutes.js missing
)

if exist "server\utils\aiServiceClient.js" (
    echo ✅ server\utils\aiServiceClient.js exists
) else (
    echo ❌ server\utils\aiServiceClient.js missing
)

if exist "client\src\services\previsitTriageService.js" (
    echo ✅ client\src\services\previsitTriageService.js exists
) else (
    echo ❌ client\src\services\previsitTriageService.js missing
)

if exist "client\src\components\triage\TriageDisplay.jsx" (
    echo ✅ client\src\components\triage\TriageDisplay.jsx exists
) else (
    echo ❌ client\src\components\triage\TriageDisplay.jsx missing
)

REM Test 5: Check Environment Variables
echo.
echo 5. Checking Environment Variables...

if exist "ai_service\.env" (
    findstr /C:"OPENROUTER_API_KEY" ai_service\.env >nul
    if %errorlevel% equ 0 (
        echo ✅ OPENROUTER_API_KEY configured in ai_service\.env
    ) else (
        echo ❌ OPENROUTER_API_KEY missing in ai_service\.env
    )
)

if exist "server\.env" (
    findstr /C:"AI_SERVICE_URL" server\.env >nul
    if %errorlevel% equ 0 (
        echo ✅ AI_SERVICE_URL configured in server\.env
    ) else (
        echo ❌ AI_SERVICE_URL missing in server\.env
    )
)

echo.
echo Test completed! 🎉
echo.
echo Next Steps:
echo 1. If any services are down, start them using the commands shown above
echo 2. If AI generation failed, add your OpenRouter API key to ai_service\.env
echo 3. Book a test appointment to verify end-to-end functionality
echo 4. Check MongoDB for PrevisitTriage collection entries

pause