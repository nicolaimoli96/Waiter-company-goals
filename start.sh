#!/bin/bash

echo "🚀 Starting Waiter FM Enterprise System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Setting up backend..."
cd backend

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Initialize database if it doesn't exist
if [ ! -f "database/waiter_fm.db" ]; then
    echo "🗄️  Initializing database..."
    node database/init-db.js
fi

# Start backend server in background
echo "🔧 Starting backend server on port 5000..."
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to root and start frontend
cd ..
echo "🎨 Starting frontend on port 3000..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Waiter FM is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "🎯 Demo Credentials:"
echo "   Admin: admin / admin123"
echo "   Waiters: Register new accounts"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
