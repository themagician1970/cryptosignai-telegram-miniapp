@echo off
REM 🚀 CryptoSignAI Mini App Installation Script for Windows
REM Run this script to set up your Telegram Mini App

echo 🚀 CryptoSignAI Mini App Setup
echo ==============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Telegram Bot Configuration
        echo TELEGRAM_BOT_TOKEN=your_bot_token_here
        echo MINI_APP_URL=http://localhost:3000
        echo.
        echo # API Keys
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
        echo.
        echo # Server Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Security
        echo SESSION_SECRET=your_random_session_secret_here
    ) > .env
    echo ✅ .env file created
    echo ⚠️  Please update .env with your actual API keys
) else (
    echo ✅ .env file already exists
)

REM Create uploads directory
if not exist uploads mkdir uploads
echo ✅ Uploads directory created

REM Create logs directory
if not exist logs mkdir logs
echo ✅ Logs directory created

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Update .env file with your API keys:
echo    - TELEGRAM_BOT_TOKEN
echo    - GEMINI_API_KEY
echo    - ALPHA_VANTAGE_API_KEY
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo 3. Open in browser:
echo    http://localhost:3000
echo.
echo 4. For production deployment:
echo    npm run build
echo    npm start
echo.
echo 📖 Read DEPLOYMENT.md for deployment options
echo 🤖 Read bot-integration.md for bot setup
echo.
echo 🚀 Happy trading!
echo.
pause
