# 🚀 VSCode Development Guide for PeerFact

This guide will help you set up and run PeerFact in VSCode with full-stack debugging support.

## ✅ Quick Start

### 1. Open in VSCode
```bash
code /app
```

### 2. Install Recommended Extensions
VSCode will automatically prompt you to install the recommended extensions from `.vscode/extensions.json`:
- Python support with linting and formatting
- Tailwind CSS IntelliSense
- ESLint for JavaScript
- Prettier for code formatting

### 3. Start Development

#### Option A: Use VSCode Launch Configuration (Recommended)
1. Press `F5` or go to Run and Debug panel
2. Select "🚀 Launch Full Stack" - This will start both backend and frontend
3. Or select individual configurations:
   - "🖥️ Frontend Only (Vite)" - Just frontend
   - "⚙️ Backend Only (FastAPI)" - Just backend

#### Option B: Use Terminal Commands
Open terminal in VSCode and run:

```bash
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend (new terminal)
cd frontend
yarn dev
```

## 📱 Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## 🛠️ Available VSCode Tasks

Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) and type "Tasks: Run Task":

- **Start Backend** - Launch FastAPI server
- **Install Frontend Dependencies** - Run `yarn install`
- **Install Backend Dependencies** - Install Python packages
- **Build Frontend** - Create production build
- **Run Backend Tests** - Execute pytest
- **Lint Frontend** - Check code quality

## 🔧 Development Features

### Hot Reload
- **Frontend**: Vite provides instant hot reload
- **Backend**: FastAPI auto-reloads on file changes

### Debugging
- Set breakpoints in Python backend code
- Use browser dev tools for frontend debugging
- Integrated terminal for commands

### Code Quality
- Auto-formatting on save (Black for Python, Prettier for JS)
- ESLint for JavaScript
- Flake8 for Python linting

## 📂 Project Structure

```
/app/
├── .vscode/              # VSCode configuration
│   ├── settings.json     # Workspace settings
│   ├── launch.json       # Debug configurations  
│   ├── tasks.json        # Build tasks
│   └── extensions.json   # Recommended extensions
├── backend/
│   ├── server.py         # FastAPI application
│   ├── .env             # Backend environment variables
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js       # Main React component
│   │   └── main.jsx     # Vite entry point
│   ├── .env             # Frontend environment variables
│   ├── package.json     # Node.js dependencies
│   └── vite.config.js   # Vite configuration
└── README.md            # Main project documentation
```

## 🌐 Environment Variables

### Backend (.env)
- `MONGO_URL`: MongoDB connection string
- `EMERGENT_LLM_KEY`: AI integration key (optional)
- `CORS_ORIGINS`: CORS settings

### Frontend (.env)
- `VITE_BACKEND_URL`: Backend API URL (http://localhost:8001)

## 🧪 Testing

### Backend Tests
- Use "🧪 Debug Backend Tests" launch configuration
- Or run: `pytest -v backend_test.py`

### Frontend Testing
- Vite dev server shows build errors instantly
- Use browser dev tools for runtime debugging

## 🔍 Troubleshooting

### Frontend Not Loading
1. Check if frontend dev server is running on port 3000
2. Verify `VITE_BACKEND_URL` in `frontend/.env`
3. Ensure no port conflicts

### Backend API Errors
1. Check if backend is running on port 8001
2. Verify MongoDB is accessible
3. Check backend logs in VSCode terminal

### CORS Issues
1. Backend has `CORS_ORIGINS=*` by default
2. Make sure requests use proper API URLs with `/api` prefix

### Environment Variables Not Loading
1. Restart VSCode after changing .env files
2. For Vite, variables must start with `VITE_`
3. Backend uses `python-dotenv` to load variables

## 🚀 Production Build

```bash
# Build frontend
cd frontend
yarn build

# The built files will be in frontend/build/
```

## 📋 Development Checklist

- [ ] VSCode opened in `/app` directory
- [ ] Recommended extensions installed
- [ ] Backend running on http://localhost:8001
- [ ] Frontend running on http://localhost:3000
- [ ] API connectivity working (test with claims feed)
- [ ] MongoDB connection working
- [ ] Hot reload working for both frontend and backend

## 💡 Tips

1. Use VSCode's integrated terminal for better workflow
2. Set up keyboard shortcuts for common tasks
3. Use VSCode's search to quickly find files and code
4. Enable auto-save for seamless development
5. Use the Problems panel to see linting issues

## 🆘 Need Help?

If you encounter issues:
1. Check the integrated terminal for error messages
2. Verify all services are running correctly
3. Check environment variables are set properly
4. Ensure dependencies are installed correctly