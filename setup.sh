#!/bin/bash

# 🚀 CryptoSignAI Mini App Installation Script
# Run this script to set up your Telegram Mini App

echo "🚀 CryptoSignAI Mini App Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "📥 Download: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
MINI_APP_URL=http://localhost:3000

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=your_random_session_secret_here
EOF
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your actual API keys"
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
mkdir -p uploads
echo "✅ Uploads directory created"

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Check if ports are available
if lsof -i:3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use"
    echo "💡 You can change the port in .env file"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your API keys:"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - GEMINI_API_KEY"
echo "   - ALPHA_VANTAGE_API_KEY"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Open in browser:"
echo "   http://localhost:3000"
echo ""
echo "4. For production deployment:"
echo "   npm run build"
echo "   npm start"
echo ""
echo "📖 Read DEPLOYMENT.md for deployment options"
echo "🤖 Read bot-integration.md for bot setup"
echo ""
echo "🚀 Happy trading!"
