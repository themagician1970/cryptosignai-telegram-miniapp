// 🤖 ADD THIS TO YOUR EXISTING TELEGRAM BOT
// File: Add to your main bot.js or telegramBot.js

// 1. ADD THIS AT THE TOP (after your existing imports)
const MINI_APP_URL = 'YOUR_DEPLOYED_URL_HERE'; // We'll update this after deployment

// 2. ADD THESE COMMANDS TO YOUR EXISTING BOT

// Enhanced /start command with Mini App
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Trader';
  
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Open CryptoSignAI Mini App',
          web_app: { url: MINI_APP_URL }
        }
      ],
      [
        {
          text: '🔍 Quick Analysis',
          web_app: { url: `${MINI_APP_URL}#analysis` }
        },
        {
          text: '📊 Live Charts',
          web_app: { url: `${MINI_APP_URL}#charts` }
        }
      ],
      [
        {
          text: '🎯 Trading Signals',
          web_app: { url: `${MINI_APP_URL}#signals` }
        },
        {
          text: '💼 Portfolio',
          web_app: { url: `${MINI_APP_URL}#portfolio` }
        }
      ],
      // ... your existing buttons (analyze_image, settings, etc.)
    ]
  };
  
  const welcomeMessage = `🎉 Welcome to CryptoSignAI, ${firstName}!\n\n` +
    '🚀 **Your Complete Trading Assistant**\n\n' +
    '📱 **New Mini App Features:**\n' +
    '• 📈 Real-time chart analysis\n' +
    '• 🤖 AI-powered recommendations\n' +
    '• 🎯 Live trading signals\n' +
    '• 💼 Portfolio tracking\n' +
    '• 📊 Professional charts\n\n' +
    '📸 **Bot Features:**\n' +
    '• Chart image analysis\n' +
    '• Quick market updates\n' +
    '• Alert notifications\n\n' +
    '👆 Choose an option below to get started:';
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
});

// New /app command
bot.onText(/\/app/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [[
      {
        text: '📊 Open CryptoSignAI App',
        web_app: { url: MINI_APP_URL }
      }
    ]]
  };
  
  await bot.sendMessage(chatId, 
    '🚀 Welcome to CryptoSignAI Mini App!\n\n' +
    '📈 Features:\n' +
    '• Real-time chart analysis\n' +
    '• AI-powered trading signals\n' +
    '• Portfolio tracking\n' +
    '• Live market data\n\n' +
    'Click the button below to open the app:',
    { reply_markup: keyboard }
  );
});

// Handle Mini App data
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = JSON.parse(msg.web_app.data);
    
    console.log('Received Mini App data:', data);
    
    switch (data.action) {
      case 'analysis_result':
        await bot.sendMessage(chatId, 
          `📊 **Analysis Complete**\n\n` +
          `Symbol: ${data.data.symbol}\n` +
          `Position: ${data.data.position}\n` +
          `Entry: ${data.data.entry}\n` +
          `Confidence: ${data.data.confidence}`,
          { parse_mode: 'Markdown' }
        );
        break;
        
      case 'chart_captured':
        await bot.sendMessage(chatId, 
          '📸 Chart captured successfully!\n' +
          'Analysis will be sent to you shortly.'
        );
        break;
        
      default:
        console.log('Unknown Mini App action:', data.action);
    }
  } catch (error) {
    console.error('Error processing Mini App data:', error);
  }
});

// 3. SET BOT COMMANDS (send this to BotFather)
/*
start - 🏠 Main menu with Mini App
app - 🚀 Open Trading Mini App
analyze - 🔍 AI Analysis
charts - 📊 Live Charts
signals - 🎯 Trading Signals
portfolio - 💼 Portfolio
help - ❓ Help & Support
*/

console.log('🚀 Mini App integration added to bot!');
console.log(`📱 Mini App URL: ${MINI_APP_URL}`);
