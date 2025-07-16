import https from 'https';

const BOT_TOKEN = '8053605696:AAEkjm-7Uj8DTpvgjIaVSTbESxxgW2NJdng';
const APP_URL = 'https://cryptosignai-miniapp.onrender.com';

// Function to make Telegram API calls
function telegramAPI(method, data = {}) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${BOT_TOKEN}/${method}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function setupBot() {
    console.log('🤖 Setting up CryptoSignAI Telegram Bot...\n');
    
    try {
        // 1. Get bot info
        console.log('📱 Getting bot information...');
        const botInfo = await telegramAPI('getMe');
        if (botInfo.ok) {
            console.log(`✅ Bot: @${botInfo.result.username}`);
            console.log(`✅ Name: ${botInfo.result.first_name}\n`);
        }

        // 2. Set bot commands
        console.log('⚙️ Setting up bot commands...');
        const commands = [
            { command: 'start', description: '🚀 Launch CryptoSignAI Platform' },
            { command: 'help', description: '❓ Get help and instructions' },
            { command: 'prices', description: '📊 Quick market overview' },
            { command: 'signals', description: '⚡ Get AI trading signals' }
        ];
        
        const commandResult = await telegramAPI('setMyCommands', { commands });
        if (commandResult.ok) {
            console.log('✅ Bot commands configured');
        }

        // 3. Set bot description
        console.log('📝 Setting bot description...');
        const description = 'AI-powered crypto trading platform with real-time market data, trading signals, and interactive charts. Access BTC, ETH, BNB, ADA, and US100 market analysis instantly.';
        const descResult = await telegramAPI('setMyDescription', { description });
        if (descResult.ok) {
            console.log('✅ Bot description set');
        }

        // 4. Set short description
        console.log('📄 Setting short description...');
        const shortDescription = 'AI crypto trading platform with real-time data and signals';
        const shortDescResult = await telegramAPI('setMyShortDescription', { short_description: shortDescription });
        if (shortDescResult.ok) {
            console.log('✅ Short description set');
        }

        console.log('\n🎉 BOT SETUP COMPLETE!\n');
        console.log('📱 MANUAL STEP REQUIRED:');
        console.log('Go to @BotFather in Telegram and send:');
        console.log('/setmenubutton');
        console.log('Select your bot');
        console.log('Button text: 🚀 Trading Platform');
        console.log(`Web App URL: ${APP_URL}`);
        console.log('\n🌟 Your bot URL:');
        console.log(`https://t.me/${botInfo.result.username}`);
        console.log('\n✨ Test it:');
        console.log('1. Find your bot in Telegram');
        console.log('2. Click /start');
        console.log('3. Tap the menu button');
        console.log('4. Your trading platform opens!');

    } catch (error) {
        console.error('❌ Error setting up bot:', error.message);
    }
}

// Run the setup
setupBot();
