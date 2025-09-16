// Game Menu and Dashboard System
class GameMenu {
    constructor(userSystem) {
        this.userSystem = userSystem;
        this.currentScreen = 'login';
        this.availableGames = {
            businessTycoon: {
                id: 'businessTycoon',
                name: 'Business Tycoon',
                icon: '🏢',
                description: 'Build your business empire from a humble lemonade stand to a global corporation',
                category: 'Strategy',
                difficulty: 'Easy',
                estimatedPlayTime: '30-60 min',
                features: ['Incremental gameplay', 'Offline earnings', 'Research tree'],
                implemented: true
            },
            survivalMode: {
                id: 'survivalMode',
                name: 'Alien Survival',
                icon: '🚀',
                description: 'Crash-landed on an alien planet, craft and build your way to escape',
                category: 'Survival',
                difficulty: 'Medium',
                estimatedPlayTime: '45-90 min',
                features: ['Crafting system', 'Resource gathering', 'Tech progression'],
                implemented: true
            },
            strategyMode: {
                id: 'strategyMode',
                name: 'Base Commander',
                icon: '⚔️',
                description: 'Build bases, command units, and dominate in real-time strategy combat',
                category: 'Strategy',
                difficulty: 'Hard',
                estimatedPlayTime: '60+ min',
                features: ['Base building', 'Unit commands', 'PvE combat'],
                implemented: true
            },
            heroCrafting: {
                id: 'heroCrafting',
                name: 'Hero Forge',
                icon: '🦸',
                description: 'Transform your gaming achievements into legendary heroes with unique classes and abilities',
                category: 'RPG',
                difficulty: 'Medium',
                estimatedPlayTime: '30+ min',
                features: ['Achievement system', 'Hero collection', 'Class progression'],
                implemented: true
            },
            hearthstoneBattlegrounds: {
                id: 'hearthstoneBattlegrounds',
                name: 'Hearthstone Battlegrounds',
                icon: '🔥',
                description: 'Master Hearthstone Battlegrounds with optimal hero and tribe selections for maximum win rates',
                category: 'Strategy',
                difficulty: 'Medium',
                estimatedPlayTime: '15-30 min',
                features: ['Hero analysis', 'Tribe optimization', 'Win rate data', 'Strategy guides'],
                implemented: true
            },
            houseSearch: {
                id: 'houseSearch',
                name: 'Property Risk Checker',
                icon: '🏠',
                description: 'Check environmental risks and hazards near any property address using EPA data and AI analysis',
                category: 'Utility',
                difficulty: 'Easy',
                estimatedPlayTime: '5-15 min',
                features: ['EPA database search', 'Environmental risk analysis', 'AI-powered summaries', 'Search history'],
                implemented: true
            },
            journalApp: {
                id: 'journalApp',
                name: 'Life Journal',
                icon: '📖',
                description: 'Document your daily life with tags and insights. Track events, people, and experiences to reflect on your journey.',
                category: 'Productivity',
                difficulty: 'Easy',
                estimatedPlayTime: '10-30 min',
                features: ['Tag-based organization', 'Smart filtering', 'Analytics & insights', 'Search functionality'],
                implemented: true
            }
        };
        
        this.init();
    }

    init() {
        this.createMenuContainer();
        this.showLoginScreen();
    }

    createMenuContainer() {
        // Create main menu container that will replace game content
        const menuContainer = document.createElement('div');
        menuContainer.id = 'gameMenuContainer';
        menuContainer.className = 'game-menu-container';
        
        // Hide the original game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        document.body.appendChild(menuContainer);
    }

    showLoginScreen() {
        const container = document.getElementById('gameMenuContainer');
        container.innerHTML = `
            <div class="login-screen">
                <div class="login-container">
                    <div class="login-header">
                        <h1>⭐ Ship Rekt Games</h1>
                        <p>Choose your adventure</p>
                    </div>
                    
                    <div class="login-form">
                        <h2>Welcome Player</h2>
                        <div class="form-group">
                            <label for="usernameInput">Username</label>
                            <input type="text" id="usernameInput" placeholder="Enter your username" maxlength="20">
                            <small>Minimum 3 characters, used to save your progress</small>
                        </div>
                        
                        <div class="login-actions">
                            <button id="loginBtn" class="btn btn-primary">Continue</button>
                            <button id="guestBtn" class="btn btn-secondary">Play as Guest</button>
                        </div>
                        
                        <div class="login-info">
                            <p>🔒 Your data is stored locally on your device</p>
                            <p>💾 Progress will be saved across sessions</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupLoginEvents();
    }

    setupLoginEvents() {
        const usernameInput = document.getElementById('usernameInput');
        const loginBtn = document.getElementById('loginBtn');
        const guestBtn = document.getElementById('guestBtn');

        // Enter key support
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        loginBtn.addEventListener('click', () => this.handleLogin());
        guestBtn.addEventListener('click', () => this.handleGuestLogin());

        // Focus on username input
        usernameInput.focus();
    }

    handleLogin() {
        const username = document.getElementById('usernameInput').value.trim();
        
        if (username.length < 3) {
            this.showLoginError('Username must be at least 3 characters');
            return;
        }

        const result = this.userSystem.login(username);
        if (result.success) {
            this.showGameDashboard();
        } else {
            this.showLoginError(result.error);
        }
    }

    handleGuestLogin() {
        const guestName = 'Guest_' + Math.random().toString(36).substr(2, 6);
        this.userSystem.login(guestName);
        this.showGameDashboard();
    }

    showLoginError(message) {
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }

        const error = document.createElement('div');
        error.className = 'login-error';
        error.textContent = message;
        
        const loginForm = document.querySelector('.login-form');
        loginForm.appendChild(error);
        
        setTimeout(() => error.remove(), 3000);
    }

    showGameDashboard() {
        const user = this.userSystem.getCurrentUser();
        const container = document.getElementById('gameMenuContainer');
        
        // Sanitize user display name to prevent XSS
        const sanitizedDisplayName = this.sanitizeHTML(user.displayName);
        
        container.innerHTML = `
            <div class="dashboard">
                <header class="dashboard-header">
                    <div class="user-info">
                        <div class="user-avatar">🎮</div>
                        <div class="user-details">
                            <h2>Welcome back, ${sanitizedDisplayName}!</h2>
                            <p>Choose your adventure</p>
                        </div>
                    </div>
                    <div class="dashboard-actions">
                        <button id="logoutBtn" class="btn btn-outline">🚪 Logout</button>
                    </div>
                </header>

                <main class="dashboard-main">
                    <div class="games-section">
                        <h3>Choose Your Game</h3>
                        <div class="games-grid" id="gamesGrid">
                            ${this.renderGameCards()}
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupDashboardEvents();
    }

    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderGameCards() {
        return Object.values(this.availableGames).map(game => {
            const userData = this.userSystem.loadGameData(game.id);
            const hasProgress = userData !== null;
            
            // Sanitize game data to prevent XSS
            const sanitizedGame = {
                id: this.sanitizeHTML(game.id),
                name: this.sanitizeHTML(game.name),
                icon: game.icon, // Icons are controlled, safe
                category: this.sanitizeHTML(game.category),
                difficulty: this.sanitizeHTML(game.difficulty),
                description: this.sanitizeHTML(game.description),
                estimatedPlayTime: this.sanitizeHTML(game.estimatedPlayTime),
                features: game.features.map(f => this.sanitizeHTML(f))
            };
            
            return `
                <div class="game-card" data-game="${sanitizedGame.id}">
                    <div class="game-header">
                        <div class="game-icon">${sanitizedGame.icon}</div>
                        <div class="game-info">
                            <h4>${sanitizedGame.name}</h4>
                            <p class="game-category">${sanitizedGame.category} • ${sanitizedGame.difficulty}</p>
                        </div>
                        ${hasProgress ? '<div class="progress-indicator">💾</div>' : ''}
                    </div>
                    
                    <div class="game-description">
                        <p>${sanitizedGame.description}</p>
                    </div>
                    
                    <div class="game-features">
                        <div class="play-time">⏱️ ${sanitizedGame.estimatedPlayTime}</div>
                    </div>
                    
                    <div class="game-actions">
                        <button class="btn btn-primary play-btn" data-game="${sanitizedGame.id}">
                            ${hasProgress ? '📂 Continue' : '🎮 Play'}
                        </button>
                        ${hasProgress ? `<button class="btn btn-outline reset-btn" data-game="${sanitizedGame.id}">🔄 Reset</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderUserStats() {
        const stats = this.userSystem.getUserStats();
        if (!stats) return '<p>No stats available</p>';

        return `
            <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-info">
                    <div class="stat-value">${stats.gamesPlayed}</div>
                    <div class="stat-label">Games Played</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-info">
                    <div class="stat-value">${stats.totalAchievements}</div>
                    <div class="stat-label">Achievements</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏰</div>
                <div class="stat-info">
                    <div class="stat-value">${Math.floor(stats.totalPlayTime / 3600)}h</div>
                    <div class="stat-label">Total Play Time</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                    <div class="stat-value">${stats.memberSince}</div>
                    <div class="stat-label">Member Since</div>
                </div>
            </div>
        `;
    }

    setupDashboardEvents() {
        // Play game buttons
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.dataset.game;
                this.launchGame(gameId);
            });
        });

        // Reset game buttons
        document.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.dataset.game;
                this.showResetConfirmation(gameId);
            });
        });

        // Dashboard actions
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    launchGame(gameId) {
        // Hide menu and show game
        document.getElementById('gameMenuContainer').style.display = 'none';
        
        // Show original game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }

        // Reset scroll position to top for each game mode
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Also reset any scrollable containers within the game
        setTimeout(() => {
            const scrollableElements = document.querySelectorAll('.tab-content, .game-main, .survival-main, .strategy-main');
            scrollableElements.forEach(element => {
                element.scrollTop = 0;
            });
        }, 100);

        // Launch the specific game
        window.gameManager.launchGame(gameId);
    }

    showResetConfirmation(gameId) {
        const game = this.availableGames[gameId];
        if (confirm(`Are you sure you want to reset your progress in ${game.name}? This cannot be undone.`)) {
            this.userSystem.saveGameData(gameId, null);
            localStorage.removeItem(`${this.userSystem.sessionKey}_${this.userSystem.currentUser.id}_${gameId}`);
            this.showGameDashboard(); // Refresh dashboard
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout? Make sure your progress is saved.')) {
            this.userSystem.logout();
            this.showLoginScreen();
        }
    }

    showUserSettings() {
        // TODO: Implement user settings modal
        alert('User settings coming soon!');
    }

    // Method to return to dashboard from within games
    returnToDashboard() {
        // Stop any running games
        if (window.gameManager) {
            window.gameManager.stopCurrentGame();
        }
        
        // Hide game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        // Show dashboard
        document.getElementById('gameMenuContainer').style.display = 'block';
        this.showGameDashboard();
    }

    // Show menu (called externally)
    show() {
        document.getElementById('gameMenuContainer').style.display = 'block';
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
    }

    // Hide menu (called externally)
    hide() {
        document.getElementById('gameMenuContainer').style.display = 'none';
    }
}

// Export for use in other modules
window.GameMenu = GameMenu;