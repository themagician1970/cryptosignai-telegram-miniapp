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

// ===== USER AUTHENTICATION SYSTEM ===== //

// In-memory user storage (use proper database in production)
const users = new Map();
const sessions = new Map();

// Helper functions
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2, 15) + Date.now();
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CSA';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 8;
}

function hashPassword(password) {
    // Simple hash for demo (use bcrypt in production)
    return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
    return Buffer.from(password).toString('base64') === hash;
}

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            country,
            phone,
            password,
            confirmPassword,
            referenceCode,
            terms,
            newsletter
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !country || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (!terms) {
            return res.status(400).json({
                success: false,
                message: 'You must accept the terms and conditions'
            });
        }

        // Check if user already exists
        if (users.has(email.toLowerCase())) {
            return res.status(409).json({
                success: false,
                message: 'Email address is already registered'
            });
        }

        // Create new user
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const userReferralCode = generateReferralCode();
        const hashedPassword = hashPassword(password);

        const newUser = {
            id: userId,
            firstName,
            lastName,
            email: email.toLowerCase(),
            country,
            phone,
            password: hashedPassword,
            referralCode: userReferralCode,
            usedReferralCode: referenceCode || null,
            newsletter: !!newsletter,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isVerified: false,
            tradingLevel: 'beginner',
            totalTrades: 0,
            successRate: 0
        };

        users.set(email.toLowerCase(), newUser);

        // Generate session token
        const token = generateToken();
        sessions.set(token, {
            userId,
            email: email.toLowerCase(),
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });

        console.log(`🎉 New user registered: ${email}`);
        console.log(`🎁 Referral code: ${userReferralCode}`);

        res.json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: userId,
                firstName,
                lastName,
                email: email.toLowerCase(),
                country,
                referralCode: userReferralCode,
                tradingLevel: 'beginner'
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = users.get(email.toLowerCase());
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        if (!verifyPassword(password, user.password)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();

        // Generate session token
        const token = generateToken();
        const expirationTime = remember ? 
            Date.now() + (30 * 24 * 60 * 60 * 1000) : // 30 days
            Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        sessions.set(token, {
            userId: user.id,
            email: email.toLowerCase(),
            createdAt: Date.now(),
            expiresAt: expirationTime
        });

        console.log(`🔐 User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                country: user.country,
                referralCode: user.referralCode,
                tradingLevel: user.tradingLevel,
                totalTrades: user.totalTrades,
                successRate: user.successRate,
                lastLogin: user.lastLogin
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token && sessions.has(token)) {
            sessions.delete(token);
            console.log('🚪 User logged out');
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
});

app.get('/api/auth/profile', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token || !sessions.has(token)) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const session = sessions.get(token);
        if (session.expiresAt < Date.now()) {
            sessions.delete(token);
            return res.status(401).json({
                success: false,
                message: 'Session expired'
            });
        }

        const user = users.get(session.email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                country: user.country,
                phone: user.phone,
                referralCode: user.referralCode,
                tradingLevel: user.tradingLevel,
                totalTrades: user.totalTrades,
                successRate: user.successRate,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Validate referral code
app.post('/api/auth/validate-referral', (req, res) => {
    try {
        const { referralCode } = req.body;
        
        if (!referralCode) {
            return res.status(400).json({
                success: false,
                message: 'Referral code is required'
            });
        }

        // Find user with this referral code
        const referrer = Array.from(users.values()).find(user => 
            user.referralCode === referralCode.toUpperCase()
        );

        if (referrer) {
            res.json({
                success: true,
                valid: true,
                referrer: {
                    name: `${referrer.firstName} ${referrer.lastName}`,
                    tradingLevel: referrer.tradingLevel
                },
                bonus: {
                    type: 'signup_bonus',
                    amount: 50,
                    currency: 'USDT'
                }
            });
        } else {
            res.json({
                success: true,
                valid: false,
                message: 'Invalid referral code'
            });
        }

    } catch (error) {
        console.error('Referral validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user stats
app.get('/api/auth/stats', (req, res) => {
    try {
        const totalUsers = users.size;
        const activeUsers = Array.from(sessions.values()).filter(
            session => session.expiresAt > Date.now()
        ).length;

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                newUsersToday: Array.from(users.values()).filter(user => {
                    const createdDate = new Date(user.createdAt);
                    const today = new Date();
                    return createdDate.toDateString() === today.toDateString();
                }).length
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
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
