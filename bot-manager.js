#!/usr/bin/env node

/**
 * 🤖 CryptoSignAI Telegram Bot Manager
 * Professional bot management with monitoring and auto-restart
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    BOT_TOKEN: process.env.BOT_TOKEN || '8053605696:AAEkjm-7Uj8DTpvgjIaVSTbESxxgW2NJdng',
    MINI_APP_URL: process.env.MINI_APP_URL || 'https://cryptosignai-miniapp.onrender.com',
    LOG_FILE: path.join(__dirname, 'bot.log'),
    RESTART_DELAY: 5000, // 5 seconds
    MAX_RESTARTS: 10
};

// Logger
class Logger {
    static log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        console.log(logEntry.trim());
        
        // Write to log file
        fs.appendFileSync(CONFIG.LOG_FILE, logEntry);
    }
    
    static info(message) { this.log('INFO', message); }
    static warn(message) { this.log('WARN', message); }
    static error(message) { this.log('ERROR', message); }
    static success(message) { this.log('SUCCESS', message); }
}

// Bot Manager
class CryptoSignAIBot {
    constructor() {
        this.bot = null;
        this.restartCount = 0;
        this.isRunning = false;
        this.startTime = new Date();
    }

    async initialize() {
        try {
            this.bot = new TelegramBot(CONFIG.BOT_TOKEN, { polling: true });
            this.setupHandlers();
            this.isRunning = true;
            Logger.success('🤖 CryptoSignAI Bot initialized successfully!');
            Logger.info(`📱 Mini App URL: ${CONFIG.MINI_APP_URL}`);
            return true;
        } catch (error) {
            Logger.error(`Failed to initialize bot: ${error.message}`);
            return false;
        }
    }

    setupHandlers() {
        // Start command
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            const firstName = msg.from.first_name || 'Trader';
            
            Logger.info(`📥 /start command from ${firstName} (${chatId})`);
            
            const welcomeMessage = `🚀 *Welcome to CryptoSignAI, ${firstName}!*

Your professional crypto trading companion with AI-powered analysis.

🎯 *What can I do for you?*
• 📊 Live market charts and technical analysis
• 🤖 AI-powered trading insights and predictions
• ⚡ Quick trading signals with entry/exit points
• 📱 Mobile-optimized professional interface
• 💼 Portfolio tracking and performance metrics

*Ready to elevate your trading game?* 👇`;

            const options = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🚀 Open Trading Dashboard',
                                web_app: { url: CONFIG.MINI_APP_URL }
                            }
                        ],
                        [
                            {
                                text: '📊 Quick Analysis',
                                web_app: { url: `${CONFIG.MINI_APP_URL}?tab=analysis` }
                            },
                            {
                                text: '📈 Live Charts',
                                web_app: { url: `${CONFIG.MINI_APP_URL}?tab=charts` }
                            }
                        ],
                        [
                            {
                                text: '⚡ Trading Signals',
                                web_app: { url: `${CONFIG.MINI_APP_URL}?tab=signals` }
                            },
                            {
                                text: '💼 Portfolio',
                                web_app: { url: `${CONFIG.MINI_APP_URL}?tab=portfolio` }
                            }
                        ],
                        [
                            {
                                text: 'ℹ️ Help & Guide',
                                callback_data: 'help'
                            },
                            {
                                text: '📞 Support',
                                callback_data: 'support'
                            }
                        ]
                    ]
                }
            };

            this.bot.sendMessage(chatId, welcomeMessage, options);
        });

        // Mini app command
        this.bot.onText(/\/miniapp/, (msg) => {
            const chatId = msg.chat.id;
            Logger.info(`📥 /miniapp command from ${chatId}`);
            
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🚀 Launch CryptoSignAI Dashboard',
                                web_app: { url: CONFIG.MINI_APP_URL }
                            }
                        ]
                    ]
                }
            };

            this.bot.sendMessage(chatId, '🎯 *Ready to analyze the markets?*\n\nTap the button below to access your professional trading dashboard!', { 
                parse_mode: 'Markdown',
                ...options 
            });
        });

        // Help command
        this.bot.onText(/\/help/, (msg) => {
            this.sendHelpMessage(msg.chat.id);
        });

        // Status command (admin)
        this.bot.onText(/\/status/, (msg) => {
            const uptime = new Date() - this.startTime;
            const uptimeString = this.formatUptime(uptime);
            
            const statusMessage = `🤖 *Bot Status Report*

✅ *Status:* Running
⏱️ *Uptime:* ${uptimeString}
🔄 *Restarts:* ${this.restartCount}
📱 *Mini App:* ${CONFIG.MINI_APP_URL}
📊 *Version:* 1.0.0

*System Information:*
• Node.js: ${process.version}
• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
• Platform: ${process.platform}`;

            this.bot.sendMessage(msg.chat.id, statusMessage, { parse_mode: 'Markdown' });
        });

        // Callback query handler
        this.bot.on('callback_query', (callbackQuery) => {
            const message = callbackQuery.message;
            const data = callbackQuery.data;

            this.bot.answerCallbackQuery(callbackQuery.id);

            if (data === 'help') {
                this.sendHelpMessage(message.chat.id);
            } else if (data === 'support') {
                this.sendSupportMessage(message.chat.id);
            }
        });

        // Error handling
        this.bot.on('error', (error) => {
            Logger.error(`Bot error: ${error.message}`);
            this.handleError(error);
        });

        this.bot.on('polling_error', (error) => {
            Logger.error(`Polling error: ${error.message}`);
            this.handleError(error);
        });

        Logger.success('✅ All bot handlers configured');
    }

    sendHelpMessage(chatId) {
        const helpMessage = `🆘 *CryptoSignAI Help & Guide*

*📱 Available Commands:*
/start - Welcome message with app access
/miniapp - Direct link to trading dashboard
/help - This help message
/status - Bot status information

*🎯 Mini App Features:*

*📊 Analysis Tab*
• Upload chart screenshots for AI analysis
• Get detailed market insights
• Receive trading recommendations
• Technical indicator explanations

*📈 Charts Tab*
• Live TradingView integration
• Real-time price data
• Multiple timeframes
• Professional trading tools

*⚡ Signals Tab*
• Quick buy/sell recommendations
• Entry and exit points
• Risk management advice
• Market sentiment analysis

*💼 Portfolio Tab*
• Track your trading performance
• Monitor profit/loss
• Portfolio diversification tips
• Investment allocation insights

*🔧 How to Use:*
1. Tap any "Open App" button
2. Choose your preferred analysis method
3. Upload charts or select trading pairs
4. Get AI-powered trading insights
5. Make informed trading decisions

*💡 Pro Tips:*
• Use multiple timeframes for better analysis
• Always consider risk management
• Follow the AI recommendations but do your own research
• Check signals regularly for market updates

*📞 Need Help?*
Contact @themagician1970 for support or report issues.`;

        this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }

    sendSupportMessage(chatId) {
        const supportMessage = `📞 *CryptoSignAI Support*

*🆘 Get Help:*
• Telegram: @themagician1970
• Email: support@cryptosignai.com
• GitHub: github.com/themagician1970

*🐛 Report Issues:*
• Bug reports
• Feature requests
• Technical problems
• Feedback and suggestions

*📚 Resources:*
• User guide and tutorials
• Trading tips and strategies
• API documentation
• Community discussions

*⚡ Quick Solutions:*
• Restart the mini app if it's not loading
• Check your internet connection
• Clear browser cache
• Try different browser/device

*Response Time:*
We typically respond within 24 hours.

*Thank you for using CryptoSignAI!* 🚀`;

        this.bot.sendMessage(chatId, supportMessage, { parse_mode: 'Markdown' });
    }

    handleError(error) {
        if (this.restartCount < CONFIG.MAX_RESTARTS) {
            this.restartCount++;
            Logger.warn(`🔄 Attempting restart #${this.restartCount} in ${CONFIG.RESTART_DELAY}ms...`);
            
            setTimeout(() => {
                this.restart();
            }, CONFIG.RESTART_DELAY);
        } else {
            Logger.error('❌ Maximum restart attempts reached. Bot stopped.');
            process.exit(1);
        }
    }

    async restart() {
        try {
            if (this.bot) {
                this.bot.stopPolling();
            }
            
            Logger.info('🔄 Restarting bot...');
            await this.initialize();
            Logger.success('✅ Bot restarted successfully');
        } catch (error) {
            Logger.error(`Failed to restart bot: ${error.message}`);
        }
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    async stop() {
        if (this.bot) {
            this.bot.stopPolling();
            this.isRunning = false;
            Logger.info('🛑 Bot stopped');
        }
    }
}

// Main execution
async function main() {
    Logger.info('🚀 Starting CryptoSignAI Telegram Bot...');
    
    const bot = new CryptoSignAIBot();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        Logger.info('📥 Received SIGINT, shutting down gracefully...');
        await bot.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        Logger.info('📥 Received SIGTERM, shutting down gracefully...');
        await bot.stop();
        process.exit(0);
    });

    // Initialize bot
    const success = await bot.initialize();
    if (!success) {
        Logger.error('❌ Failed to start bot');
        process.exit(1);
    }
}

// Start the bot
if (require.main === module) {
    main().catch((error) => {
        Logger.error(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = CryptoSignAIBot;
