@echo off
echo 🚀 Starting Waiter FM Enterprise System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Setting up backend...
cd backend

REM Install backend dependencies
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

REM Initialize database if it doesn't exist
if not exist "database\waiter_fm.db" (
    echo 🗄️  Initializing database...
    node database\init-db.js
)

REM Start backend server
echo 🔧 Starting backend server on port 5000...
start "Backend Server" cmd /k "npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go back to root and start frontend
cd ..
echo 🎨 Starting frontend on port 3000...
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Waiter FM is starting up!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 🎯 Demo Credentials:
echo    Admin: admin / admin123
echo    Waiters: Register new accounts
echo.
echo Press any key to exit...
pause >nul
