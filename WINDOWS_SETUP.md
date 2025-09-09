# 🚀 PeerFact Windows Development Setup

Welcome to PeerFact! This guide will help you set up the complete development environment on Windows.

## 📋 Prerequisites

Before starting, make sure you have these installed:

### Required Software
- **Python 3.8+** - [Download from python.org](https://www.python.org/downloads/)
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/en/download/)
- **Docker Desktop** - [Download from docker.com](https://www.docker.com/products/docker-desktop/)
- **VSCode** - [Download from code.visualstudio.com](https://code.visualstudio.com/)
- **Git** - [Download from git-scm.com](https://git-scm.com/download/win)

### Verify Installation
Open Command Prompt or PowerShell and run:
```cmd
python --version
node --version
docker --version
git --version
```

## 🚀 Quick Setup (Automated)

### Option 1: Automated Setup Script
1. Open Command Prompt as Administrator
2. Navigate to the project folder
3. Run the setup script:
```cmd
scripts\setup-windows.bat
```

This will:
- ✅ Check all prerequisites
- 🐍 Set up Python virtual environment
- 📦 Install all dependencies
- 🐳 Start MongoDB with Docker
- 🎯 Configure everything for development

### Option 2: VSCode Integration (Recommended)
1. Open VSCode
2. Install recommended extensions when prompted
3. Open terminal in VSCode (`Ctrl + ``)
4. Run: `scripts\setup-windows.bat`
5. Press `F5` to start full-stack development

## 🛠️ Manual Setup (If Needed)

### 1. Backend Setup
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

### 2. Frontend Setup
```cmd
cd frontend
npm install -g yarn
yarn install
```

### 3. MongoDB Setup
```cmd
docker-compose up -d mongodb
```

## 🚀 Running the Application

### Method 1: VSCode Launch (Best Experience)
1. Open VSCode in project folder: `code .`
2. Press `F5` or go to Run and Debug
3. Select "🚀 Launch Full Stack"

### Method 2: Windows Scripts
```cmd
# Start everything
scripts\start-windows.bat

# Stop everything
scripts\stop-windows.bat
```

### Method 3: Manual Commands
```cmd
# Terminal 1 - MongoDB
docker-compose up -d mongodb

# Terminal 2 - Backend
cd backend
venv\Scripts\activate.bat
python server.py

# Terminal 3 - Frontend
cd frontend
yarn dev
```

## 🌐 Access Your Application

Once everything is running:

- **🖥️ Frontend**: http://localhost:3000
- **⚙️ Backend API**: http://localhost:8001
- **📖 API Documentation**: http://localhost:8001/docs
- **🐳 MongoDB Admin**: http://localhost:8081 (admin/admin123)

## 🔧 VSCode Features

### Debug Configurations
- **🚀 Launch Full Stack** - Start both frontend and backend
- **🖥️ Frontend Only** - Just the Vite dev server
- **⚙️ Backend Only** - Just the FastAPI server
- **🧪 Debug Backend Tests** - Run tests with debugging

### Available Tasks (`Ctrl+Shift+P` → "Tasks: Run Task")
- **📦 Install Backend Dependencies**
- **📦 Install Frontend Dependencies**
- **🚀 Start Backend**
- **🖥️ Start Frontend**
- **🏗️ Build Frontend**
- **🧪 Run Backend Tests**
- **🐳 Start MongoDB Docker**
- **🧹 Lint Frontend**

### Hot Reload
- ✅ **Frontend**: Instant updates with Vite
- ✅ **Backend**: Auto-reload on file changes
- ✅ **Database**: Persistent data with Docker volumes

## 🐳 MongoDB Management

### Using Docker Compose
```cmd
# Start MongoDB
docker-compose up -d mongodb

# Stop MongoDB
docker-compose down

# View logs
docker-compose logs mongodb

# Reset database (careful!)
docker-compose down -v
```

### MongoDB Admin Interface
Visit http://localhost:8081 to manage your database:
- **Username**: admin
- **Password**: admin123

## 🧪 Testing

### Backend Tests
```cmd
# In VSCode: Use "🧪 Debug Backend Tests" launch config
# Or manually:
cd backend
venv\Scripts\activate.bat
python -m pytest -v ../backend_test.py
```

### Frontend Testing
- Use browser developer tools
- Vite shows build errors instantly
- Check Network tab for API calls

## 🔧 Configuration Files

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017/peerfact
DB_NAME=peerfact
CORS_ORIGINS=*
SECRET_KEY=your-secret-key
EMERGENT_LLM_KEY=your-llm-key (optional)
```

**Frontend (.env)**
```env
VITE_BACKEND_URL=http://localhost:8001
```

### VSCode Workspace Settings
- Python interpreter: `./backend/venv/Scripts/python.exe`
- Auto-formatting with Black and Prettier
- ESLint for JavaScript
- Tailwind CSS IntelliSense

## 🔍 Troubleshooting

### Common Issues

#### "Python not found"
- Install Python from python.org
- Make sure "Add to PATH" is checked during installation
- Restart Command Prompt

#### "Docker command not found"
- Install Docker Desktop
- Make sure Docker is running (check system tray)
- Restart Command Prompt

#### "Port already in use"
```cmd
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8001
netstat -ano | findstr :27017

# Kill the process (replace PID)
taskkill /PID <process_id> /F
```

#### "MongoDB connection failed"
```cmd
# Check if MongoDB container is running
docker ps

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

#### "Frontend not loading"
1. Check if Vite dev server is running on port 3000
2. Verify `VITE_BACKEND_URL` in frontend/.env
3. Clear browser cache
4. Check browser console for errors

#### "Backend API errors"
1. Check if backend is running on port 8001
2. Verify MongoDB connection
3. Check backend logs in terminal
4. Test API at http://localhost:8001/docs

### Reset Everything
If something goes wrong, you can reset:
```cmd
# Stop all services
scripts\stop-windows.bat

# Clean Python environment
rmdir /s backend\venv

# Clean Node modules
rmdir /s frontend\node_modules

# Reset database
docker-compose down -v

# Run setup again
scripts\setup-windows.bat
```

## 📁 Project Structure

```
peerfact/
├── .vscode/                # VSCode configuration
│   ├── settings.json       # Workspace settings
│   ├── launch.json         # Debug configurations
│   ├── tasks.json          # Build tasks
│   └── extensions.json     # Recommended extensions
├── backend/                # FastAPI backend
│   ├── venv/              # Python virtual environment
│   ├── server.py          # Main FastAPI application
│   ├── .env               # Backend environment variables
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   └── main.jsx      # Vite entry point
│   ├── .env              # Frontend environment variables
│   ├── package.json      # Node.js dependencies
│   └── vite.config.js    # Vite configuration
├── scripts/               # Windows batch scripts
│   ├── setup-windows.bat # Automated setup
│   ├── start-windows.bat # Start all services
│   └── stop-windows.bat  # Stop all services
├── docker-compose.yml     # MongoDB container
└── README.md             # Main documentation
```

## 🎯 Development Workflow

1. **Morning Setup**:
   ```cmd
   code .                    # Open VSCode
   scripts\start-windows.bat # Start all services
   ```

2. **During Development**:
   - Use VSCode integrated terminal
   - Set breakpoints in backend code
   - Use browser dev tools for frontend
   - Monitor logs in VSCode terminals

3. **End of Day**:
   ```cmd
   scripts\stop-windows.bat  # Stop all services
   ```

## 🚀 Production Build

### Build Frontend for Production
```cmd
cd frontend
yarn build
```

The built files will be in `frontend/dist/` folder.

### Backend Production
The FastAPI backend is production-ready. For deployment:
1. Update environment variables
2. Use a production WSGI server like Gunicorn
3. Set up reverse proxy with Nginx

## 🆘 Getting Help

If you encounter any issues:

1. **Check logs** in VSCode terminals
2. **Verify services** are running correctly
3. **Check environment variables** are set properly
4. **Review troubleshooting section** above
5. **Reset and try again** if needed

## 💡 Tips for Windows Development

1. **Use Windows Terminal** for better experience
2. **Keep Docker Desktop running** in the background
3. **Use VSCode's integrated terminal** for seamless workflow
4. **Set up keyboard shortcuts** for common tasks
5. **Enable auto-save** in VSCode for seamless development
6. **Use WSL2** if you want Linux-like experience

## 🎉 You're Ready!

Your PeerFact development environment is now set up and ready for Windows! 

Happy coding! 🚀