@echo off
echo 🧪 Running PeerFact Tests on Windows...
echo.

echo 🐍 Activating Python virtual environment...
cd backend
if not exist "venv" (
    echo ❌ Virtual environment not found. Run setup-windows.bat first.
    pause
    exit /b 1
)
call venv\Scripts\activate.bat

echo 🔧 Running backend tests...
python -m pytest -v ../backend_test.py --tb=short
if %errorlevel% neq 0 (
    echo ❌ Backend tests failed
    pause
    exit /b 1
)

echo ✅ Backend tests passed!
echo.

cd ..\frontend
echo 🧹 Running frontend linting...
yarn lint
if %errorlevel% neq 0 (
    echo ⚠️ Frontend linting issues found
) else (
    echo ✅ Frontend code looks good!
)

echo.
echo 🏗️ Testing frontend build...
yarn build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo ✅ Frontend build successful!
echo.

cd ..
echo 🎉 All tests completed!
echo.
pause