@echo off
echo 🚀 Starting PeerFact Full-Stack Development...
echo.

REM Check if MongoDB is running
docker ps | findstr peerfact-mongo >nul
if %errorlevel% neq 0 (
    echo 🐳 Starting MongoDB...
    docker-compose up -d mongodb
    echo ⏳ Waiting for MongoDB to initialize...
    timeout /t 3 /nobreak >nul
)

echo 🐍 Starting Backend (FastAPI)...
start "PeerFact Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python server.py"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo 🖥️ Starting Frontend (Vite)...
start "PeerFact Frontend" cmd /k "cd frontend && yarn dev"

echo.
echo 🎉 PeerFact is starting up!
echo.
echo 🌐 Open these URLs in your browser:
echo   • Frontend: http://localhost:3000
echo   • Backend API: http://localhost:8001/docs
echo   • MongoDB Admin: http://localhost:8081
echo.
echo 💡 To stop services:
echo   • Close the terminal windows
echo   • Run: scripts\stop-windows.bat
echo.
pause