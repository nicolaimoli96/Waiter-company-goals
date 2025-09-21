const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Waiter FM Backend...\n');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Initialize database
  console.log('\n🗄️  Initializing database...');
  execSync('node database/init-db.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  console.log('\n✅ Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the backend server: npm start');
  console.log('2. Start the frontend: cd .. && npm start');
  console.log('\n🎯 Demo credentials:');
  console.log('Admin: admin / admin123');
  console.log('Waiters: Register new accounts');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
