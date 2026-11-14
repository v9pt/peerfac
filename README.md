# 🚀 PeerFact - Decentralized Fact Checking Platform

A Reddit-style decentralized fact-checking platform built with **React (Vite) + FastAPI + MongoDB**. Users can post claims, verify them with sources, and build reputation through accurate fact-checking.

## ✨ Features

- 📝 **Claim Submission** - Post text, images, videos, or links to fact-check
- 🔍 **AI-Powered Analysis** - Automatic claim classification and summarization  
- ⚖️ **Crowd Verification** - Community-driven fact-checking with sources
- 🏆 **Reputation System** - Build credibility through accurate verifications
- 🔗 **Blockchain Integration** - Immutable credibility scores (coming soon)
- 🌐 **Clean UI** - Reddit-style interface with modern design

## 🚀 Quick Start

### 🖥️ Windows Setup (Recommended)

**One-Command Setup:**
```cmd
# Open Command Prompt as Administrator
scripts\setup-windows.bat
```

**Start Development:**
```cmd
# Option 1: All services
npm run start

# Option 2: VSCode (Press F5)
code .

# Option 3: Individual services
scripts\start-windows.bat
```

**📖 Full Windows Guide:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed instructions.

### 🐧 Linux/Mac Setup

**Prerequisites:**
- Node.js 18+ 
- Python 3.8+
- Docker (for MongoDB)

**Quick Setup:**
```bash
# One-command setup
./setup-dev.sh

# Start all services
./start-dev.sh

# Validate setup
./validate-setup.sh
```

**Manual Setup:**
```bash
# Start MongoDB
docker-compose up -d mongodb

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py

# Frontend
cd frontend
yarn install
yarn dev
```

## 🌐 Access Your App

- **🖥️ Frontend**: http://localhost:3000
- **⚙️ Backend API**: http://localhost:8001/docs  
- **🐳 MongoDB Admin**: http://localhost:8081 (admin/admin123)

## 🛠️ Available Commands

```bash
npm run setup     # Complete environment setup
npm run start     # Start all services
npm run stop      # Stop all services
npm run status    # Check service status
npm run test      # Run all tests
npm run clean     # Clean dependencies and reset
```

## ⚙️ Environment Variables

The setup scripts automatically create `.env` files, but you can customize them:

**Backend (`backend/.env`)**:
```bash
# Required
MONGO_URL=mongodb://localhost:27017
DB_NAME=peerfact
SECRET_KEY=your-secure-jwt-secret

# Optional - AI Features
EMERGENT_LLM_KEY=your_emergent_key_here
OPENAI_API_KEY=your_openai_key_here

# Optional - Payments  
STRIPE_API_KEY=your_stripe_key_here
```

**Frontend (`frontend/.env`)**:
```bash
VITE_BACKEND_URL=http://localhost:8001
VITE_APP_NAME=PeerFact
```

## 🧪 Testing

```bash
npm run test
```

## 🧩 Recommended VSCode Extensions

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Python
- Prettier - Code formatter

## 🏗 Architecture

### Frontend (React + Vite)
- **Framework**: React 19 with Vite for fast development
- **Styling**: Tailwind CSS with custom glass morphism design
- **State**: React hooks for local state management
- **API**: Axios for HTTP requests

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: Optional AI analysis for claims
- **API**: RESTful API with automatic OpenAPI docs

### Database (MongoDB)
- **Collections**: users, claims, verifications
- **Features**: Reputation system, weighted voting, claim analysis

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React application
│   │   ├── App.css          # Tailwind + custom styles
│   │   └── main.jsx         # Vite entry point
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── package.json         # Dependencies and scripts
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
│
├── backend/
│   ├── server.py            # FastAPI application
│   └── requirements.txt     # Python dependencies
│
└── README.md                # This file
```

## 🌟 Features

- **Claim Submission**: Users can submit claims for fact-checking
- **AI Analysis**: Automatic claim analysis and categorization
- **Community Verification**: Users can provide evidence supporting/refuting claims  
- **Reputation System**: User reputation affects vote weight
- **Real-time Updates**: Live updates of claim verdicts
- **Responsive Design**: Works on desktop and mobile

## 🔧 Available Scripts

### Frontend
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Backend
- `python server.py` - Start FastAPI server
- View API docs at `http://localhost:8001/docs`

## 🌐 API Endpoints

### Core Endpoints
- `GET /api/` - Health check
- `POST /api/users/bootstrap` - Create anonymous user
- `POST /api/claims` - Submit new claim
- `GET /api/claims` - List all claims
- `GET /api/claims/{id}` - Get claim details
- `POST /api/claims/{id}/verify` - Add verification to claim

### Analysis Endpoints  
- `POST /api/analyze/claim` - Analyze claim text
- `GET /api/claims/{id}/verdict` - Get computed verdict

## 🚀 Deployment

The application is designed to be easily deployable to various platforms:

- **Frontend**: Can be deployed to Vercel, Netlify, or any static hosting
- **Backend**: Can be deployed to Railway, Render, or any Python hosting
- **Database**: MongoDB Atlas for managed database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
