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

async function setupMenuButton() {
    console.log('🎯 Setting up Menu Button...\n');
    
    try {
        // Set menu button
        const menuButton = {
            type: 'web_app',
            text: '🚀 Trading Platform',
            web_app: {
                url: APP_URL
            }
        };
        
        console.log('🔧 Configuring menu button...');
        const result = await telegramAPI('setChatMenuButton', { menu_button: menuButton });
        
        if (result.ok) {
            console.log('✅ Menu button configured successfully!');
            console.log('✅ Button text: 🚀 Trading Platform');
            console.log(`✅ Web App URL: ${APP_URL}`);
            console.log('\n🎉 SETUP COMPLETE!');
            console.log('\n🚀 YOUR TELEGRAM MINI APP IS LIVE!');
            console.log('📱 Bot: @ai_futureco_bot');
            console.log('🌐 URL: https://t.me/ai_futureco_bot');
            console.log('\n✨ Test now:');
            console.log('1. Go to https://t.me/ai_futureco_bot');
            console.log('2. Click /start');
            console.log('3. Tap "🚀 Trading Platform" button');
            console.log('4. Your CryptoSignAI platform opens in Telegram!');
        } else {
            console.log('❌ Failed to set menu button:', result);
        }

    } catch (error) {
        console.error('❌ Error setting up menu button:', error.message);
        console.log('\n📱 MANUAL SETUP:');
        console.log('Go to @BotFather and send:');
        console.log('/setmenubutton');
        console.log('Select @ai_futureco_bot');
        console.log('Button text: 🚀 Trading Platform');
        console.log(`Web App URL: ${APP_URL}`);
    }
}

// Run the menu button setup
setupMenuButton();
