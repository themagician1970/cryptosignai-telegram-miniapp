// CryptoSignAI - Simple & Clean Trading Platform
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
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

// Simple market data from CoinGecko (free, no API key needed)
app.get('/api/market-overview', async (req, res) => {
  try {
    // Get crypto data
    const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano&vs_currencies=usd&include_24hr_change=true');
    const cryptoData = await cryptoResponse.json();
    
    // Get US100 (NASDAQ 100) data from Alpha Vantage
    const us100Response = await fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=JHAUBJXIG3L5PDHE');
    const us100Data = await us100Response.json();
    
    let us100Price = 0;
    let us100Change = 0;
    
    if (us100Data['Global Quote']) {
      const quote = us100Data['Global Quote'];
      us100Price = parseFloat(quote['05. price']);
      us100Change = parseFloat(quote['09. change']);
      // Convert to percentage
      us100Change = (us100Change / (us100Price - us100Change)) * 100;
    }
    
    const formatted = {
      'BTC/USD': {
        price: cryptoData.bitcoin.usd,
        change: cryptoData.bitcoin.usd_24h_change
      },
      'ETH/USD': {
        price: cryptoData.ethereum.usd,
        change: cryptoData.ethereum.usd_24h_change
      },
      'BNB/USD': {
        price: cryptoData.binancecoin.usd,
        change: cryptoData.binancecoin.usd_24h_change
      },
      'ADA/USD': {
        price: cryptoData.cardano.usd,
        change: cryptoData.cardano.usd_24h_change
      },
      'US100': {
        price: us100Price,
        change: us100Change
      }
    };
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Simple AI analysis using CoinGecko + Gemini (more reliable)
app.get('/api/analyze', async (req, res) => {
  const symbol = req.query.symbol || 'bitcoin';
  
  try {
    let coinData;
    let price;
    let change;
    let displayName;
    
    if (symbol === 'US100' || symbol === 'us100') {
      // Handle US100 separately
      const response = await fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=JHAUBJXIG3L5PDHE');
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        price = parseFloat(quote['05. price']);
        const priceChange = parseFloat(quote['09. change']);
        change = (priceChange / (price - priceChange)) * 100;
        displayName = 'NASDAQ 100 (US100)';
      } else {
        throw new Error('US100 data not available');
      }
    } else {
      // Handle crypto currencies
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
      const data = await response.json();
      
      coinData = data[symbol] || data['bitcoin']; // Fallback to bitcoin if symbol not found
      if (coinData) {
        price = coinData.usd;
        change = coinData.usd_24h_change;
        displayName = symbol.charAt(0).toUpperCase() + symbol.slice(1);
      } else {
        throw new Error('Market data not available');
      }
    }
    
    // Generate simple AI-like analysis based on market data
    let analysis = `${displayName} analysis: Current price $${price.toFixed(2)} USD. `;
    let position = "Hold";
    let confidence = "60%";
    
    if (change > 5) {
      analysis += "Strong bullish momentum with +5% daily gain. Market sentiment is very positive.";
      position = "Long";
      confidence = "85%";
    } else if (change > 2) {
      analysis += "Positive momentum with moderate gains. Upward trend confirmed.";
      position = "Long"; 
      confidence = "75%";
    } else if (change < -5) {
      analysis += "Strong bearish pressure with -5% daily loss. High selling pressure detected.";
      position = "Short";
      confidence = "85%";
    } else if (change < -2) {
      analysis += "Negative momentum with declining prices. Bearish sentiment emerging.";
      position = "Short";
      confidence = "75%";
    } else {
      analysis += "Sideways movement with low volatility. Market consolidation phase.";
      position = "Hold";
      confidence = "60%";
    }
    
    const recommendations = {
      position: position,
      entry: price.toFixed(2),
      possibility: confidence
    };
    
    res.json({ 
      analysis: analysis, 
      recommendations: recommendations,
      price: price
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
});

// Quick signal generator
app.get('/api/quick-signal/:symbol', async (req, res) => {
  const { symbol } = req.params;
  
  try {
    let coinData;
    let change;
    let price;
    
    if (symbol === 'US100') {
      // Handle US100 separately using Alpha Vantage
      const response = await fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=JHAUBJXIG3L5PDHE');
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        price = parseFloat(quote['05. price']);
        const priceChange = parseFloat(quote['09. change']);
        change = (priceChange / (price - priceChange)) * 100;
      } else {
        throw new Error('US100 data not available');
      }
    } else {
      // Handle crypto currencies using CoinGecko
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${getCoingeckoId(symbol)}&vs_currencies=usd&include_24hr_change=true`);
      const data = await response.json();
      
      coinData = Object.values(data)[0];
      change = coinData.usd_24h_change;
      price = coinData.usd;
    }
    
    let recommendation = 'Hold';
    let confidence = '60%';
    
    if (change > 5) {
      recommendation = 'Strong Buy';
      confidence = '85%';
    } else if (change > 2) {
      recommendation = 'Buy';
      confidence = '75%';
    } else if (change < -5) {
      recommendation = 'Strong Sell';
      confidence = '85%';
    } else if (change < -2) {
      recommendation = 'Sell';
      confidence = '75%';
    }
    
    res.json({
      symbol,
      recommendation,
      confidence,
      change: change.toFixed(2) + '%',
      price: price,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Signal generation failed' });
  }
});

// Helper function to map symbols to CoinGecko IDs or handle special cases
function getCoingeckoId(symbol) {
  const mapping = {
    'BTC/USDT': 'bitcoin',
    'ETH/USDT': 'ethereum',
    'BNB/USDT': 'binancecoin',
    'ADA/USDT': 'cardano',
    'US100': 'US100' // Special case for US100
  };
  return mapping[symbol] || 'bitcoin';
}

// Start server
app.listen(port, () => {
  console.log(`🚀 CryptoSignAI server running on port ${port}`);
});