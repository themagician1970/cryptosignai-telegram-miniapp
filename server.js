// CryptoSignAI Telegram Mini App Server
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Production logging configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const log = console.log; // Always log for debugging 502 issues
const logError = console.error;

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for chart image uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: [
    'https://web.telegram.org',
    'https://k.web.telegram.org',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '.')));

// API Configuration
const API_KEYS = {
  gemini: process.env.GEMINI_API_KEY || 'AIzaSyBInb8NV46VBFOsSsEiEOqWuGq5wS8Y8U4',
  alphaVantage: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
  telegramBot: process.env.TELEGRAM_BOT_TOKEN || '8053605696:AAEkjm-7Uj8DTpvgjIaVSTbESxxgW2NJdng'
};

// Serve Mini App
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: port,
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    api: 'CryptoSignAI',
    status: 'operational',
    endpoints: {
      analyze: '/api/analyze',
      quickSignal: '/api/quick-signal',
      upload: '/api/upload'
    },
    features: {
      aiAnalysis: !!API_KEYS.gemini,
      marketData: !!API_KEYS.alphaVantage,
      telegramBot: !!API_KEYS.telegramBot
    }
  });
});

// Main analysis endpoint
app.get('/api/analyze', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSD';
  const interval = '15min';

  log(`[API] Analyzing ${symbol}`);

  try {
    const marketDataUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEYS.alphaVantage}&outputsize=compact&datatype=json`;
    
    const response = await fetch(marketDataUrl);
    const data = await response.json();

    if (data['Time Series (15min)']) {
      const timeSeriesData = data['Time Series (15min)'];
      const latestTimestamp = Object.keys(timeSeriesData)[0];
      const latestPrice = parseFloat(timeSeriesData[latestTimestamp]['4. close']);

      // Generate AI analysis
      const analysis = await generateAIAnalysis(symbol, latestPrice, timeSeriesData);
      
      res.json({
        success: true,
        analysis: analysis.text,
        recommendations: analysis.recommendations,
        marketData: {
          symbol,
          currentPrice: latestPrice,
          timestamp: latestTimestamp
        }
      });
    } else {
      throw new Error(data?.Note || 'Market data unavailable');
    }
  } catch (error) {
    logError('[API] Analysis error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// Quick signal endpoint
app.get('/api/quick-signal', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSD';
  
  try {
    const marketDataUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=15min&apikey=${API_KEYS.alphaVantage}&outputsize=compact&datatype=json`;
    
    const response = await fetch(marketDataUrl);
    const data = await response.json();
    
    if (data['Time Series (15min)']) {
      const timeSeriesData = data['Time Series (15min)'];
      const prices = Object.values(timeSeriesData).slice(0, 5).map(candle => parseFloat(candle['4. close']));
      const latestPrice = prices[0];
      
      const trend = prices[0] > prices[4] ? 'BULLISH' : prices[0] < prices[4] ? 'BEARISH' : 'SIDEWAYS';
      const signal = trend === 'BULLISH' ? 'BUY' : trend === 'BEARISH' ? 'SELL' : 'HOLD';
      
      res.json({
        success: true,
        signal,
        price: latestPrice.toFixed(2),
        confidence: trend === 'SIDEWAYS' ? '50%' : '75%',
        trend
      });
    } else {
      throw new Error('Market data unavailable');
    }
  } catch (error) {
    logError('[API] Quick signal error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Quick signal failed' 
    });
  }
});

// Chart image analysis endpoint
app.post('/api/analyze-chart-image', upload.single('chart'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No chart image provided' 
      });
    }

    const userId = req.body.userId;
    log(`[API] Chart image received from user ${userId}`);

    res.json({
      success: true,
      message: 'Chart image received for analysis',
      analysisId: `analysis_${Date.now()}`
    });

  } catch (error) {
    logError('[API] Chart analysis error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Chart analysis failed' 
    });
  }
});

// Helper Functions
async function generateAIAnalysis(symbol, currentPrice, timeSeriesData) {
  try {
    const prompt = `Analyze ${symbol} trading data. Current price: $${currentPrice}. 
    Provide: trend (Bullish/Bearish/Sideways), position recommendation (Long/Short/Hold), 
    entry price, take profit, stop loss, and confidence percentage. Keep response concise.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.gemini}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generation_config: { max_output_tokens: 300 }
      })
    });
    
    const data = await response.json();
    const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable';
    
    return {
      text: analysisText,
      recommendations: extractTradingRecommendations(analysisText, currentPrice)
    };
  } catch (error) {
    logError('[AI] Analysis error:', error.message);
    return {
      text: 'AI analysis temporarily unavailable',
      recommendations: {
        position: 'HOLD',
        entry: currentPrice.toFixed(2),
        takeProfit: 'N/A',
        stopLoss: 'N/A',
        possibility: '50%'
      }
    };
  }
}

function extractTradingRecommendations(analysisText, currentPrice) {
  const recommendations = {
    position: 'HOLD',
    entry: currentPrice.toFixed(2),
    takeProfit: 'N/A',
    stopLoss: 'N/A',
    possibility: '50%'
  };

  if (!analysisText) return recommendations;

  const text = analysisText.toLowerCase();

  // Extract position
  if (text.includes('long') || text.includes('buy')) {
    recommendations.position = 'LONG';
  } else if (text.includes('short') || text.includes('sell')) {
    recommendations.position = 'SHORT';
  }

  // Extract confidence
  const confidenceMatch = analysisText.match(/(\d+)%/);
  if (confidenceMatch) {
    recommendations.possibility = confidenceMatch[0];
  }

  return recommendations;
}

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  log(`🚀 CryptoSignAI Mini App running on port ${port}`);
  log(`📱 Access at: http://localhost:${port}`);
  log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('💀 Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    log('💀 Process terminated');
    process.exit(0);
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logError('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logError('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
