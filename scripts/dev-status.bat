@echo off
echo 🔍 PeerFact Development Status Check
echo.

echo 📊 Service Status:
echo ==================

REM Check MongoDB Docker container
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=peerfact-mongo" 2>nul
if %errorlevel% neq 0 (
    echo ❌ MongoDB: Not running
) else (
    echo ✅ MongoDB: Running on port 27017
)

REM Check if backend is running (try to curl health endpoint)
curl -s http://localhost:8001/api >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend: Not responding on port 8001
) else (
    echo ✅ Backend: Running on port 8001
)

REM Check if frontend is running
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend: Not responding on port 3000
) else (
    echo ✅ Frontend: Running on port 3000
)

echo.
echo 🌐 URLs:
echo ========
echo Frontend:     http://localhost:3000
echo Backend API:  http://localhost:8001/docs
echo MongoDB UI:   http://localhost:8081
echo.

echo 📂 Project Structure:
echo ====================
echo Backend:      Python %cd%\backend
echo Frontend:     Node.js %cd%\frontend
echo Database:     Docker MongoDB
echo.

pause