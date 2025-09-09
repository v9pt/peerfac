@echo off
echo 🧹 Cleaning PeerFact Development Environment...
echo.

echo 🛑 Stopping all services...
call scripts\stop-windows.bat >nul 2>&1

echo 🗑️ Cleaning frontend dependencies...
if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules"
    echo ✅ Removed frontend/node_modules
)

if exist "frontend\dist" (
    rmdir /s /q "frontend\dist"
    echo ✅ Removed frontend/dist
)

if exist "frontend\.vite" (
    rmdir /s /q "frontend\.vite"
    echo ✅ Removed frontend/.vite
)

echo 🐍 Cleaning backend virtual environment...
if exist "backend\venv" (
    rmdir /s /q "backend\venv"
    echo ✅ Removed backend/venv
)

if exist "backend\__pycache__" (
    rmdir /s /q "backend\__pycache__"
    echo ✅ Removed backend/__pycache__
)

echo 🐳 Cleaning Docker containers and volumes...
docker-compose down -v >nul 2>&1
docker system prune -f >nul 2>&1
echo ✅ Cleaned Docker resources

echo.
echo 🎉 Cleanup complete!
echo.
echo 💡 To set up again, run: scripts\setup-windows.bat
echo.
pause