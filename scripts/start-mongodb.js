const { spawn } = require('child_process');
const os = require('os');

console.log('🐳 Starting MongoDB with Docker...');

const isWindows = os.platform() === 'win32';
const command = isWindows ? 'docker-compose.exe' : 'docker-compose';
const args = ['up', '-d', 'mongodb'];

const dockerProcess = spawn(command, args, {
  stdio: 'inherit',
  shell: true
});

dockerProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ MongoDB started successfully!');
    console.log('🌐 MongoDB is running on: mongodb://localhost:27017');
    console.log('🖥️ MongoDB Admin UI: http://localhost:8081 (admin/admin123)');
  } else {
    console.error('❌ Failed to start MongoDB');
  }
});

dockerProcess.on('error', (error) => {
  console.error('❌ Error starting Docker:', error.message);
  console.log('💡 Make sure Docker Desktop is installed and running');
});