# 🚀 CryptoSignAI Telegram Mini App

Professional Telegram Mini App for Crypto Trading Analysis with AI Integration

## ✨ Features

- 📊 **Live TradingView Charts** - Real-time market data and analysis
- 🤖 **AI Trading Analysis** - Powered by Gemini AI for smart insights
- ⚡ **Quick Signals** - Fast trading recommendations
- 📱 **Mobile Optimized** - Perfect for Telegram mobile app
- 🎨 **Modern UI** - Beautiful interface with Telegram theming
- **📱 Mobile Optimized** - Responsive design for all devices
- **🔒 Telegram Integration** - Seamless authentication and UX

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **APIs:** Telegram Web App SDK, TradingView, Gemini AI, Alpha Vantage
- **Deployment:** Vercel/Render/Railway compatible

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Telegram Bot Token
- API Keys (Gemini, Alpha Vantage)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd telegram-mini-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

### Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token
GEMINI_API_KEY=your_gemini_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
PORT=3000
NODE_ENV=production
```

## 📱 Bot Integration

Add these commands to your Telegram bot:

```javascript
// Mini App button
const keyboard = {
  inline_keyboard: [[
    {
      text: '🚀 Open Trading App',
      web_app: { url: 'YOUR_DEPLOYED_URL' }
    }
  ]]
};
```

## 🌐 Deployment

### Render.com (Free)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variables

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## 📋 API Endpoints

- `GET /` - Mini App interface
- `GET /api/analyze` - AI market analysis
- `GET /api/quick-signal` - Quick trading signals
- `GET /api/signals` - Trading signals list
- `GET /api/portfolio` - Portfolio data
- `POST /api/analyze-chart-image` - Chart image analysis

## 🔒 Security

- Environment variables for sensitive data
- CORS configuration for Telegram domains
- Input validation and sanitization
- HTTPS required for production

## 📊 Features Overview

### Analysis Tab
- AI-powered market analysis
- Trading recommendations
- Confidence ratings
- Multiple trading pairs

### Charts Tab
- Live TradingView charts
- Technical indicators
- Chart capture functionality
- Multiple timeframes

### Signals Tab
- Real-time trading signals
- Entry/exit points
- Risk management levels
- Performance tracking

### Portfolio Tab
- Account balance tracking
- Open positions monitoring
- P&L calculations
- Performance analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@cryptosignai.com
- 💬 Telegram: @CryptoSignAI_Support
- 📖 Documentation: [Read the docs](./DEPLOYMENT.md)

## 🎉 Acknowledgments

- TradingView for charting widgets
- Google Gemini for AI analysis
- Alpha Vantage for market data
- Telegram for Web App platform

---

**Built with ❤️ for the crypto trading community**
