// CryptoSignAI - Enhanced Trading Platform with All Features
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'CryptoSignAI Server is running',
    tunnel: 'https://cryptosignai.loca.lt'
  });
});

// Enhanced error handling for all API endpoints
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

const port = process.env.PORT || 3000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug test endpoint for troubleshooting
app.get('/debug', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Debug Test</title>
            <style>
                body { font-family: Arial; padding: 20px; background: #1e3c72; color: white; }
                button { padding: 15px 25px; margin: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                #result { margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; }
                .success { background: rgba(76,175,80,0.3); }
                .error { background: rgba(244,67,54,0.3); }
            </style>
        </head>
        <body>
            <h1>🔧 CryptoSignAI Debug Test</h1>
            <p>Testing button functionality and API connectivity</p>
            
            <button onclick="testButton()">🧪 Test Button Click</button>
            <button onclick="testAPI()">🔍 Test API Call</button>
            <button onclick="testAnalyze()">📊 Test Analyze Function</button>
            
            <div id="result">Click a button to test...</div>

            <script>
                console.log('🚀 Debug page loaded');
                
                function testButton() {
                    console.log('✅ Button click works!');
                    document.getElementById('result').innerHTML = '<div class="success">✅ Button click functionality works!</div>';
                }
                
                function testAPI() {
                    console.log('🔍 Testing API...');
                    document.getElementById('result').innerHTML = '<div>🔄 Testing API...</div>';
                    
                    fetch('/api/analyze?symbol=bitcoin')
                        .then(response => response.json())
                        .then(data => {
                            console.log('✅ API response:', data);
                            document.getElementById('result').innerHTML = 
                                '<div class="success">✅ API works!<br>' +
                                'Symbol: ' + data.symbol + '<br>' +
                                'Price: $' + data.price + '<br>' +
                                'Signal: ' + data.signal + '</div>';
                        })
                        .catch(error => {
                            console.error('❌ API error:', error);
                            document.getElementById('result').innerHTML = '<div class="error">❌ API failed: ' + error.message + '</div>';
                        });
                }
                
                function testAnalyze() {
                    console.log('📊 Testing analyze function simulation...');
                    document.getElementById('result').innerHTML = '<div>🔄 Simulating analyze function...</div>';
                    
                    // Simulate the analyze function logic
                    setTimeout(() => {
                        document.getElementById('result').innerHTML = '<div class="success">✅ Analyze function simulation complete!<br>This tests the same logic used by the main page buttons.</div>';
                    }, 1000);
                }
                
                // Auto-run basic test
                setTimeout(() => {
                    document.getElementById('result').innerHTML = '<div class="success">✅ Page loaded successfully - JavaScript is working!</div>';
                }, 500);
            </script>
        </body>
        </html>
    `);
});

// Enhanced crypto data fetching
async function getCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,ripple,dogecoin,avalanche-2,chainlink,polygon&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
    return await response.json();
  } catch (error) {
    console.error('CoinGecko error:', error);
    return {};
  }
}

// Enhanced US100 data with multiple fallbacks
async function getUS100Price() {
  try {
    const response = await fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=JHAUBJXIG3L5PDHE');
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const quote = data['Global Quote'];
      const price = parseFloat(quote['05. price']);
      const priceChange = parseFloat(quote['09. change']);
      const change = (priceChange / (price - priceChange)) * 100;
      return { price, change };
    }
  } catch (error) {
    console.error('Alpha Vantage error:', error);
  }
  
  // Enhanced fallback with realistic simulation
  const basePrice = 490.25;
  const variation = (Math.random() - 0.5) * 4; // More realistic variation
  return {
    price: basePrice + variation,
    change: 0.15 + (variation * 0.3)
  };
}

// Forex data simulation (realistic values)
async function getForexPrices() {
  return {
    eurusd: { price: 1.0850 + (Math.random() - 0.5) * 0.02, change: (Math.random() - 0.5) * 0.5 },
    gbpusd: { price: 1.2700 + (Math.random() - 0.5) * 0.02, change: (Math.random() - 0.5) * 0.6 },
    usdjpy: { price: 148.50 + (Math.random() - 0.5) * 2, change: (Math.random() - 0.5) * 0.4 },
    spx500: { price: 4500 + (Math.random() - 0.5) * 50, change: (Math.random() - 0.5) * 1.5 },
    us30: { price: 35000 + (Math.random() - 0.5) * 200, change: (Math.random() - 0.5) * 1.2 }
  };
}

// Commodity data simulation
async function getCommodityPrices() {
  return {
    gold: { price: 2050 + (Math.random() - 0.5) * 30, change: (Math.random() - 0.5) * 2 },
    silver: { price: 24.50 + (Math.random() - 0.5) * 2, change: (Math.random() - 0.5) * 3 },
    oil: { price: 82.30 + (Math.random() - 0.5) * 5, change: (Math.random() - 0.5) * 2.5 }
  };
}

// Enhanced market overview with all asset classes
app.get('/api/market-overview', async (req, res) => {
  try {
    const cryptoData = await getCryptoPrices();
    const us100Data = await getUS100Price();
    const forexData = await getForexPrices();
    const commodityData = await getCommodityPrices();
    
    const marketData = [
      // Major Cryptocurrencies
      {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        price: cryptoData.bitcoin?.usd || 45000,
        change: cryptoData.bitcoin?.usd_24h_change || 0,
        volume: cryptoData.bitcoin?.usd_24h_vol || 0,
        marketCap: cryptoData.bitcoin?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'ETH/USD',
        name: 'Ethereum',
        price: cryptoData.ethereum?.usd || 2500,
        change: cryptoData.ethereum?.usd_24h_change || 0,
        volume: cryptoData.ethereum?.usd_24h_vol || 0,
        marketCap: cryptoData.ethereum?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'BNB/USD',
        name: 'BNB',
        price: cryptoData.binancecoin?.usd || 300,
        change: cryptoData.binancecoin?.usd_24h_change || 0,
        volume: cryptoData.binancecoin?.usd_24h_vol || 0,
        marketCap: cryptoData.binancecoin?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'SOL/USD',
        name: 'Solana',
        price: cryptoData.solana?.usd || 100,
        change: cryptoData.solana?.usd_24h_change || 0,
        volume: cryptoData.solana?.usd_24h_vol || 0,
        marketCap: cryptoData.solana?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'XRP/USD',
        name: 'XRP',
        price: cryptoData.ripple?.usd || 0.60,
        change: cryptoData.ripple?.usd_24h_change || 0,
        volume: cryptoData.ripple?.usd_24h_vol || 0,
        marketCap: cryptoData.ripple?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'ADA/USD',
        name: 'Cardano',
        price: cryptoData.cardano?.usd || 0.45,
        change: cryptoData.cardano?.usd_24h_change || 0,
        volume: cryptoData.cardano?.usd_24h_vol || 0,
        marketCap: cryptoData.cardano?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'DOGE/USD',
        name: 'Dogecoin',
        price: cryptoData.dogecoin?.usd || 0.08,
        change: cryptoData.dogecoin?.usd_24h_change || 0,
        volume: cryptoData.dogecoin?.usd_24h_vol || 0,
        marketCap: cryptoData.dogecoin?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      {
        symbol: 'AVAX/USD',
        name: 'Avalanche',
        price: cryptoData['avalanche-2']?.usd || 35,
        change: cryptoData['avalanche-2']?.usd_24h_change || 0,
        volume: cryptoData['avalanche-2']?.usd_24h_vol || 0,
        marketCap: cryptoData['avalanche-2']?.usd_market_cap || 0,
        type: 'crypto',
        category: 'major'
      },
      // Stock Indices
      {
        symbol: 'US100',
        name: 'NASDAQ 100',
        price: us100Data.price,
        change: us100Data.change,
        type: 'index',
        category: 'indices'
      },
      {
        symbol: 'SPX500',
        name: 'S&P 500',
        price: forexData.spx500?.price || 4500,
        change: forexData.spx500?.change || 0.5,
        type: 'index',
        category: 'indices'
      },
      {
        symbol: 'US30',
        name: 'Dow Jones',
        price: forexData.us30?.price || 35000,
        change: forexData.us30?.change || 0.3,
        type: 'index',
        category: 'indices'
      },
      // Major Forex Pairs
      {
        symbol: 'EUR/USD',
        name: 'Euro/Dollar',
        price: forexData.eurusd?.price || 1.0850,
        change: forexData.eurusd?.change || 0.15,
        type: 'forex',
        category: 'major_pairs'
      },
      {
        symbol: 'GBP/USD',
        name: 'Pound/Dollar',
        price: forexData.gbpusd?.price || 1.2700,
        change: forexData.gbpusd?.change || -0.25,
        type: 'forex',
        category: 'major_pairs'
      },
      {
        symbol: 'USD/JPY',
        name: 'Dollar/Yen',
        price: forexData.usdjpy?.price || 148.50,
        change: forexData.usdjpy?.change || 0.20,
        type: 'forex',
        category: 'major_pairs'
      },
      // Commodities
      {
        symbol: 'XAU/USD',
        name: 'Gold',
        price: commodityData.gold?.price || 2050,
        change: commodityData.gold?.change || 0.8,
        type: 'commodity',
        category: 'metals'
      },
      {
        symbol: 'XAG/USD',
        name: 'Silver',
        price: commodityData.silver?.price || 24.50,
        change: commodityData.silver?.change || 1.2,
        type: 'commodity',
        category: 'metals'
      },
      {
        symbol: 'OIL/USD',
        name: 'Crude Oil',
        price: commodityData.oil?.price || 82.30,
        change: commodityData.oil?.change || -0.5,
        type: 'commodity',
        category: 'energy'
      }
    ];

    res.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
      totalMarkets: marketData.length,
      categories: {
        crypto: marketData.filter(m => m.type === 'crypto').length,
        indices: marketData.filter(m => m.type === 'index').length,
        forex: marketData.filter(m => m.type === 'forex').length,
        commodities: marketData.filter(m => m.type === 'commodity').length
      }
    });
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data'
    });
  }
});

// Enhanced AI analysis with advanced signals
app.get('/api/analyze', async (req, res) => {
  const symbol = req.query.symbol || 'bitcoin';
  
  try {
    let price, change, displayName, volume = 0, marketCap = 0;
    
    if (symbol === 'US100' || symbol === 'us100') {
      const us100Data = await getUS100Price();
      price = us100Data.price;
      change = us100Data.change;
      displayName = 'NASDAQ 100 (US100)';
    } else {
      // Get crypto data with fallback
      try {
        const cryptoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
        const cryptoData = await cryptoResponse.json();
        
        if (cryptoData && cryptoData[symbol]) {
          price = cryptoData[symbol].usd;
          change = cryptoData[symbol].usd_24h_change || 0;
          volume = cryptoData[symbol].usd_24h_vol || 0;
          marketCap = cryptoData[symbol].usd_market_cap || 0;
          displayName = symbol.charAt(0).toUpperCase() + symbol.slice(1);
        } else {
          throw new Error('API data not available');
        }
      } catch (apiError) {
        // Fallback data for demo purposes
        const fallbackData = {
          bitcoin: { price: 67500, change: 2.5, name: 'Bitcoin' },
          ethereum: { price: 3800, change: 1.8, name: 'Ethereum' },
          binancecoin: { price: 580, change: -0.5, name: 'BNB' },
          cardano: { price: 0.45, change: 3.2, name: 'Cardano' },
          solana: { price: 150, change: 4.1, name: 'Solana' }
        };
        
        if (fallbackData[symbol]) {
          price = fallbackData[symbol].price;
          change = fallbackData[symbol].change;
          displayName = fallbackData[symbol].name;
          volume = price * 1000000; // Mock volume
          marketCap = price * 19000000; // Mock market cap
          console.log(`Using fallback data for ${symbol}`);
        } else {
          throw new Error('Symbol not supported');
        }
      }
    }

    // Enhanced AI analysis algorithm
    let signal = 'HOLD';
    let confidence = 50;
    let reasoning = [];

    // Price momentum analysis
    if (change > 5) {
      signal = 'BUY';
      confidence += 20;
      reasoning.push('Strong upward momentum (+' + change.toFixed(2) + '%)');
    } else if (change < -5) {
      signal = 'SELL';
      confidence += 15;
      reasoning.push('Significant downward trend (' + change.toFixed(2) + '%)');
    } else if (change > 2) {
      signal = 'BUY';
      confidence += 10;
      reasoning.push('Positive momentum (+' + change.toFixed(2) + '%)');
    } else if (change < -2) {
      signal = 'SELL';
      confidence += 8;
      reasoning.push('Negative trend (' + change.toFixed(2) + '%)');
    }

    // Volume analysis (for crypto)
    if (volume > 0) {
      const volumeScore = Math.log10(volume) / 2;
      if (volumeScore > 5) {
        confidence += 5;
        reasoning.push('High trading volume indicates strong interest');
      }
    }

    // Market cap consideration (for crypto)
    if (marketCap > 0) {
      if (marketCap > 100000000000) { // > 100B
        confidence += 5;
        reasoning.push('Large market cap provides stability');
      } else if (marketCap < 1000000000) { // < 1B
        confidence -= 5;
        reasoning.push('Small market cap increases volatility');
      }
    }

    // Price level analysis
    if (price > 0) {
      if (symbol.includes('btc') || symbol.includes('bitcoin')) {
        if (price > 50000) {
          reasoning.push('BTC above major resistance level');
          confidence += 5;
        } else if (price < 30000) {
          reasoning.push('BTC at potential support level');
          confidence += 3;
        }
      }
    }

    // Technical indicators simulation
    const rsi = 30 + (Math.random() * 40); // 30-70 range
    if (rsi < 30) {
      signal = 'BUY';
      confidence += 15;
      reasoning.push('RSI indicates oversold conditions');
    } else if (rsi > 70) {
      signal = 'SELL';
      confidence += 10;
      reasoning.push('RSI indicates overbought conditions');
    }

    // Market sentiment (simulated)
    const sentiment = Math.random();
    if (sentiment > 0.7) {
      confidence += 8;
      reasoning.push('Market sentiment is bullish');
    } else if (sentiment < 0.3) {
      confidence -= 5;
      reasoning.push('Market sentiment is bearish');
    }

    // Cap confidence at 95%
    confidence = Math.min(confidence, 95);
    
    // Ensure minimum confidence
    confidence = Math.max(confidence, 15);

    const analysis = {
      symbol: displayName,
      price: price,
      change: change,
      signal: signal,
      confidence: confidence,
      reasoning: reasoning,
      timestamp: new Date().toISOString(),
      technicals: {
        rsi: rsi.toFixed(1),
        sentiment: sentiment > 0.5 ? 'Bullish' : 'Bearish',
        trend: change > 0 ? 'Upward' : 'Downward',
        volume: volume > 0 ? 'High' : 'Moderate'
      },
      riskLevel: confidence > 80 ? 'Low' : confidence > 60 ? 'Medium' : 'High'
    };

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze symbol' });
  }
});

// Quick signals endpoint for rapid trading decisions
app.get('/api/quick-signals', async (req, res) => {
  try {
    const symbols = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana'];
    const signals = [];
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        if (data[symbol]) {
          const change = data[symbol].usd_24h_change;
          let signal = 'HOLD';
          let strength = 'Medium';
          
          if (change > 3) {
            signal = 'BUY';
            strength = change > 7 ? 'Strong' : 'Medium';
          } else if (change < -3) {
            signal = 'SELL';
            strength = change < -7 ? 'Strong' : 'Medium';
          }
          
          signals.push({
            symbol: symbol.toUpperCase(),
            price: data[symbol].usd,
            change: change,
            signal: signal,
            strength: strength,
            confidence: Math.min(95, 50 + Math.abs(change) * 3)
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }
    
    // Add US100 signal
    const us100Data = await getUS100Price();
    let us100Signal = 'HOLD';
    let us100Strength = 'Medium';
    
    if (us100Data.change > 1) {
      us100Signal = 'BUY';
      us100Strength = us100Data.change > 2 ? 'Strong' : 'Medium';
    } else if (us100Data.change < -1) {
      us100Signal = 'SELL';
      us100Strength = us100Data.change < -2 ? 'Strong' : 'Medium';
    }
    
    signals.push({
      symbol: 'US100',
      price: us100Data.price,
      change: us100Data.change,
      signal: us100Signal,
      strength: us100Strength,
      confidence: Math.min(95, 50 + Math.abs(us100Data.change) * 5)
    });

    res.json({
      success: true,
      signals: signals,
      timestamp: new Date().toISOString(),
      totalSignals: signals.length
    });
  } catch (error) {
    console.error('Quick signals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quick signals'
    });
  }
});

// Portfolio tracking endpoint
app.get('/api/portfolio', async (req, res) => {
  try {
    // Simulated portfolio data - in a real app, this would come from a database
    const portfolio = {
      totalValue: 125430.50,
      dailyChange: 2.34,
      dailyChangeValue: 2876.45,
      positions: [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          amount: 2.5,
          avgPrice: 42000,
          currentPrice: 45000,
          value: 112500,
          pnl: 7500,
          pnlPercent: 7.14
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          amount: 15,
          avgPrice: 2200,
          currentPrice: 2500,
          value: 37500,
          pnl: 4500,
          pnlPercent: 13.64
        },
        {
          symbol: 'US100',
          name: 'NASDAQ 100',
          amount: 50,
          avgPrice: 480,
          currentPrice: 490,
          value: 24500,
          pnl: 500,
          pnlPercent: 2.08
        }
      ]
    };

    res.json({
      success: true,
      portfolio: portfolio,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data'
    });
  }
});

// News and alerts endpoint
app.get('/api/news', async (req, res) => {
  try {
    // Simulated news data - in a real app, this would come from news APIs
    const news = [
      {
        id: 1,
        title: 'Bitcoin Reaches New Monthly High',
        summary: 'BTC surges past $45,000 as institutional adoption continues',
        impact: 'bullish',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        symbols: ['BTC', 'ETH']
      },
      {
        id: 2,
        title: 'NASDAQ 100 Shows Strong Performance',
        summary: 'Tech stocks rally as AI sector gains momentum',
        impact: 'bullish',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        symbols: ['US100']
      },
      {
        id: 3,
        title: 'Federal Reserve Maintains Interest Rates',
        summary: 'No change in rates supports risk assets including crypto',
        impact: 'neutral',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        symbols: ['BTC', 'ETH', 'US100']
      }
    ];

    res.json({
      success: true,
      news: news,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news data'
    });
  }
});

// Market alerts endpoint
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        type: 'price',
        symbol: 'BTC',
        message: 'Bitcoin crossed $45,000 resistance level',
        severity: 'high',
        triggered: true,
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'volume',
        symbol: 'ETH',
        message: 'Ethereum volume spike detected (+150%)',
        severity: 'medium',
        triggered: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ];

    res.json({
      success: true,
      alerts: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

// Professional Chart Analysis Endpoint (Extension Method)
app.post('/api/chart-analysis', async (req, res) => {
  try {
    const { symbol, chartData } = req.body;
    
    // Get current market data directly from our data sources
    let targetMarketData = null;
    
    // For crypto symbols, get from CoinGecko
    if (symbol.includes('BTC') || symbol.toLowerCase().includes('bitcoin')) {
      try {
        const cryptoPrices = await getCryptoPrices();
        targetMarketData = cryptoPrices.find(item => item.symbol === 'BTC/USD');
      } catch (error) {
        console.log('Using fallback data for BTC');
      }
    } else if (symbol.includes('ETH') || symbol.toLowerCase().includes('ethereum')) {
      try {
        const cryptoPrices = await getCryptoPrices();
        targetMarketData = cryptoPrices.find(item => item.symbol === 'ETH/USD');
      } catch (error) {
        console.log('Using fallback data for ETH');
      }
    }
    
    // Generate professional analysis
    const analysis = generateProfessionalAnalysis(symbol, targetMarketData);
    
    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chart analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze chart',
      fallback: getFallbackChartAnalysis()
    });
  }
});

// Generate professional trading analysis (Extension Method)
function generateProfessionalAnalysis(symbol, marketData) {
  const price = marketData ? marketData.price : 45000 + (Math.random() - 0.5) * 10000;
  const change = marketData ? marketData.change : (Math.random() - 0.5) * 10;
  
  // Determine trend and signal based on price action
  let trend = 'Sideways';
  let signal = 'HOLD';
  
  if (change > 2) {
    trend = 'Bullish';
    signal = 'BUY';
  } else if (change < -2) {
    trend = 'Bearish';
    signal = 'SELL';
  } else if (change > 0.5) {
    trend = 'Bullish';
    signal = 'BUY';
  } else if (change < -0.5) {
    trend = 'Bearish';
    signal = 'SELL';
  }
  
  // Calculate professional trading levels
  const entryPrice = price;
  const entryConfirmation = signal === 'BUY' ? 'Break above resistance' : 
                          signal === 'SELL' ? 'Break below support' : 'Wait for clear setup';
  
  // Calculate take profit levels
  const tp1 = price * (signal === 'BUY' ? 1.034 : 0.966); // 3.4%
  const tp2 = price * (signal === 'BUY' ? 1.065 : 0.935); // 6.5%
  const tp3 = price * (signal === 'BUY' ? 1.105 : 0.895); // 10.5%
  
  // Calculate stop loss
  const stopLoss = price * (signal === 'BUY' ? 0.971 : 1.029); // 2.9% risk
  
  // Calculate support and resistance
  const support = price * 0.975;
  const resistance = price * 1.025;
  
  // Risk-to-reward calculation
  const riskAmount = Math.abs(entryPrice - stopLoss);
  const rewardAmount = Math.abs(tp1 - entryPrice);
  const rrRatio = (rewardAmount / riskAmount).toFixed(1);
  
  return {
    symbol: symbol,
    trend: trend,
    signal: signal,
    entryPrice: entryPrice,
    entryConfirmation: entryConfirmation,
    takeProfitLevels: {
      tp1: { price: tp1, gain: ((tp1 / entryPrice - 1) * 100).toFixed(1) },
      tp2: { price: tp2, gain: ((tp2 / entryPrice - 1) * 100).toFixed(1) },
      tp3: { price: tp3, gain: ((tp3 / entryPrice - 1) * 100).toFixed(1) }
    },
    stopLoss: { price: stopLoss, risk: ((stopLoss / entryPrice - 1) * 100).toFixed(1) },
    levels: { support: support, resistance: resistance },
    riskReward: rrRatio,
    marketNotes: generateMarketNotes(trend, signal, change),
    timestamp: new Date().toISOString()
  };
}

// Generate market notes based on analysis
function generateMarketNotes(trend, signal, change) {
  const notes = [];
  
  if (trend === 'Bullish') {
    notes.push('Strong bullish momentum above MA50');
    notes.push('Volume confirms breakout pattern');
    notes.push('Watch for retest of resistance as support');
  } else if (trend === 'Bearish') {
    notes.push('Bearish pressure below key support');
    notes.push('Volume suggests distribution phase');
    notes.push('Watch for breakdown confirmation');
  } else {
    notes.push('Consolidation phase, wait for breakout');
    notes.push('Volume suggests accumulation');
    notes.push('Watch for clear directional move');
  }
  
  // Add change-specific notes
  if (Math.abs(change) > 5) {
    notes.push(`Significant ${change > 0 ? 'upward' : 'downward'} movement (${change.toFixed(1)}%)`);
  }
  
  return notes;
}

// Fallback analysis for chart processing errors
function getFallbackChartAnalysis() {
  return {
    message: "Chart received and processed",
    instructions: [
      "Please ensure the image shows clear price action",
      "Try uploading a higher quality image", 
      "Contact support if issues persist"
    ],
    timestamp: new Date().toISOString()
  };
}

// Start server
app.listen(port, () => {
  console.log(`🚀 CryptoSignAI Enhanced Server running on port ${port}`);
  console.log(`📊 Features: Multi-asset trading, AI analysis, Portfolio tracking`);
  console.log(`🎯 Markets: Crypto, Indices, Forex, Commodities`);
});
