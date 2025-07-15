# 🚀 Deployment Guide for Telegram Mini App

## 📋 Quick Start

### 1. Install Dependencies
```bash
cd telegram-mini-app
npm install
```

### 2. Configuration
Create `.env` file:
```env
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Mini App URL (update after deployment)
MINI_APP_URL=https://your-domain.com

# Optional
PORT=3000
NODE_ENV=production
```

### 3. Local Development
```bash
# Start development server
npm run dev

# Test Mini App
# Open: http://localhost:3000
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Configure Environment Variables:**
- Go to Vercel Dashboard
- Project Settings > Environment Variables
- Add your API keys

4. **Custom Domain (Optional):**
- Add your domain in Vercel Dashboard
- Update DNS settings

### Option 2: Netlify (Free)

1. **Build Command:** `npm run build`
2. **Publish Directory:** `telegram-mini-app`
3. **Environment Variables:** Add in Netlify Dashboard

### Option 3: Railway (Free Tier)

1. **Connect GitHub Repository**
2. **Auto-deploy on push**
3. **Add environment variables**

### Option 4: Your Own Server

1. **Upload files to server**
2. **Install Node.js and PM2**
3. **Start with PM2:**
```bash
pm2 start server.js --name "cryptosignai-miniapp"
pm2 startup
pm2 save
```

## 🔧 Bot Integration Setup

### 1. Update Your Existing Bot

Add this to your main bot file:

```javascript
// Replace YOUR_MINI_APP_URL with your deployed URL
const MINI_APP_URL = 'https://your-vercel-app.vercel.app';

// Add Mini App button to /start command
const startKeyboard = {
  inline_keyboard: [
    [
      {
        text: '🚀 Open CryptoSignAI App',
        web_app: { url: MINI_APP_URL }
      }
    ],
    // ... your existing buttons
  ]
};
```

### 2. BotFather Configuration

Set bot commands in BotFather:
```
start - 🏠 Main menu
app - 🚀 Open Mini App
analyze - 🔍 AI Analysis
charts - 📊 Live Charts
signals - 🎯 Trading Signals
portfolio - 💼 Portfolio
help - ❓ Help
```

## 📱 Testing Checklist

### Before Deployment:
- [ ] All API keys configured
- [ ] Local server runs without errors
- [ ] Mini App opens in browser
- [ ] All tabs work correctly
- [ ] TradingView charts load
- [ ] Analysis endpoint works

### After Deployment:
- [ ] HTTPS URL accessible
- [ ] Bot commands work
- [ ] Mini App opens in Telegram
- [ ] All features functional
- [ ] Mobile responsive
- [ ] Error handling works

## 🔒 Security Considerations

### 1. Environment Variables
Never commit API keys to repository:
```javascript
// ❌ Bad
const apiKey = 'your_actual_key_here';

// ✅ Good  
const apiKey = process.env.GEMINI_API_KEY;
```

### 2. Telegram Data Validation
```javascript
// Validate Telegram Web App init data
function validateTelegramData(initData) {
  // Implement hash validation
  // Check signature
  // Verify timestamp
}
```

### 3. CORS Configuration
```javascript
app.use(cors({
  origin: ['https://web.telegram.org', 'https://your-domain.com'],
  credentials: true
}));
```

## 📊 Monitoring & Analytics

### 1. Error Logging
```javascript
// Add to server.js
app.use((error, req, res, next) => {
  console.error('Error:', error);
  // Send to logging service (Sentry, LogRocket, etc.)
});
```

### 2. Usage Analytics
```javascript
// Track Mini App usage
app.use('/api/*', (req, res, next) => {
  console.log(`API ${req.method} ${req.path} - ${new Date()}`);
  next();
});
```

## 🔄 Updates & Maintenance

### Automatic Deployment
1. **GitHub Actions** (for automated deployment)
2. **Vercel Git Integration** (auto-deploy on push)
3. **Railway Git Integration** (auto-deploy)

### Manual Updates
```bash
# Update code
git pull origin main

# Restart server (if using PM2)
pm2 restart cryptosignai-miniapp

# Or rebuild and deploy
npm run build
npm run deploy
```

## 🐛 Troubleshooting

### Common Issues:

1. **Mini App doesn't open:**
   - Check HTTPS URL
   - Verify bot token
   - Check CORS settings

2. **API errors:**
   - Verify environment variables
   - Check API key limits
   - Review server logs

3. **Chart not loading:**
   - Check TradingView script
   - Verify symbol format
   - Check network connectivity

4. **Mobile issues:**
   - Test responsive design
   - Check viewport meta tag
   - Verify touch interactions

### Debug Mode:
```javascript
// Add to app.js for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
  window.debugMode = true;
}
```

## 📈 Performance Optimization

### 1. Caching
```javascript
// Cache API responses
app.use('/api/analyze', cache('5 minutes'));
```

### 2. Compression
```javascript
// Compress responses
import compression from 'compression';
app.use(compression());
```

### 3. Static Assets
```javascript
// Serve static files efficiently
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

## 🎯 Next Steps

1. **Deploy Mini App** using preferred method
2. **Update bot** with Mini App integration
3. **Test thoroughly** on different devices
4. **Monitor usage** and errors
5. **Iterate and improve** based on feedback

## 💡 Pro Tips

- **Use CDN** for static assets
- **Implement caching** for API responses
- **Add loading states** for better UX
- **Monitor API quotas** for third-party services
- **Set up alerts** for server errors
- **Regular backups** of configuration

Your Mini App is now ready for production! 🚀
