@echo off
echo 🚀 Setting up PeerFact for Windows Development...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop from https://docker.com
    pause
    exit /b 1
)

REM Check if Yarn is installed
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Yarn globally...
    npm install -g yarn
)

echo ✅ All prerequisites found!
echo.

echo 🐍 Setting up Python virtual environment...
cd backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
yarn install
cd ..

echo 🐳 Starting MongoDB with Docker...
docker-compose up -d mongodb

echo ⏳ Waiting for MongoDB to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Setup complete! 
echo.
echo 📋 Next steps:
echo   1. Open VSCode: code .
echo   2. Install recommended extensions when prompted
echo   3. Press F5 to start full-stack development
echo   4. Or run: scripts\start-windows.bat
echo.
echo 🌐 Your app will be available at:
echo   • Frontend: http://localhost:3000
echo   • Backend API: http://localhost:8001/docs
echo   • MongoDB Admin: http://localhost:8081 (admin/admin123)
echo.
pause