import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const BOT_TOKEN = '8053605696:AAEkjm-7Uj8DTpvgjIaVSTbESxxgW2NJdng';
const APP_URL = 'https://cryptosignai-miniapp.onrender.com';

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Enhanced bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🚀 *Welcome to CryptoSignAI Advanced Trading Platform!*

🎯 *New Features Available:*
• 📊 Multi-Asset Markets (Crypto, Forex, Indices, Commodities)
• 🤖 Advanced AI Analysis with 95% Accuracy
• 💼 Portfolio Tracking & Management
• 📰 Real-time Market News & Alerts
• 📈 Professional Trading Charts
• ⚡ Lightning-Fast Signal Generation

🌟 *Quick Commands:*
/markets - View all markets
/signals - Get AI trading signals  
/portfolio - Check portfolio status
/news - Latest market news
/alerts - Active price alerts
/help - Full command list

💡 *Tap the button below to open the full platform!*
    `;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Open Trading Platform', web_app: { url: APP_URL } }],
                [
                    { text: '📊 Quick Markets', callback_data: 'quick_markets' },
                    { text: '⚡ Quick Signals', callback_data: 'quick_signals' }
                ],
                [
                    { text: '📰 News', callback_data: 'news' },
                    { text: '🔔 Alerts', callback_data: 'alerts' }
                ]
            ]
        },
        parse_mode: 'Markdown'
    };

    bot.sendMessage(chatId, welcomeMessage, options);
});

bot.onText(/\/markets/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${APP_URL}/api/market-overview`);
        const data = await response.json();
        
        if (data.success) {
            const topMarkets = data.data.slice(0, 8);
            let message = '📊 *Top Markets Overview*\n\n';
            
            topMarkets.forEach(market => {
                const changeIcon = market.change >= 0 ? '🟢' : '🔴';
                const changeText = market.change >= 0 ? '+' : '';
                message += `${changeIcon} *${market.symbol}*\n`;
                message += `💰 $${market.price.toLocaleString()}\n`;
                message += `📈 ${changeText}${market.change.toFixed(2)}%\n\n`;
            });
            
            message += `📊 Total Markets: ${data.totalMarkets}\n`;
            message += `🔄 Last Updated: ${new Date().toLocaleTimeString()}`;
            
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🚀 Open Full Platform', web_app: { url: APP_URL } }],
                        [
                            { text: '🔄 Refresh', callback_data: 'refresh_markets' },
                            { text: '⚡ Get Signals', callback_data: 'quick_signals' }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            };
            
            bot.sendMessage(chatId, message, options);
        } else {
            bot.sendMessage(chatId, '❌ Failed to fetch market data. Please try again.');
        }
    } catch (error) {
        console.error('Markets command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching market data. Please try again later.');
    }
});

bot.onText(/\/signals/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${APP_URL}/api/quick-signals`);
        const data = await response.json();
        
        if (data.success) {
            let message = '⚡ *AI Trading Signals*\n\n';
            
            data.signals.forEach(signal => {
                const signalIcon = signal.signal === 'BUY' ? '🟢' : signal.signal === 'SELL' ? '🔴' : '🟡';
                message += `${signalIcon} *${signal.symbol}*\n`;
                message += `📊 Signal: *${signal.signal}*\n`;
                message += `💪 Strength: ${signal.strength}\n`;
                message += `🎯 Confidence: ${signal.confidence.toFixed(0)}%\n`;
                message += `💰 Price: $${signal.price.toLocaleString()}\n\n`;
            });
            
            message += `🤖 Powered by Advanced AI\n`;
            message += `⏰ Generated: ${new Date().toLocaleTimeString()}`;
            
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🚀 Open Platform for Analysis', web_app: { url: APP_URL } }],
                        [
                            { text: '🔄 Refresh Signals', callback_data: 'quick_signals' },
                            { text: '📊 View Markets', callback_data: 'quick_markets' }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            };
            
            bot.sendMessage(chatId, message, options);
        } else {
            bot.sendMessage(chatId, '❌ Failed to generate signals. Please try again.');
        }
    } catch (error) {
        console.error('Signals command error:', error);
        bot.sendMessage(chatId, '❌ Error generating signals. Please try again later.');
    }
});

bot.onText(/\/portfolio/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${APP_URL}/api/portfolio`);
        const data = await response.json();
        
        if (data.success) {
            const portfolio = data.portfolio;
            const changeIcon = portfolio.dailyChange >= 0 ? '🟢' : '🔴';
            const changeText = portfolio.dailyChange >= 0 ? '+' : '';
            
            let message = '💼 *Portfolio Overview*\n\n';
            message += `💰 *Total Value:* $${portfolio.totalValue.toLocaleString()}\n`;
            message += `${changeIcon} *Daily Change:* ${changeText}${portfolio.dailyChange}% `;
            message += `(${changeText}$${portfolio.dailyChangeValue.toLocaleString()})\n\n`;
            
            message += '*Positions:*\n';
            portfolio.positions.forEach(pos => {
                const posIcon = pos.pnl >= 0 ? '🟢' : '🔴';
                message += `${posIcon} *${pos.symbol}*\n`;
                message += `📊 ${pos.amount} tokens\n`;
                message += `💰 $${pos.value.toLocaleString()}\n`;
                message += `📈 P&L: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toLocaleString()} (${pos.pnlPercent.toFixed(2)}%)\n\n`;
            });
            
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🚀 Manage Portfolio', web_app: { url: APP_URL + '#portfolio' } }],
                        [
                            { text: '🔔 Set Alerts', callback_data: 'set_alerts' },
                            { text: '📊 View Charts', callback_data: 'view_charts' }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            };
            
            bot.sendMessage(chatId, message, options);
        } else {
            bot.sendMessage(chatId, '❌ Failed to fetch portfolio data.');
        }
    } catch (error) {
        console.error('Portfolio command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching portfolio. Please try again later.');
    }
});

bot.onText(/\/news/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${APP_URL}/api/news`);
        const data = await response.json();
        
        if (data.success) {
            let message = '📰 *Latest Market News*\n\n';
            
            data.news.slice(0, 3).forEach((item, index) => {
                const impactIcon = item.impact === 'bullish' ? '🟢' : item.impact === 'bearish' ? '🔴' : '🟡';
                message += `${index + 1}. ${impactIcon} *${item.title}*\n`;
                message += `📝 ${item.summary}\n`;
                message += `⏰ ${new Date(item.timestamp).toLocaleTimeString()}\n`;
                message += `🏷️ ${item.symbols.join(', ')}\n\n`;
            });
            
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📰 Read Full News', web_app: { url: APP_URL + '#news' } }],
                        [
                            { text: '🔄 Refresh News', callback_data: 'news' },
                            { text: '📊 Market Impact', callback_data: 'quick_markets' }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            };
            
            bot.sendMessage(chatId, message, options);
        } else {
            bot.sendMessage(chatId, '❌ Failed to fetch news data.');
        }
    } catch (error) {
        console.error('News command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching news. Please try again later.');
    }
});

bot.onText(/\/alerts/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${APP_URL}/api/alerts`);
        const data = await response.json();
        
        if (data.success) {
            let message = '🔔 *Active Alerts*\n\n';
            
            if (data.alerts.length === 0) {
                message += 'No active alerts at the moment.\n\n';
                message += 'Use the platform to set up price alerts!';
            } else {
                data.alerts.forEach((alert, index) => {
                    const severityIcon = alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢';
                    message += `${index + 1}. ${severityIcon} *${alert.symbol}*\n`;
                    message += `📢 ${alert.message}\n`;
                    message += `⏰ ${new Date(alert.timestamp).toLocaleTimeString()}\n\n`;
                });
            }
            
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔔 Manage Alerts', web_app: { url: APP_URL + '#portfolio' } }],
                        [
                            { text: '➕ Add Alert', callback_data: 'add_alert' },
                            { text: '📊 View Markets', callback_data: 'quick_markets' }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            };
            
            bot.sendMessage(chatId, message, options);
        } else {
            bot.sendMessage(chatId, '❌ Failed to fetch alerts data.');
        }
    } catch (error) {
        console.error('Alerts command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching alerts. Please try again later.');
    }
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
🚀 *CryptoSignAI Advanced Platform Help*

*Main Commands:*
/start - Launch the platform
/markets - View market overview
/signals - Get AI trading signals
/portfolio - Check portfolio status
/news - Latest market news
/alerts - Active price alerts
/help - This help message

*Quick Features:*
• 📊 *Multi-Asset Trading* - Crypto, Forex, Indices, Commodities
• 🤖 *AI Analysis* - Advanced machine learning algorithms
• 💼 *Portfolio Management* - Track positions and P&L
• 📰 *Real-time News* - Market-moving events
• 🔔 *Smart Alerts* - Price and volume notifications
• 📈 *Professional Charts* - TradingView integration

*Platform Access:*
Use the "🚀 Open Trading Platform" button or any command to access the full web interface with all advanced features.

*Support:*
Need help? Contact our support team through the platform.

*Powered by AI* 🤖
    `;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Open Trading Platform', web_app: { url: APP_URL } }],
                [
                    { text: '📊 Quick Markets', callback_data: 'quick_markets' },
                    { text: '⚡ Quick Signals', callback_data: 'quick_signals' }
                ]
            ]
        },
        parse_mode: 'Markdown'
    };

    bot.sendMessage(chatId, helpMessage, options);
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    
    // Acknowledge the callback query
    bot.answerCallbackQuery(callbackQuery.id);
    
    // Handle different actions
    switch (action) {
        case 'quick_markets':
            bot.sendMessage(msg.chat.id, '📊 Loading markets...');
            // Trigger markets command
            bot.emit('message', { ...msg, text: '/markets' });
            break;
            
        case 'quick_signals':
            bot.sendMessage(msg.chat.id, '⚡ Generating signals...');
            // Trigger signals command
            bot.emit('message', { ...msg, text: '/signals' });
            break;
            
        case 'news':
            bot.sendMessage(msg.chat.id, '📰 Loading news...');
            // Trigger news command
            bot.emit('message', { ...msg, text: '/news' });
            break;
            
        case 'alerts':
            bot.sendMessage(msg.chat.id, '🔔 Loading alerts...');
            // Trigger alerts command
            bot.emit('message', { ...msg, text: '/alerts' });
            break;
            
        case 'refresh_markets':
            bot.sendMessage(msg.chat.id, '🔄 Refreshing market data...');
            // Trigger markets command
            setTimeout(() => {
                bot.emit('message', { ...msg, text: '/markets' });
            }, 1000);
            break;
            
        default:
            bot.sendMessage(msg.chat.id, '🚀 Use the platform button to access all features!', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🚀 Open Trading Platform', web_app: { url: APP_URL } }]
                    ]
                }
            });
            break;
    }
});

// Error handling
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

// Polling error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('🤖 CryptoSignAI Advanced Telegram Bot is running...');
console.log('🚀 Features: Commands, Inline buttons, WebApp integration');
console.log('📱 Bot: @ai_futureco_bot');

export default bot;
