// Telegram Mini App JavaScript
class CryptoSignAI {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.currentTab = 'analysis';
        this.tradingViewWidget = null;
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://your-server.com'; // Replace with your actual server URL
        
        this.init();
    }

    init() {
        // Initialize Telegram Web App
        this.tg.ready();
        this.tg.expand();
        
        // Set up theme
        this.setupTheme();
        
        // Initialize user info
        this.initializeUser();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize TradingView chart
        this.initTradingViewChart();
        
        // Load initial data
        this.loadInitialData();
        
        console.log('CryptoSignAI Mini App initialized');
    }

    setupTheme() {
        // Apply Telegram theme colors
        if (this.tg.colorScheme === 'dark') {
            document.documentElement.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#1e1e1e');
            document.documentElement.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#ffffff');
            document.documentElement.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color || '#a0a0a0');
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#2d2d2d');
        } else {
            document.documentElement.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#ffffff');
            document.documentElement.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#000000');
            document.documentElement.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color || '#707579');
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#f1f1f1');
        }
        
        // Set button color
        document.documentElement.style.setProperty('--primary-color', this.tg.themeParams.button_color || '#2481cc');
    }

    initializeUser() {
        const user = this.tg.initDataUnsafe?.user;
        if (user) {
            document.getElementById('user-name').textContent = 
                user.first_name ? `${user.first_name}` : 'Welcome';
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Analysis button
        document.getElementById('analyze-btn').addEventListener('click', () => {
            this.performAnalysis();
        });

        // Quick signal button
        document.getElementById('quick-signal-btn').addEventListener('click', () => {
            this.getQuickSignal();
        });

        // Chart capture button
        document.getElementById('capture-chart-btn').addEventListener('click', () => {
            this.captureChart();
        });

        // Chart analysis button
        document.getElementById('analyze-chart-btn').addEventListener('click', () => {
            this.analyzeChart();
        });

        // Symbol selector
        document.getElementById('symbol-select').addEventListener('change', (e) => {
            this.updateChart(e.target.value);
        });

        // Telegram back button
        this.tg.BackButton.onClick(() => {
            this.tg.close();
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Initialize tab-specific content
        if (tabName === 'charts' && !this.tradingViewWidget) {
            setTimeout(() => this.initTradingViewChart(), 100);
        } else if (tabName === 'signals') {
            this.loadSignals();
        } else if (tabName === 'portfolio') {
            this.loadPortfolio();
        }
    }

    initTradingViewChart() {
        if (document.getElementById('tradingview-chart')) {
            const symbol = document.getElementById('symbol-select').value;
            
            this.tradingViewWidget = new TradingView.widget({
                width: '100%',
                height: 400,
                symbol: `BINANCE:${symbol}`,
                interval: '15',
                timezone: 'Etc/UTC',
                theme: this.tg.colorScheme === 'dark' ? 'Dark' : 'Light',
                style: '1',
                locale: 'en',
                toolbar_bg: this.tg.colorScheme === 'dark' ? '#1e1e1e' : '#f1f3f6',
                enable_publishing: false,
                hide_top_toolbar: false,
                hide_side_toolbar: true,
                save_image: false,
                container_id: 'tradingview-chart',
                studies: [
                    'MASimple@tv-basicstudies',
                    'RSI@tv-basicstudies'
                ]
            });
        }
    }

    updateChart(symbol) {
        if (this.tradingViewWidget) {
            this.tradingViewWidget.setSymbol(`BINANCE:${symbol}`, '15');
        }
    }

    async performAnalysis() {
        this.showLoading('Analyzing market data...');
        
        try {
            const symbol = document.getElementById('symbol-select').value;
            const response = await fetch(`${this.apiBaseUrl}/api/analyze?symbol=${symbol}`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayAnalysisResults(data);
                
                // Haptic feedback
                this.tg.HapticFeedback.impactOccurred('medium');
            } else {
                throw new Error('Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.tg.showAlert('❌ Analysis failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getQuickSignal() {
        this.showLoading('Getting quick signal...');
        
        try {
            const symbol = document.getElementById('symbol-select').value;
            const response = await fetch(`${this.apiBaseUrl}/api/quick-signal?symbol=${symbol}`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayQuickSignal(data);
                
                // Haptic feedback
                this.tg.HapticFeedback.impactOccurred('light');
            } else {
                throw new Error('Quick signal failed');
            }
        } catch (error) {
            console.error('Quick signal error:', error);
            this.tg.showAlert('❌ Quick signal failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    displayAnalysisResults(data) {
        document.getElementById('analysis-text').textContent = data.analysis || 'Analysis completed';
        document.getElementById('position').textContent = data.recommendations?.position || 'N/A';
        document.getElementById('entry').textContent = data.recommendations?.entry || 'N/A';
        document.getElementById('take-profit').textContent = data.recommendations?.takeProfit || 'N/A';
        document.getElementById('stop-loss').textContent = data.recommendations?.stopLoss || 'N/A';
        document.getElementById('confidence').textContent = data.recommendations?.possibility || 'N/A';
        
        document.getElementById('analysis-results').style.display = 'block';
        
        // Scroll to results
        document.getElementById('analysis-results').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    displayQuickSignal(data) {
        const signal = {
            position: data.signal || 'HOLD',
            confidence: data.confidence || '50%',
            price: data.price || 'N/A'
        };
        
        const message = `🎯 Quick Signal\n\n` +
                       `Signal: ${signal.position}\n` +
                       `Price: ${signal.price}\n` +
                       `Confidence: ${signal.confidence}`;
        
        this.tg.showPopup({
            title: '⚡ Quick Signal',
            message: message,
            buttons: [
                {id: 'close', type: 'close'}
            ]
        });
    }

    async captureChart() {
        this.showLoading('Capturing chart...');
        
        try {
            const chartElement = document.getElementById('tradingview-chart');
            const canvas = await html2canvas(chartElement, {
                backgroundColor: this.tg.colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                scale: 2
            });
            
            // Convert to blob and send to Telegram bot for analysis
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('chart', blob, 'chart.png');
                formData.append('userId', this.tg.initDataUnsafe?.user?.id || 'unknown');
                
                try {
                    const response = await fetch(`${this.apiBaseUrl}/api/analyze-chart-image`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        this.tg.showAlert('📸 Chart captured and sent for analysis!');
                        this.tg.HapticFeedback.impactOccurred('medium');
                    }
                } catch (error) {
                    console.error('Chart upload error:', error);
                    this.tg.showAlert('❌ Failed to upload chart for analysis');
                }
            }, 'image/png');
            
        } catch (error) {
            console.error('Chart capture error:', error);
            this.tg.showAlert('❌ Failed to capture chart');
        } finally {
            this.hideLoading();
        }
    }

    async analyzeChart() {
        await this.captureChart();
        // The analysis will be handled by the Telegram bot
        this.tg.showAlert('📊 Chart sent to AI for analysis. Check your Telegram chat for results!');
    }

    async loadSignals() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/signals`);
            if (response.ok) {
                const signals = await response.json();
                this.displaySignals(signals);
            }
        } catch (error) {
            console.error('Error loading signals:', error);
        }
    }

    displaySignals(signals) {
        const signalsList = document.getElementById('signals-list');
        
        if (!signals || signals.length === 0) {
            signalsList.innerHTML = '<p>No active signals</p>';
            return;
        }
        
        signalsList.innerHTML = signals.map(signal => `
            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">${signal.pair}</span>
                    <span class="signal-type ${signal.type.toLowerCase()}">${signal.type}</span>
                </div>
                <div class="signal-details">
                    <p><strong>Entry:</strong> ${signal.entry}</p>
                    <p><strong>TP:</strong> ${signal.takeProfit}</p>
                    <p><strong>SL:</strong> ${signal.stopLoss}</p>
                    <p><strong>R:R:</strong> ${signal.riskReward}</p>
                </div>
                <div class="signal-time">${signal.time}</div>
            </div>
        `).join('');
    }

    async loadPortfolio() {
        try {
            const userId = this.tg.initDataUnsafe?.user?.id;
            if (!userId) return;
            
            const response = await fetch(`${this.apiBaseUrl}/api/portfolio?userId=${userId}`);
            if (response.ok) {
                const portfolio = await response.json();
                this.displayPortfolio(portfolio);
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    }

    displayPortfolio(portfolio) {
        // Update balance display
        document.querySelector('.balance').textContent = portfolio.balance || '$0.00';
        document.querySelector('.balance-change').textContent = portfolio.change || '0%';
        document.querySelector('.balance-change').className = 
            `balance-change ${portfolio.changeType || 'neutral'}`;
    }

    async loadInitialData() {
        // Load any initial data needed
        if (this.currentTab === 'signals') {
            await this.loadSignals();
        }
        if (this.currentTab === 'portfolio') {
            await this.loadPortfolio();
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        overlay.querySelector('p').textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    // Utility method to send data to Telegram bot
    sendToTelegramBot(action, data) {
        const message = {
            action: action,
            data: data,
            userId: this.tg.initDataUnsafe?.user?.id,
            timestamp: Date.now()
        };
        
        // Send via postMessage to parent (Telegram)
        if (this.tg.sendData) {
            this.tg.sendData(JSON.stringify(message));
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CryptoSignAI();
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // App became visible, refresh data if needed
        console.log('App became visible');
    }
});

// Handle Telegram Web App events
window.addEventListener('beforeunload', () => {
    // Save any necessary data before the app closes
    console.log('App is closing');
});
