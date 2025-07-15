const TelegramBot = require('node-telegram-bot-api');

// Your bot token
const token = '8053605696:AAEkjm-7Uj8DTpvgjIaVSTbESxxgW2NJdng';
const bot = new TelegramBot(token, { polling: true });

// Your mini app URL (replace with your actual Render.com URL)
const MINI_APP_URL = 'https://cryptosignai-miniapp.onrender.com';

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  const welcomeMessage = `🚀 *Welcome to CryptoSignAI!*

Your professional crypto trading companion with AI-powered analysis.

🎯 *What can I do for you?*
• 📊 Live market charts and analysis
• 🤖 AI-powered trading insights
• ⚡ Quick trading signals
• 📱 Mobile-optimized interface

*Tap the button below to start trading!* 👇`;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Open Trading App',
            web_app: { url: MINI_APP_URL }
          }
        ],
        [
          {
            text: '📊 Quick Analysis',
            web_app: { url: MINI_APP_URL + '?tab=analysis' }
          },
          {
            text: '📈 Live Charts',
            web_app: { url: MINI_APP_URL + '?tab=charts' }
          }
        ],
        [
          {
            text: 'ℹ️ Help',
            callback_data: 'help'
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, welcomeMessage, options);
});

// Mini app command
bot.onText(/\/miniapp/, (msg) => {
  const chatId = msg.chat.id;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Open CryptoSignAI',
            web_app: { url: MINI_APP_URL }
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, '🎯 *Launch your trading dashboard:*', { 
    parse_mode: 'Markdown',
    ...options 
  });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `🆘 *CryptoSignAI Help*

*Available Commands:*
/start - Welcome message with app access
/miniapp - Direct link to trading app
/help - This help message

*Mini App Features:*
📊 *Analysis Tab* - AI-powered market analysis
📈 *Charts Tab* - Live TradingView charts
🎯 *Signals Tab* - Trading recommendations
💼 *Portfolio Tab* - Track your performance

*How to use:*
1. Tap any "Open App" button
2. Choose your analysis type
3. Get AI-powered insights
4. Make informed trading decisions

*Need support?* Contact @themagician1970`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Callback query handler
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === 'help') {
    bot.answerCallbackQuery(callbackQuery.id);
    bot.sendMessage(message.chat.id, `🆘 *CryptoSignAI Help*

*Mini App Features:*
📊 Analysis - AI market insights
📈 Charts - Live TradingView data
🎯 Signals - Trading recommendations
💼 Portfolio - Performance tracking

*Simply tap "Open Trading App" to get started!*`, { 
      parse_mode: 'Markdown' 
    });
  }
});

// Error handling
bot.on('error', (error) => {
  console.log('Bot error:', error);
});

console.log('🤖 CryptoSignAI Telegram Bot is running...');
console.log('📱 Mini App URL:', MINI_APP_URL);
