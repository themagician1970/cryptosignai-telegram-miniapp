// Optional Telegram Bot Script for CryptoSignAI Mini App
// This adds chat commands alongside the web interface

import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

// Replace with your bot token from BotFather
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const WEB_APP_URL = 'https://cryptosignai-miniapp.onrender.com'; // Your deployed app URL

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Welcome message with mini app button
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Open CryptoSignAI Platform',
            web_app: { url: WEB_APP_URL }
          }
        ],
        [
          { text: '📊 Quick Prices', callback_data: 'prices' },
          { text: '⚡ AI Signals', callback_data: 'signals' }
        ],
        [
          { text: '❓ Help', callback_data: 'help' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, 
    `🚀 *Welcome to CryptoSignAI!*\n\n` +
    `Your AI-powered trading companion with:\n` +
    `• Real-time crypto & US100 prices\n` +
    `• Smart trading signals\n` +
    `• Interactive TradingView charts\n` +
    `• Market analysis & insights\n\n` +
    `Tap the button below to start trading! 👇`,
    { ...options, parse_mode: 'Markdown' }
  );
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = message.chat.id;

  switch (data) {
    case 'prices':
      try {
        const response = await fetch(`${WEB_APP_URL}/api/market-overview`);
        const prices = await response.json();
        
        let priceText = '📊 *Current Market Prices*\n\n';
        Object.entries(prices).forEach(([symbol, data]) => {
          const changeEmoji = data.change >= 0 ? '📈' : '📉';
          const changeSign = data.change >= 0 ? '+' : '';
          priceText += `${changeEmoji} *${symbol}*: $${data.price.toFixed(2)} (${changeSign}${data.change.toFixed(2)}%)\n`;
        });
        
        priceText += '\n💡 _Tap "Open Platform" for detailed analysis_';
        
        bot.sendMessage(chatId, priceText, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Error fetching prices. Please try the web app.');
      }
      break;

    case 'signals':
      const signalOptions = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '₿ BTC Signal', callback_data: 'signal_BTC/USDT' },
              { text: '⟠ ETH Signal', callback_data: 'signal_ETH/USDT' }
            ],
            [
              { text: '🏛️ US100 Signal', callback_data: 'signal_US100' },
              { text: '🚀 Open Full Platform', web_app: { url: WEB_APP_URL } }
            ]
          ]
        }
      };
      
      bot.sendMessage(chatId, 
        '⚡ *Choose Asset for AI Signal*\n\n' +
        'Select an asset to get instant AI-powered trading signals:',
        { ...signalOptions, parse_mode: 'Markdown' }
      );
      break;

    case 'help':
      const helpText = 
        `❓ *CryptoSignAI Help*\n\n` +
        `*Available Commands:*\n` +
        `/start - Launch the platform\n` +
        `/help - Show this help message\n\n` +
        `*Quick Actions:*\n` +
        `📊 Quick Prices - Get instant market data\n` +
        `⚡ AI Signals - Get trading recommendations\n` +
        `🚀 Open Platform - Access full web interface\n\n` +
        `*Features:*\n` +
        `• Real-time crypto prices (BTC, ETH, BNB, ADA)\n` +
        `• US100 (NASDAQ) market data\n` +
        `• AI-powered trading signals\n` +
        `• Interactive TradingView charts\n` +
        `• Mobile-optimized interface\n\n` +
        `*Need Support?*\n` +
        `Open the full platform for comprehensive trading tools!`;
        
      bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
      break;

    default:
      if (data.startsWith('signal_')) {
        const symbol = data.replace('signal_', '');
        try {
          const encodedSymbol = encodeURIComponent(symbol);
          const response = await fetch(`${WEB_APP_URL}/api/quick-signal/${encodedSymbol}`);
          const signal = await response.json();
          
          const signalEmoji = signal.recommendation.includes('Buy') ? '🟢' : 
                             signal.recommendation.includes('Sell') ? '🔴' : '🟡';
          
          const signalText = 
            `${signalEmoji} *${signal.symbol} AI Signal*\n\n` +
            `📈 *Recommendation*: ${signal.recommendation}\n` +
            `🎯 *Confidence*: ${signal.confidence}\n` +
            `💰 *Current Price*: $${parseFloat(signal.price).toFixed(2)}\n` +
            `📊 *24h Change*: ${signal.change}\n` +
            `⏰ *Generated*: ${new Date(signal.timestamp).toLocaleTimeString()}\n\n` +
            `💡 _Open full platform for detailed analysis_`;
            
          bot.sendMessage(chatId, signalText, { parse_mode: 'Markdown' });
        } catch (error) {
          bot.sendMessage(chatId, '❌ Error generating signal. Please try the web app.');
        }
      }
      break;
  }

  // Answer callback query to remove loading state
  bot.answerCallbackQuery(callbackQuery.id);
});

// Handle any other messages
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Open CryptoSignAI Platform', web_app: { url: WEB_APP_URL } }]
      ]
    }
  };
  
  bot.sendMessage(chatId, 
    `🤖 I'm your CryptoSignAI assistant!\n\n` +
    `Use the button below to access the full trading platform, or try:\n` +
    `/start - Main menu\n` +
    `/help - Get help`,
    options
  );
});

console.log('🤖 CryptoSignAI Telegram Bot is running...');
console.log('🌐 Web App URL:', WEB_APP_URL);

export default bot;
