#!/bin/bash

# PeerFact Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 PeerFact Development Setup"
echo "==============================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_NODE_VERSION="18.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_NODE_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION found"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+ from https://python.org/"
    exit 1
fi

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo "✅ Python $PYTHON_VERSION found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker from https://docker.com/"
    exit 1
fi

echo "✅ Docker found"

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo "📦 Installing Yarn..."
    npm install -g yarn
fi

echo "✅ Yarn found"

# Start MongoDB
echo ""
echo "🐳 Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Install backend dependencies
echo ""
echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
yarn install
cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 To start development:"
echo "   • All services: ./start-dev.sh"
echo "   • Backend only: cd backend && python server.py"
echo "   • Frontend only: cd frontend && yarn dev"
echo ""
echo "🌐 URLs:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8001/api"
echo "   • MongoDB Admin: http://localhost:8081 (admin/admin123)"
echo ""
echo "📖 For VSCode development, see VSCODE_DEVELOPMENT.md"