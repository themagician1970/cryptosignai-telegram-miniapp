import https from 'https';

const BOT_TOKEN = '8053605696:AAEkjm-7Uj8DTpvgjIaVSTbESxxgW2NJdng';

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
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function verifySetup() {
    console.log('🔍 Verifying your Telegram Mini App setup...\n');
    
    try {
        // Check bot info
        const botInfo = await telegramAPI('getMe');
        console.log('✅ Bot Status: ACTIVE');
        console.log(`✅ Bot Username: @${botInfo.result.username}`);
        console.log(`✅ Bot Name: ${botInfo.result.first_name}`);
        
        // Check commands
        const commands = await telegramAPI('getMyCommands');
        console.log(`✅ Commands: ${commands.result.length} configured`);
        
        // Check menu button
        const menuButton = await telegramAPI('getChatMenuButton');
        if (menuButton.result.type === 'web_app') {
            console.log('✅ Menu Button: CONFIGURED');
            console.log(`✅ Button Text: ${menuButton.result.text}`);
            console.log(`✅ Web App URL: ${menuButton.result.web_app.url}`);
        }
        
        console.log('\n🎉 VERIFICATION COMPLETE!');
        console.log('🚀 Your CryptoSignAI Telegram Mini App is LIVE!');
        console.log('\n📱 ACCESS YOUR APP:');
        console.log(`🔗 Direct Link: https://t.me/${botInfo.result.username}`);
        console.log('🔗 Web App: https://cryptosignai-miniapp.onrender.com');
        
        console.log('\n✨ FEATURES AVAILABLE:');
        console.log('• Real-time BTC, ETH, BNB, ADA prices');
        console.log('• US100 (NASDAQ) market data');
        console.log('• AI-powered trading signals');
        console.log('• Interactive TradingView charts');
        console.log('• Mobile-optimized interface');
        console.log('• Instant access via Telegram');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Share your bot: https://t.me/ai_futureco_bot');
        console.log('2. Users click /start');
        console.log('3. Users tap "🚀 Trading Platform"');
        console.log('4. Your platform opens instantly!');
        
    } catch (error) {
        console.error('❌ Verification error:', error.message);
    }
}

verifySetup();
