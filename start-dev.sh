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
    echo "🔄 Starting MongoDB..."
    sudo supervisorctl start mongodb
    sleep 3
fi

# Check Backend
if check_port 8001; then
    echo "✅ Backend running on port 8001"
else
    echo "🔄 Starting backend..."
    sudo supervisorctl start backend
    sleep 2
fi

# Check Frontend  
if check_port 3000; then
    echo "✅ Frontend running on port 3000"
else
    echo "🔄 Starting frontend..."
    sudo supervisorctl start frontend
    sleep 2
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

# Show final status
echo ""
echo "📊 Service Status:"
sudo supervisorctl status

echo ""
echo "✨ All services are running!"
echo "💡 To stop services: sudo supervisorctl stop all"
echo "💡 To restart: sudo supervisorctl restart all"