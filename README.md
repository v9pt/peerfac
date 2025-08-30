# PeerFact - Decentralized Fact Checking Platform

A Reddit-style decentralized fact-checking platform built with React (Vite) + FastAPI + MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- MongoDB running locally (or MongoDB Atlas connection)

### Frontend Development

```bash
cd frontend
yarn install
yarn dev
```

The frontend will be available at `http://localhost:3000`

### Backend Development

```bash
cd backend
# Install with the correct index for emergentintegrations
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
python server.py
```

The backend API will be available at `http://localhost:8001`

## 🛠 VSCode Development Setup

1. **Clone and Install**:
   ```bash
   git clone <your-repo>
   cd peerfact
   
   # Install frontend dependencies
   cd frontend
   yarn install
   
   # Install backend dependencies
   cd ../backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   - Copy `frontend/.env.local` and adjust `VITE_BACKEND_URL` if needed
   - Set up `backend/.env` with your MongoDB connection string:
     ```
     MONGO_URL=mongodb://localhost:27017/peerfact
     EMERGENT_LLM_KEY=your_ai_key_here_optional
     ```

3. **Run in Development**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python server.py
   
   # Terminal 2 - Frontend  
   cd frontend
   yarn dev
   ```

4. **VSCode Extensions** (Recommended):
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
