# CryptoSignAI - Telegram Mini App

A clean, modern crypto trading platform with AI-powered signals and real-time market data.

## ✨ Features

- 📈 **Real-time Market Data** - Live crypto prices from CoinGecko API
- 🤖 **AI Trading Signals** - Intelligent analysis with buy/sell recommendations  
- 📊 **Interactive Charts** - TradingView integration for technical analysis
- 📱 **Mobile Optimized** - Responsive design for all devices
- ⚡ **Fast & Lightweight** - Only 3 dependencies, optimized performance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode
npm run dev
```

The app will be available at `http://localhost:3000`

## 🌐 Deploy to Render

### Option 1: One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option 2: Manual Deploy
1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Connect to Render**: 
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
3. **Configure Service**:
   - **Name**: `cryptosignai-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)
4. **Deploy**: Click "Create Web Service"

Your app will be live at: `https://your-app-name.onrender.com`

### Environment Variables (Optional)
- `NODE_ENV=production` (automatically set by Render)
- `PORT` (automatically set by Render)

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Pure HTML/CSS/JavaScript
- **APIs**: CoinGecko (market data), TradingView (charts)
- **Deployment**: Ready for Vercel, Railway, Render

## 📋 API Endpoints

- `GET /` - Main application
- `GET /health` - Health check
- `GET /api/market-overview` - Real-time crypto prices
- `GET /api/quick-signal/:symbol` - Trading signals for specific crypto
- `GET /api/analyze` - AI market analysis

## 🔒 Security

- ✅ No vulnerabilities (npm audit clean)
- ✅ CORS enabled for cross-origin requests
- ✅ Production-ready error handling

## 📱 Telegram Integration

Ready for deployment as a Telegram Mini App with built-in Telegram Web App SDK.

---

**Status**: 🟢 Production Ready | **Last Updated**: July 2025
# Updated 07/16/2025 17:03:09
Secret added - testing deployment
