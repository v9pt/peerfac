@echo off
echo 🛑 Stopping PeerFact services...

REM Kill Node.js processes (Vite)
taskkill /f /im node.exe >nul 2>&1

REM Kill Python processes (FastAPI)
taskkill /f /im python.exe >nul 2>&1

REM Stop MongoDB Docker container
docker-compose down

echo ✅ All services stopped.
pause