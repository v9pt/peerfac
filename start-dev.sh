#!/bin/bash

# PeerFact Development Startup Script
echo "🚀 Starting PeerFact Development Environment..."

# Check if in VSCode
if [ -n "$VSCODE_PID" ]; then
    echo "✅ Running in VSCode environment"
else
    echo "💡 Tip: Open this project in VSCode for better development experience"
    echo "   Run: code /app"
fi

# Function to check if port is in use
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
}

echo ""
echo "🔍 Checking services..."

# Check MongoDB
if check_port 27017; then
    echo "✅ MongoDB running on port 27017"
else
    echo "❌ MongoDB not running on port 27017"
    echo "   Starting MongoDB..."
    sudo supervisorctl start mongodb
fi

# Check Backend
if check_port 8001; then
    echo "✅ Backend running on port 8001"
else
    echo "🔄 Starting backend..."
    cd /app/backend && python server.py &
    BACKEND_PID=$!
    echo "   Backend started with PID: $BACKEND_PID"
fi

# Check Frontend
if check_port 3000; then
    echo "✅ Frontend running on port 3000"
else
    echo "🔄 Starting frontend..."
    cd /app/frontend && yarn dev &
    FRONTEND_PID=$!
    echo "   Frontend started with PID: $FRONTEND_PID"
fi

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo "   API Documentation: http://localhost:8001/docs"

echo ""
echo "📖 For detailed VSCode setup, see: VSCODE_DEVELOPMENT.md"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait