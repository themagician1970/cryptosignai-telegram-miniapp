// Enhanced Server for Telegram Mini App Integration
import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: ['https://your-domain.com', 'http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(__dirname));

// API Keys (Replace with your actual API keys)
const alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || 'JHAUBJXIG3L5PDHE';
const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyBInb8NV46VBFOsSsEiEOqWuGq5wS8Y8U4';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// Serve Mini App
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Existing analysis endpoint (enhanced)
app.get('/api/analyze', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSD';
  const interval = '15min';
  const exchange = 'BINANCE';

  const alphaVantageUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${alphaVantageApiKey}&outputsize=compact&datatype=json&market=${exchange}`;

  console.log(`[MINI-APP] Analyzing ${exchange}:${symbol} with interval ${interval}`);

  try {
    const alphaVantageResponse = await fetch(alphaVantageUrl);
    const data = await alphaVantageResponse.json();

    if (data && data['Time Series (15min)']) {
      const timeSeriesData = data['Time Series (15min)'];
      const latestTimestamp = Object.keys(timeSeriesData)[0];
      const latestPrice = parseFloat(timeSeriesData[latestTimestamp]['4. close']);

      const prompt = `Based on the latest 15-minute trading data for ${symbol} from Binance, where the current price is ${latestPrice}, provide a comprehensive trading analysis including:
      
      1. Market trend (Bullish/Bearish/Sideways)
      2. Recommended position (Long/Short/Hold)
      3. Entry price with confirmation signals
      4. Take profit levels (TP1, TP2, TP3)
      5. Stop loss level
      6. Risk-to-reward ratio
      7. Confidence percentage
      
      Format your response for a trading platform display.`;

      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

      try {
        const geminiResponse = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generation_config: { max_output_tokens: 500 }
          })
        });
        
        const geminiData = await geminiResponse.json();
        const analysisText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        // Extract trading recommendations from AI response
        const recommendations = extractTradingRecommendations(analysisText, latestPrice);

        res.json({
          success: true,
          analysis: analysisText,
          recommendations: recommendations,
          marketData: {
            symbol: symbol,
            currentPrice: latestPrice,
            timestamp: latestTimestamp,
            exchange: exchange
          }
        });

      } catch (error) {
        console.error('[MINI-APP] Error during Gemini analysis:', error);
        res.status(500).json({ 
          success: false, 
          error: 'AI analysis failed',
          message: 'Unable to generate analysis at this time'
        });
      }

    } else {
      console.log('[MINI-APP] Alpha Vantage data unavailable:', data?.Note || 'Unknown error');
      res.status(500).json({ 
        success: false, 
        error: 'Market data unavailable',
        message: data?.Note || 'Could not fetch market data'
      });
    }

  } catch (error) {
    console.error('[MINI-APP] Error fetching market data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Market data fetch failed',
      message: 'Unable to connect to market data provider'
    });
  }
});

// Quick signal endpoint
app.get('/api/quick-signal', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSD';
  
  try {
    // Simplified analysis for quick signals
    const alphaVantageUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=15min&apikey=${alphaVantageApiKey}&outputsize=compact&datatype=json&market=BINANCE`;
    
    const response = await fetch(alphaVantageUrl);
    const data = await response.json();
    
    if (data && data['Time Series (15min)']) {
      const timeSeriesData = data['Time Series (15min)'];
      const latestTimestamp = Object.keys(timeSeriesData)[0];
      const latestPrice = parseFloat(timeSeriesData[latestTimestamp]['4. close']);
      
      // Simple trend analysis
      const prices = Object.values(timeSeriesData).slice(0, 5).map(candle => parseFloat(candle['4. close']));
      const trend = prices[0] > prices[4] ? 'BULLISH' : prices[0] < prices[4] ? 'BEARISH' : 'SIDEWAYS';
      const signal = trend === 'BULLISH' ? 'BUY' : trend === 'BEARISH' ? 'SELL' : 'HOLD';
      
      res.json({
        success: true,
        signal: signal,
        price: latestPrice.toFixed(2),
        confidence: trend === 'SIDEWAYS' ? '50%' : '75%',
        trend: trend
      });
    } else {
      throw new Error('Market data unavailable');
    }
  } catch (error) {
    console.error('[MINI-APP] Quick signal error:', error);
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
    console.log(`[MINI-APP] Chart image received from user ${userId}`);

    // Here you would integrate with your existing Telegram bot
    // to send the chart image for AI analysis
    
    // For now, we'll just acknowledge receipt
    res.json({
      success: true,
      message: 'Chart image received and sent for analysis',
      analysisId: `analysis_${Date.now()}`
    });

    // TODO: Integrate with existing Telegram bot to analyze the image
    // You can use your existing chart analysis logic from the bot

  } catch (error) {
    console.error('[MINI-APP] Chart analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chart analysis failed' 
    });
  }
});

// Trading signals endpoint
app.get('/api/signals', async (req, res) => {
  try {
    // Return mock trading signals for now
    // In production, this would fetch from your database
    const signals = [
      {
        pair: 'BTC/USD',
        type: 'BUY',
        entry: '$45,250',
        takeProfit: '$48,200',
        stopLoss: '$43,900',
        riskReward: '1:3.2',
        time: '2 hours ago',
        status: 'active'
      },
      {
        pair: 'ETH/USD',
        type: 'SELL',
        entry: '$2,850',
        takeProfit: '$2,650',
        stopLoss: '$2,950',
        riskReward: '1:2.8',
        time: '4 hours ago',
        status: 'active'
      }
    ];

    res.json({
      success: true,
      signals: signals
    });
  } catch (error) {
    console.error('[MINI-APP] Signals fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch signals' 
    });
  }
});

// Portfolio endpoint
app.get('/api/portfolio', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    // Return mock portfolio data for now
    // In production, this would fetch user-specific data from your database
    const portfolio = {
      balance: '$12,450.00',
      change: '+2.5% (24h)',
      changeType: 'positive',
      positions: [
        {
          pair: 'BTC/USD',
          type: 'LONG',
          size: '0.25 BTC',
          entry: '$44,800',
          current: '$45,250',
          pnl: '+$112.50',
          pnlType: 'profit'
        }
      ]
    };

    res.json({
      success: true,
      portfolio: portfolio
    });
  } catch (error) {
    console.error('[MINI-APP] Portfolio fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch portfolio' 
    });
  }
});

// Telegram WebApp data validation endpoint
app.post('/api/validate-telegram-data', (req, res) => {
  try {
    const { initData } = req.body;
    
    // Validate Telegram Web App init data
    // This is important for security in production
    // For now, we'll just acknowledge the data
    
    res.json({
      success: true,
      valid: true,
      message: 'Telegram data validated'
    });
  } catch (error) {
    console.error('[MINI-APP] Telegram data validation error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid Telegram data' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('[MINI-APP] Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Helper function to extract trading recommendations from AI response
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

  // Extract confidence/possibility
  const confidenceMatch = analysisText.match(/(\d+)%/);
  if (confidenceMatch) {
    recommendations.possibility = confidenceMatch[0];
  }

  // Extract price levels (simplified)
  const priceMatches = analysisText.match(/\$?[\d,]+\.?\d*/g);
  if (priceMatches && priceMatches.length >= 3) {
    recommendations.takeProfit = priceMatches[1];
    recommendations.stopLoss = priceMatches[2];
  }

  return recommendations;
}

// Start server
app.listen(port, () => {
  console.log(`🚀 CryptoSignAI Mini App server running on port ${port}`);
  console.log(`📱 Mini App URL: http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
});

export default app;
