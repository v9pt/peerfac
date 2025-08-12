# Development Guide

## 🚀 Quick Start for VSCode

### 1. Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.9+** (for backend)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** 
- **VSCode** with recommended extensions

### 2. Clone and Setup
```bash
git clone <your-repository-url>
cd peerfact
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file with your configuration
cp .env.example .env  # if you have one, or create manually
# Add your MongoDB URL and other variables
```

**Required Environment Variables** (backend/.env):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=peerfact
CORS_ORIGINS=*
EMERGENT_LLM_KEY=your_ai_key_optional
OPENAI_API_KEY=your_openai_key_optional
```

### 4. Frontend Setup
```bash
cd frontend
yarn install

# Environment is already configured for local development
# frontend/.env.development contains VITE_BACKEND_URL=http://localhost:8001
```

### 5. Run in Development Mode

#### Option 1: Using VSCode Tasks (Recommended)
1. Open VSCode in the project root
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Tasks: Run Task"
4. Select "Start Full Stack" to run both frontend and backend

#### Option 2: Manual Terminal Setup
```bash
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend  
cd frontend
yarn dev
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 🛠 VSCode Configuration

The project includes pre-configured VSCode settings:

### Extensions (Auto-suggested)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Python
- Prettier - Code formatter
- ESLint

### Available Tasks
- **Start Frontend**: Runs `yarn dev` in frontend directory
- **Start Backend**: Runs `python server.py` in backend directory  
- **Start Full Stack**: Runs both simultaneously

### Debugging
- **Launch Frontend**: Debug the React app
- **Debug Frontend in Chrome**: Debug in Chrome browser

## 🏗 Project Structure

```
peerfact/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── App.css             # Tailwind + custom styles
│   │   └── main.jsx            # Vite entry point
│   ├── index.html              # HTML template (root level for Vite)
│   ├── package.json            # Dependencies and scripts
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── postcss.config.js       # PostCSS configuration
│   ├── .env                    # Production environment
│   ├── .env.development        # Development environment
│   └── .env.local              # Local overrides (create as needed)
│
├── backend/                     # FastAPI backend
│   ├── server.py               # Main FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment variables
│
├── .vscode/                     # VSCode configuration
│   ├── settings.json           # Editor settings
│   ├── launch.json             # Debug configurations
│   └── tasks.json              # Build/run tasks
│
├── README.md                    # Project overview
├── DEVELOPMENT.md               # This file
└── .gitignore                   # Git ignore rules
```

## 🔧 Available Scripts

### Frontend Scripts
```bash
yarn dev        # Start development server with hot reload
yarn build      # Build for production
yarn preview    # Preview production build locally
yarn lint       # Run ESLint for code quality
```

### Backend Scripts
```bash
python server.py              # Start FastAPI development server
# API docs automatically available at /docs
```

## 🌐 Environment Configuration

### Frontend Environment Variables
All frontend environment variables must be prefixed with `VITE_`:

- `VITE_BACKEND_URL`: Backend API URL (default: http://localhost:8001)

### Backend Environment Variables
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name (default: peerfact)
- `CORS_ORIGINS`: Allowed CORS origins (default: *)
- `EMERGENT_LLM_KEY`: Optional AI integration key
- `OPENAI_API_KEY`: Optional OpenAI integration

## 🎨 Styling

The project uses **Tailwind CSS** with custom components:
- Glass morphism design system
- Custom CSS classes in `frontend/src/App.css`
- Responsive design for mobile and desktop

## 🔍 Debugging Tips

### Frontend Issues
1. Check browser developer console for errors
2. Ensure backend is running on port 8001
3. Verify environment variables are loaded correctly
4. Use VSCode debugger with Chrome configuration

### Backend Issues
1. Check terminal output for Python errors
2. Ensure MongoDB is running and accessible
3. Verify all required environment variables are set
4. Check API documentation at http://localhost:8001/docs

### Common Issues
- **Port conflicts**: Make sure ports 3000 and 8001 are available
- **CORS errors**: Verify CORS_ORIGINS in backend .env
- **Environment variables**: Ensure proper VITE_ prefix for frontend vars
- **Database connection**: Verify MongoDB is running and MONGO_URL is correct

## 🚀 Production Build

### Frontend
```bash
cd frontend
yarn build
# Files will be in the 'build' directory
```

### Backend
The FastAPI backend can be deployed using:
- Uvicorn for ASGI server
- Docker containers
- Cloud platforms (Railway, Render, etc.)

## 📦 Technology Stack

- **Frontend**: React 19 + Vite 6 + Tailwind CSS
- **Backend**: FastAPI + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Build Tool**: Vite (replaced CRACO/Create React App)
- **Package Manager**: Yarn (frontend)
- **Development**: Hot reload enabled for both frontend and backend

## 🤝 Contributing

1. Make sure both frontend and backend work in development
2. Test your changes thoroughly
3. Follow the existing code style
4. Update documentation if needed
5. Submit pull requests with clear descriptions

## 📞 Support

If you encounter issues:
1. Check this development guide
2. Look at the main README.md
3. Check console/terminal outputs for error messages
4. Ensure all prerequisites are properly installed