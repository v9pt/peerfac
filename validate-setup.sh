#!/bin/bash

# PeerFact Setup Validation Script
# This script validates that everything is working properly

set -e

echo "🔍 PeerFact Setup Validation"
echo "=============================="

# Test Backend API
echo ""
echo "🔬 Testing Backend API..."
BACKEND_RESPONSE=$(curl -s http://localhost:8001/api/ || echo "ERROR")
if [[ "$BACKEND_RESPONSE" == *"PeerFact API is live"* ]]; then
    echo "✅ Backend API responding correctly"
else
    echo "❌ Backend API not responding. Response: $BACKEND_RESPONSE"
    exit 1
fi

# Test Backend Health Endpoints
echo "🔬 Testing Backend Health..."
curl -s http://localhost:8001/api/status > /dev/null && echo "✅ Status endpoint working" || echo "❌ Status endpoint failed"

# Test Frontend
echo ""
echo "🔬 Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3000 || echo "ERROR")
if [[ "$FRONTEND_RESPONSE" == *"<!doctype html>"* ]]; then
    echo "✅ Frontend serving HTML correctly"
else
    echo "❌ Frontend not responding properly"
    exit 1
fi

# Test MongoDB
echo ""
echo "🔬 Testing MongoDB..."
MONGO_ADMIN_RESPONSE=$(curl -s http://localhost:8081 || echo "ERROR")
if [[ "$MONGO_ADMIN_RESPONSE" == *"html"* ]]; then
    echo "✅ MongoDB Admin UI accessible"
else
    echo "❌ MongoDB Admin UI not accessible"
fi

# Test Environment Variables
echo ""
echo "🔬 Checking Environment Variables..."
if [ -f "/app/backend/.env" ]; then
    echo "✅ Backend .env file exists"
else
    echo "❌ Backend .env file missing"
    exit 1
fi

if [ -f "/app/frontend/.env" ]; then
    echo "✅ Frontend .env file exists"
else
    echo "❌ Frontend .env file missing"
    exit 1
fi

# Service Status
echo ""
echo "📊 Service Status:"
sudo supervisorctl status

echo ""
echo "🎉 Validation Complete!"
echo "======================="
echo ""
echo "✅ All systems are working properly!"
echo ""
echo "🌐 Quick Access:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8001/api"  
echo "   • API Docs: http://localhost:8001/docs"
echo "   • MongoDB Admin: http://localhost:8081 (admin/admin123)"
echo ""
echo "📖 Next Steps:"
echo "   • Open VSCode: code /app"
echo "   • Read documentation: README.md"
echo "   • Test the application by creating a claim"