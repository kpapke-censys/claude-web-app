// Business Tycoon Game - Progressive Web App
class BusinessTycoonGame {
    constructor() {
        this.gameState = {
            money: 1000,
            level: 1,
            companyType: 'Small Shop',
            totalValue: 1000,
            buildings: {},
            workers: {},
            research: {},
            stats: {
                totalBuildings: 0,
                totalEmployees: 0,
                totalIncome: 0,
                currentGoal: 'Buy your first building'
            },
            lastSave: Date.now(),
            offline: false
        };
        
        this.gameData = this.initializeGameData();
        this.updateInterval = null;
        this.saveInterval = null;
        this.pwaApp = null;
        this.themeMode = 'auto'; // 'light', 'dark', 'auto'
        
        this.init();
    }

    init() {
        this.loadGame();
        this.initializeTheme();
        this.initializePWA();
        this.setupEventListeners();
        this.startGameLoop();
        this.renderAllTabs();
        this.updateUI();
    }

    initializeGameData() {
        return {
            buildings: {
                lemonade_stand: {
                    id: 'lemonade_stand',
                    name: 'Lemonade Stand',
                    icon: '🥤',
                    description: 'A simple lemonade stand to get you started',
                    baseCost: 100,
                    baseIncome: 1,
                    costMultiplier: 1.15,
                    category: 'starter'
                },
                coffee_shop: {
                    id: 'coffee_shop',
                    name: 'Coffee Shop',
                    icon: '☕',
                    description: 'A cozy coffee shop for the morning rush',
                    baseCost: 500,
                    baseIncome: 5,
                    costMultiplier: 1.15,
                    category: 'food'
                },
                bakery: {
                    id: 'bakery',
                    name: 'Bakery',
                    icon: '🥖',
                    description: 'Fresh bread and pastries daily',
                    baseCost: 1500,
                    baseIncome: 12,
                    costMultiplier: 1.15,
                    category: 'food'
                },
                restaurant: {
                    id: 'restaurant',
                    name: 'Restaurant',
                    icon: '🍽️',
                    description: 'Fine dining experience',
                    baseCost: 5000,
                    baseIncome: 35,
                    costMultiplier: 1.15,
                    category: 'food'
                },
                tech_startup: {
                    id: 'tech_startup',
                    name: 'Tech Startup',
                    icon: '💻',
                    description: 'Innovation and disruption',
                    baseCost: 15000,
                    baseIncome: 100,
                    costMultiplier: 1.15,
                    category: 'tech'
                },
                factory: {
                    id: 'factory',
                    name: 'Factory',
                    icon: '🏭',
                    description: 'Mass production facility',
                    baseCost: 50000,
                    baseIncome: 300,
                    costMultiplier: 1.15,
                    category: 'industrial'
                }
            },
            workers: {
                intern: {
                    id: 'intern',
                    name: 'Intern',
                    icon: '🎓',
                    description: 'Eager to learn and help out',
                    baseCost: 50,
                    multiplier: 1.1,
                    costMultiplier: 1.1,
                    category: 'basic'
                },
                manager: {
                    id: 'manager',
                    name: 'Manager',
                    icon: '👨‍💼',
                    description: 'Keeps everything running smoothly',
                    baseCost: 200,
                    multiplier: 1.25,
                    costMultiplier: 1.1,
                    category: 'management'
                },
                expert: {
                    id: 'expert',
                    name: 'Expert',
                    icon: '👨‍🔬',
                    description: 'Specialized knowledge for better results',
                    baseCost: 1000,
                    multiplier: 1.5,
                    costMultiplier: 1.1,
                    category: 'specialist'
                }
            },
            research: {
                efficiency: {
                    id: 'efficiency',
                    name: 'Efficiency Upgrade',
                    icon: '⚡',
                    description: 'Increase income from all buildings by 20%',
                    baseCost: 2000,
                    multiplier: 1.2,
                    costMultiplier: 2.0,
                    type: 'income'
                },
                automation: {
                    id: 'automation',
                    name: 'Automation',
                    icon: '🤖',
                    description: 'Reduce worker costs by 15%',
                    baseCost: 5000,
                    multiplier: 0.85,
                    costMultiplier: 2.0,
                    type: 'cost'
                },
                marketing: {
                    id: 'marketing',
                    name: 'Marketing Campaign',
                    icon: '📈',
                    description: 'Boost all income by 50%',
                    baseCost: 10000,
                    multiplier: 1.5,
                    costMultiplier: 2.0,
                    type: 'income'
                }
            }
        };
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('gameTheme') || 'auto';
        this.themeMode = savedTheme;
        this.applyTheme();
    }

    applyTheme() {
        const body = document.body;
        body.classList.remove('light-theme', 'dark-theme');
        
        if (this.themeMode === 'light') {
            body.classList.add('light-theme');
        } else if (this.themeMode === 'dark') {
            body.classList.add('dark-theme');
        }
        // 'auto' uses system preference via CSS media queries
        
        localStorage.setItem('gameTheme', this.themeMode);
    }

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.themeMode);
        this.themeMode = themes[(currentIndex + 1) % themes.length];
        this.applyTheme();
        this.updateThemeButton();
    }

    updateThemeButton() {
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            const icons = { auto: '🌓', light: '☀️', dark: '🌙' };
            themeBtn.textContent = icons[this.themeMode] + ' Theme';
        }
    }

    // PWA Integration
    initializePWA() {
        this.pwaApp = new ClaudeWebApp();
    }

    // Game Logic
    calculateIncome() {
        let totalIncome = 0;
        let researchMultiplier = 1;
        
        // Apply research bonuses
        Object.keys(this.gameState.research).forEach(researchId => {
            const research = this.gameData.research[researchId];
            if (research && research.type === 'income') {
                researchMultiplier *= research.multiplier;
            }
        });

        // Calculate building income
        Object.keys(this.gameState.buildings).forEach(buildingId => {
            const count = this.gameState.buildings[buildingId] || 0;
            const building = this.gameData.buildings[buildingId];
            if (building && count > 0) {
                let buildingIncome = building.baseIncome * count;
                
                // Apply worker multipliers
                Object.keys(this.gameState.workers).forEach(workerId => {
                    const workerCount = this.gameState.workers[workerId] || 0;
                    const worker = this.gameData.workers[workerId];
                    if (worker && workerCount > 0) {
                        buildingIncome *= Math.pow(worker.multiplier, workerCount);
                    }
                });
                
                totalIncome += buildingIncome;
            }
        });

        return totalIncome * researchMultiplier;
    }

    calculateCost(baseData, currentCount) {
        return Math.floor(baseData.baseCost * Math.pow(baseData.costMultiplier, currentCount));
    }

    buyBuilding(buildingId) {
        const building = this.gameData.buildings[buildingId];
        const currentCount = this.gameState.buildings[buildingId] || 0;
        const cost = this.calculateCost(building, currentCount);

        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            this.gameState.buildings[buildingId] = currentCount + 1;
            this.gameState.stats.totalBuildings++;
            this.updateLevel();
            this.saveGame();
            this.renderBuildings();
            this.updateUI();
            return true;
        }
        return false;
    }

    buyWorker(workerId) {
        const worker = this.gameData.workers[workerId];
        const currentCount = this.gameState.workers[workerId] || 0;
        let cost = this.calculateCost(worker, currentCount);
        
        // Apply research cost reduction
        Object.keys(this.gameState.research).forEach(researchId => {
            const research = this.gameData.research[researchId];
            if (research && research.type === 'cost') {
                cost *= research.multiplier;
            }
        });
        
        cost = Math.floor(cost);

        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            this.gameState.workers[workerId] = currentCount + 1;
            this.gameState.stats.totalEmployees++;
            this.updateLevel();
            this.saveGame();
            this.renderWorkers();
            this.updateUI();
            return true;
        }
        return false;
    }

    buyResearch(researchId) {
        const research = this.gameData.research[researchId];
        const currentLevel = this.gameState.research[researchId] || 0;
        const cost = this.calculateCost(research, currentLevel);

        if (this.gameState.money >= cost && currentLevel < 5) {
            this.gameState.money -= cost;
            this.gameState.research[researchId] = currentLevel + 1;
            this.saveGame();
            this.renderResearch();
            this.updateUI();
            return true;
        }
        return false;
    }

    updateLevel() {
        const totalBuildings = this.gameState.stats.totalBuildings;
        let newLevel = 1;
        let companyType = 'Small Shop';

        if (totalBuildings >= 50) {
            newLevel = 6;
            companyType = 'Global Corporation';
        } else if (totalBuildings >= 25) {
            newLevel = 5;
            companyType = 'Large Enterprise';
        } else if (totalBuildings >= 15) {
            newLevel = 4;
            companyType = 'Medium Business';
        } else if (totalBuildings >= 8) {
            newLevel = 3;
            companyType = 'Growing Company';
        } else if (totalBuildings >= 3) {
            newLevel = 2;
            companyType = 'Small Business';
        }

        this.gameState.level = newLevel;
        this.gameState.companyType = companyType;
    }

    updateGoal() {
        const buildings = this.gameState.stats.totalBuildings;
        const money = this.gameState.money;
        
        if (buildings === 0) {
            this.gameState.stats.currentGoal = 'Buy your first building';
        } else if (buildings < 5) {
            this.gameState.stats.currentGoal = 'Expand to 5 buildings';
        } else if (buildings < 10) {
            this.gameState.stats.currentGoal = 'Reach 10 buildings';
        } else if (money < 50000) {
            this.gameState.stats.currentGoal = 'Save $50,000';
        } else if (buildings < 25) {
            this.gameState.stats.currentGoal = 'Build empire of 25 buildings';
        } else {
            this.gameState.stats.currentGoal = 'Dominate the market!';
        }
    }

    // UI Rendering
    formatMoney(amount) {
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + (amount / 1000).toFixed(1) + 'K';
        }
        return '$' + Math.floor(amount).toLocaleString();
    }

    updateUI() {
        // Update header
        document.getElementById('money').textContent = this.formatMoney(this.gameState.money);
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('companyType').textContent = this.gameState.companyType;
        document.getElementById('workers').textContent = this.gameState.stats.totalEmployees;
        document.getElementById('income').textContent = this.formatMoney(this.gameState.stats.totalIncome) + '/sec';

        // Update stats
        document.getElementById('totalValue').textContent = this.formatMoney(this.gameState.totalValue);
        document.getElementById('totalBuildings').textContent = this.gameState.stats.totalBuildings;
        document.getElementById('totalEmployees').textContent = this.gameState.stats.totalEmployees;
        document.getElementById('nextGoal').textContent = this.gameState.stats.currentGoal;

        // Update progress bar (example: progress toward next level)
        const progress = Math.min(100, (this.gameState.stats.totalBuildings % 10) * 10);
        document.getElementById('progressFill').style.width = progress + '%';
    }

    renderBuildings() {
        const grid = document.getElementById('buildingsGrid');
        grid.innerHTML = '';

        Object.values(this.gameData.buildings).forEach(building => {
            const owned = this.gameState.buildings[building.id] || 0;
            const cost = this.calculateCost(building, owned);
            const canAfford = this.gameState.money >= cost;

            const card = document.createElement('div');
            card.className = 'building-card card-appear';
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">${building.icon}</div>
                    <div class="card-info">
                        <h3>${building.name}</h3>
                        <p class="card-description">${building.description}</p>
                    </div>
                    ${owned > 0 ? `<div class="card-owned">${owned}</div>` : ''}
                </div>
                <div class="card-stats">
                    <div class="stat-row">
                        <span class="stat-label">Income:</span>
                        <span class="stat-value">${this.formatMoney(building.baseIncome)}/sec</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Cost:</span>
                        <span class="stat-value">${this.formatMoney(cost)}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" ${!canAfford ? 'disabled' : ''} onclick="game.buyBuilding('${building.id}')">
                        Buy ${owned > 0 ? 'Another' : 'First'}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderWorkers() {
        const grid = document.getElementById('workersGrid');
        grid.innerHTML = '';

        Object.values(this.gameData.workers).forEach(worker => {
            const owned = this.gameState.workers[worker.id] || 0;
            let cost = this.calculateCost(worker, owned);
            
            // Apply research cost reduction
            Object.keys(this.gameState.research).forEach(researchId => {
                const research = this.gameData.research[researchId];
                if (research && research.type === 'cost') {
                    cost *= research.multiplier;
                }
            });
            cost = Math.floor(cost);
            
            const canAfford = this.gameState.money >= cost;

            const card = document.createElement('div');
            card.className = 'worker-card card-appear';
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">${worker.icon}</div>
                    <div class="card-info">
                        <h3>${worker.name}</h3>
                        <p class="card-description">${worker.description}</p>
                    </div>
                    ${owned > 0 ? `<div class="card-owned">${owned}</div>` : ''}
                </div>
                <div class="card-stats">
                    <div class="stat-row">
                        <span class="stat-label">Multiplier:</span>
                        <span class="stat-value">×${worker.multiplier}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Cost:</span>
                        <span class="stat-value">${this.formatMoney(cost)}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" ${!canAfford ? 'disabled' : ''} onclick="game.buyWorker('${worker.id}')">
                        Hire ${owned > 0 ? 'Another' : 'First'}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderResearch() {
        const grid = document.getElementById('researchGrid');
        grid.innerHTML = '';

        Object.values(this.gameData.research).forEach(research => {
            const level = this.gameState.research[research.id] || 0;
            const maxLevel = 5;
            const cost = this.calculateCost(research, level);
            const canAfford = this.gameState.money >= cost && level < maxLevel;

            const card = document.createElement('div');
            card.className = 'research-card card-appear';
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">${research.icon}</div>
                    <div class="card-info">
                        <h3>${research.name}</h3>
                        <p class="card-description">${research.description}</p>
                    </div>
                    ${level > 0 ? `<div class="card-owned">Lv.${level}</div>` : ''}
                </div>
                <div class="card-stats">
                    <div class="stat-row">
                        <span class="stat-label">Effect:</span>
                        <span class="stat-value">${research.type === 'income' ? '+' : ''}${((research.multiplier - 1) * 100).toFixed(0)}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Cost:</span>
                        <span class="stat-value">${level >= maxLevel ? 'MAX' : this.formatMoney(cost)}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" ${!canAfford ? 'disabled' : ''} onclick="game.buyResearch('${research.id}')">
                        ${level >= maxLevel ? 'Maxed' : level > 0 ? 'Upgrade' : 'Research'}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderAllTabs() {
        this.renderBuildings();
        this.renderWorkers();
        this.renderResearch();
    }

    // Game Loop
    startGameLoop() {
        this.updateInterval = setInterval(() => {
            const income = this.calculateIncome();
            this.gameState.money += income;
            this.gameState.stats.totalIncome = income;
            this.gameState.totalValue = this.gameState.money + (this.gameState.stats.totalBuildings * 1000);
            this.updateGoal();
            this.updateUI();
        }, 1000);

        // Auto-save every 10 seconds
        this.saveInterval = setInterval(() => {
            this.saveGame();
            document.getElementById('saveStatus').textContent = '💾 Saved';
            setTimeout(() => {
                document.getElementById('saveStatus').textContent = '💾 Auto-saving';
            }, 1000);
        }, 10000);
    }

    // Save/Load System
    saveGame() {
        this.gameState.lastSave = Date.now();
        localStorage.setItem('businessTycoonSave', JSON.stringify(this.gameState));
    }

    loadGame() {
        const saved = localStorage.getItem('businessTycoonSave');
        if (saved) {
            const loadedState = JSON.parse(saved);
            
            // Calculate offline earnings
            const timeDiff = Date.now() - loadedState.lastSave;
            const offlineHours = timeDiff / (1000 * 60 * 60);
            
            if (offlineHours > 0.1) { // If offline for more than 6 minutes
                this.gameState = loadedState;
                const offlineIncome = this.calculateIncome() * (timeDiff / 1000);
                this.gameState.money += offlineIncome;
                
                // Show offline earnings popup
                this.showOfflineEarnings(offlineHours, offlineIncome);
            } else {
                this.gameState = loadedState;
            }
        }
    }

    showOfflineEarnings(hours, earnings) {
        if (earnings > 0) {
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 1001;
                text-align: center;
                max-width: 90vw;
            `;
            
            popup.innerHTML = `
                <h2 style="color: #2563eb; margin-bottom: 1rem;">💰 Welcome Back!</h2>
                <p style="margin-bottom: 1rem;">You were away for ${hours.toFixed(1)} hours</p>
                <p style="font-size: 1.2rem; font-weight: bold; color: #10b981; margin-bottom: 1.5rem;">
                    You earned ${this.formatMoney(earnings)} while offline!
                </p>
                <button onclick="this.parentElement.remove()" style="background: #2563eb; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Collect
                </button>
            `;
            
            document.body.appendChild(popup);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Prevent context menu on long press (mobile) but allow on desktop
        if ('ontouchstart' in window) {
            document.addEventListener('contextmenu', e => e.preventDefault());
        }
        
        // Handle visibility change for PWA
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.loadGame(); // Check for offline earnings when returning
            } else {
                this.saveGame(); // Save when leaving
            }
        });

        // Initialize theme button
        setTimeout(() => this.updateThemeButton(), 100);
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }
}

// PWA functionality (keeping existing ClaudeWebApp class but updating for game)
class ClaudeWebApp {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineStatus();
        this.checkIfInstalled();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }
    }

    showInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn && !this.isInstalled) {
            installBtn.style.display = 'block';
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.hideInstallButton();
            }
            
            this.deferredPrompt = null;
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        this.isInstalled = true;
    }

    checkIfInstalled() {
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }

        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
        });
    }

    setupOnlineStatus() {
        const onlineStatus = document.getElementById('onlineStatus');
        if (!onlineStatus) return;
        
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                onlineStatus.textContent = '🟢 Online';
                onlineStatus.style.color = '#10b981';
            } else {
                onlineStatus.textContent = '🔴 Offline';
                onlineStatus.style.color = '#ef4444';
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    showUpdateAvailable() {
        const updateNotification = document.createElement('div');
        updateNotification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2563eb;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        updateNotification.innerHTML = `
            <p>🔄 A new version is available!</p>
            <button onclick="window.location.reload();" style="background: white; color: #2563eb; border: none; padding: 0.5rem 1rem; margin-top: 0.5rem; border-radius: 5px; cursor: pointer;">
                Update Now
            </button>
        `;
        
        document.body.appendChild(updateNotification);
        
        setTimeout(() => {
            if (updateNotification.parentNode) {
                updateNotification.remove();
            }
        }, 10000);
    }
}

// Initialize the game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Business Tycoon Game initializing...');
    game = new BusinessTycoonGame();
});

// Export for global access
window.game = game;