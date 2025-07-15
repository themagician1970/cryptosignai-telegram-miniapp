# 🤖 Telegram Bot Integration with Mini App

This file shows how to integrate your existing Telegram bot with the new Mini App.

## 📋 Bot Menu Commands Setup

Add these commands to your existing Telegram bot to launch the Mini App:

### 1. Bot Commands List
```javascript
// Add to your bot command registration
const commands = [
  { command: 'start', description: 'Welcome message and main menu' },
  { command: 'analyze', description: 'Open AI analysis in Mini App' },
  { command: 'charts', description: 'View live charts in Mini App' },
  { command: 'signals', description: 'See trading signals in Mini App' },
  { command: 'portfolio', description: 'View your portfolio in Mini App' },
  { command: 'app', description: 'Open CryptoSignAI Mini App' },
  { command: 'help', description: 'Show help information' }
];

bot.setMyCommands(commands);
```

### 2. Mini App Integration Code

Add this to your existing bot.js file:

```javascript
// Mini App URL - Replace with your actual deployed URL
const MINI_APP_URL = 'https://your-domain.com'; // or ngrok URL for testing

// Handle /app command - Opens Mini App
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

// Handle /analyze command - Direct to Mini App Analysis
bot.onText(/\/analyze/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [[
      {
        text: '🔍 Open AI Analysis',
        web_app: { url: `${MINI_APP_URL}#analysis` }
      }
    ]]
  };
  
  await bot.sendMessage(chatId,
    '🤖 AI Market Analysis\n\n' +
    'Get comprehensive trading analysis with:\n' +
    '• Market trend identification\n' +
    '• Entry/exit recommendations\n' +
    '• Risk management levels\n' +
    '• Confidence ratings\n\n' +
    'Open the Mini App for detailed analysis:',
    { reply_markup: keyboard }
  );
});

// Handle /charts command - Direct to Mini App Charts
bot.onText(/\/charts/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [[
      {
        text: '📈 View Live Charts',
        web_app: { url: `${MINI_APP_URL}#charts` }
      }
    ]]
  };
  
  await bot.sendMessage(chatId,
    '📊 Live Trading Charts\n\n' +
    'Access professional charts with:\n' +
    '• Real-time price data\n' +
    '• Technical indicators\n' +
    '• Chart analysis tools\n' +
    '• Multiple timeframes\n\n' +
    'Open charts in Mini App:',
    { reply_markup: keyboard }
  );
});

// Handle /signals command - Direct to Mini App Signals
bot.onText(/\/signals/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [[
      {
        text: '🎯 View Trading Signals',
        web_app: { url: `${MINI_APP_URL}#signals` }
      }
    ]]
  };
  
  await bot.sendMessage(chatId,
    '🎯 Trading Signals\n\n' +
    'Get active trading signals:\n' +
    '• Buy/Sell recommendations\n' +
    '• Entry points & targets\n' +
    '• Risk management levels\n' +
    '• Real-time updates\n\n' +
    'View signals in Mini App:',
    { reply_markup: keyboard }
  );
});

// Handle /portfolio command - Direct to Mini App Portfolio
bot.onText(/\/portfolio/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [[
      {
        text: '💼 View Portfolio',
        web_app: { url: `${MINI_APP_URL}#portfolio` }
      }
    ]]
  };
  
  await bot.sendMessage(chatId,
    '💼 Portfolio Management\n\n' +
    'Track your trading performance:\n' +
    '• Account balance\n' +
    '• Open positions\n' +
    '• P&L tracking\n' +
    '• Performance analytics\n\n' +
    'View portfolio in Mini App:',
    { reply_markup: keyboard }
  );
});

// Enhanced /start command with Mini App
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Trader';
  
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Open CryptoSignAI App',
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
      [
        { text: '📸 Analyze Chart Image', callback_data: 'analyze_image' },
        { text: '⚙️ Settings', callback_data: 'settings' }
      ],
      [
        { text: '❓ Help', callback_data: 'help' },
        { text: '👥 Support', callback_data: 'support' }
      ]
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

// Handle Mini App data from web app
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app.data);
  
  console.log('Received Mini App data:', data);
  
  // Handle different actions from Mini App
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
      
    case 'signal_generated':
      await bot.sendMessage(chatId,
        `🎯 **New Trading Signal**\n\n` +
        `${data.data.pair}: ${data.data.signal}\n` +
        `Entry: ${data.data.entry}\n` +
        `Target: ${data.data.target}\n` +
        `Stop Loss: ${data.data.stopLoss}`,
        { parse_mode: 'Markdown' }
      );
      break;
      
    default:
      console.log('Unknown Mini App action:', data.action);
  }
});

// Callback query handler for inline buttons
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  switch (data) {
    case 'analyze_image':
      await bot.sendMessage(chatId,
        '📸 **Chart Image Analysis**\n\n' +
        'Send me a screenshot of any trading chart and I\'ll provide detailed analysis!\n\n' +
        '📋 **Supported charts:**\n' +
        '• TradingView charts\n' +
        '• Exchange screenshots\n' +
        '• Mobile app charts\n' +
        '• Any trading chart image\n\n' +
        '📤 Just send the image and wait for AI analysis!'
      );
      break;
      
    case 'settings':
      const settingsKeyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Language', callback_data: 'language' },
            { text: '🔔 Notifications', callback_data: 'notifications' }
          ],
          [
            { text: '📊 Chart Settings', callback_data: 'chart_settings' },
            { text: '🎯 Signal Preferences', callback_data: 'signal_prefs' }
          ],
          [
            { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
          ]
        ]
      };
      
      await bot.editMessageText(
        '⚙️ **Settings**\n\nCustomize your CryptoSignAI experience:',
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          reply_markup: settingsKeyboard,
          parse_mode: 'Markdown'
        }
      );
      break;
      
    case 'help':
      await bot.sendMessage(chatId,
        '❓ **Help & Commands**\n\n' +
        '**Bot Commands:**\n' +
        '/start - Main menu\n' +
        '/app - Open Mini App\n' +
        '/analyze - AI analysis\n' +
        '/charts - Live charts\n' +
        '/signals - Trading signals\n' +
        '/portfolio - Portfolio view\n\n' +
        '**Mini App Features:**\n' +
        '• Real-time chart analysis\n' +
        '• Professional trading tools\n' +
        '• Portfolio management\n' +
        '• AI-powered insights\n\n' +
        '**Image Analysis:**\n' +
        'Send any chart screenshot for instant AI analysis!\n\n' +
        '**Support:** @your_support_username',
        { parse_mode: 'Markdown' }
      );
      break;
      
    default:
      await bot.answerCallbackQuery(callbackQuery.id, 'Feature coming soon!');
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
});
```

### 3. Environment Variables

Add to your `.env` file:

```env
# Mini App Configuration
MINI_APP_URL=https://your-domain.com
MINI_APP_NAME=CryptoSignAI

# Existing variables
TELEGRAM_BOT_TOKEN=your_bot_token
GEMINI_API_KEY=your_gemini_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### 4. Bot Menu Configuration

Set your bot menu in BotFather:

```
analyze - 🔍 AI Market Analysis
charts - 📊 View Live Charts  
signals - 🎯 Trading Signals
portfolio - 💼 Portfolio View
app - 🚀 Open Mini App
help - ❓ Help & Support
```

### 5. Testing the Integration

1. Deploy your Mini App to a public URL (Vercel, Netlify, etc.)
2. Update the `MINI_APP_URL` in your bot code
3. Restart your bot
4. Test commands: `/start`, `/app`, `/analyze`
5. Verify Mini App opens correctly in Telegram

### 6. Production Deployment

For production:
1. Use HTTPS URL for Mini App
2. Validate Telegram Web App init data
3. Implement proper error handling
4. Add analytics and logging
5. Set up monitoring

This integration creates a seamless experience between your bot and Mini App!
