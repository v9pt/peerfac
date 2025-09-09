const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

console.log('🚀 Starting PeerFact Full-Stack Development...\n');

// Check if we're on Windows
const isWindows = os.platform() === 'win32';

// MongoDB check and start
console.log('🐳 Checking MongoDB...');
const dockerPs = spawn('docker', ['ps', '--filter', 'name=peerfact-mongo', '--format', '{{.Names}}'], {
  shell: true
});

let mongoRunning = false;

dockerPs.stdout.on('data', (data) => {
  if (data.toString().includes('peerfact-mongo')) {
    mongoRunning = true;
  }
});

dockerPs.on('close', () => {
  if (!mongoRunning) {
    console.log('🐳 Starting MongoDB...');
    const dockerStart = spawn('docker-compose', ['up', '-d', 'mongodb'], {
      shell: true,
      stdio: 'inherit'
    });
    
    dockerStart.on('close', () => {
      startServices();
    });
  } else {
    console.log('✅ MongoDB already running');
    startServices();
  }
});

function startServices() {
  console.log('\n🐍 Starting Backend (FastAPI)...');
  
  const backendCommand = isWindows ? 
    ['cmd', '/c', 'cd backend && venv\\Scripts\\activate.bat && python server.py'] :
    ['bash', '-c', 'cd backend && source venv/bin/activate && python server.py'];
  
  const backend = spawn(backendCommand[0], backendCommand.slice(1), {
    shell: true,
    stdio: 'inherit',
    detached: !isWindows
  });
  
  // Wait a bit for backend to start
  setTimeout(() => {
    console.log('\n🖥️ Starting Frontend (Vite)...');
    
    const frontend = spawn('yarn', ['dev'], {
      cwd: path.join(__dirname, '..', 'frontend'),
      shell: true,
      stdio: 'inherit',
      detached: !isWindows
    });
    
    console.log('\n🎉 PeerFact is starting up!');
    console.log('\n🌐 Open these URLs in your browser:');
    console.log('  • Frontend: http://localhost:3000');
    console.log('  • Backend API: http://localhost:8001/docs');
    console.log('  • MongoDB Admin: http://localhost:8081');
    console.log('\n💡 To stop services, close this terminal or run: npm run stop');
    
    // Keep the process alive
    process.stdin.resume();
    
  }, 3000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down PeerFact services...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down PeerFact services...');
  process.exit(0);
});