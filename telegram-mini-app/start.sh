#!/bin/bash

# 🚀 CryptoSignAI Production Startup Script
# Automated deployment and bot management

echo "🚀 Starting CryptoSignAI Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "Installing dependencies..."
npm install --production
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check environment variables
print_status "Checking environment variables..."
if [ -z "$BOT_TOKEN" ]; then
    print_warning "BOT_TOKEN not set, using default from .env.production"
fi

if [ -z "$PORT" ]; then
    export PORT=10000
    print_warning "PORT not set, using default: 10000"
fi

# Start the application
print_status "Starting CryptoSignAI services..."

# Start web server
print_status "🌐 Starting web server on port $PORT..."
npm start &
WEB_PID=$!
print_success "Web server started with PID: $WEB_PID"

# Wait a moment for server to start
sleep 3

# Start Telegram bot
print_status "🤖 Starting Telegram bot..."
npm run bot &
BOT_PID=$!
print_success "Telegram bot started with PID: $BOT_PID"

# Create PID file for process management
echo "$WEB_PID" > web.pid
echo "$BOT_PID" > bot.pid

print_success "🎉 CryptoSignAI is now running!"
print_status "Web Server: http://localhost:$PORT"
print_status "Bot Manager: Running with auto-restart"
print_status "Logs: ./logs/"
print_status "PID Files: web.pid, bot.pid"

# Monitor processes
print_status "Monitoring services... (Press Ctrl+C to stop)"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    if [ -f web.pid ]; then
        WEB_PID=$(cat web.pid)
        kill $WEB_PID 2>/dev/null
        rm web.pid
        print_success "Web server stopped"
    fi
    
    if [ -f bot.pid ]; then
        BOT_PID=$(cat bot.pid)
        kill $BOT_PID 2>/dev/null
        rm bot.pid
        print_success "Bot manager stopped"
    fi
    
    print_success "🏁 CryptoSignAI shutdown complete"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Keep script running and monitor processes
while true; do
    sleep 30
    
    # Check web server
    if ! kill -0 $WEB_PID 2>/dev/null; then
        print_error "Web server died, restarting..."
        npm start &
        WEB_PID=$!
        echo "$WEB_PID" > web.pid
        print_success "Web server restarted with PID: $WEB_PID"
    fi
    
    # Check bot
    if ! kill -0 $BOT_PID 2>/dev/null; then
        print_error "Bot died, restarting..."
        npm run bot &
        BOT_PID=$!
        echo "$BOT_PID" > bot.pid
        print_success "Bot restarted with PID: $BOT_PID"
    fi
done
