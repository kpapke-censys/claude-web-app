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
                        <h1>🎮 Cloud Gaming Hub</h1>
                        <p>Your gateway to multiple gaming worlds</p>
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
        
        container.innerHTML = `
            <div class="dashboard">
                <header class="dashboard-header">
                    <div class="user-info">
                        <div class="user-avatar">🎮</div>
                        <div class="user-details">
                            <h2>Welcome back, ${user.displayName}!</h2>
                            <p>Choose your adventure</p>
                        </div>
                    </div>
                    <div class="dashboard-actions">
                        <button id="userMenuBtn" class="btn btn-secondary">⚙️ Settings</button>
                        <button id="logoutBtn" class="btn btn-outline">🚪 Logout</button>
                    </div>
                </header>

                <main class="dashboard-main">
                    <div class="games-section">
                        <h3>Available Games</h3>
                        <div class="games-grid" id="gamesGrid">
                            ${this.renderGameCards()}
                        </div>
                    </div>

                    <div class="user-stats-section">
                        <h3>Your Stats</h3>
                        <div class="stats-grid">
                            ${this.renderUserStats()}
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupDashboardEvents();
    }

    renderGameCards() {
        return Object.values(this.availableGames).map(game => {
            const userData = this.userSystem.loadGameData(game.id);
            const hasProgress = userData !== null;
            
            return `
                <div class="game-card" data-game="${game.id}">
                    <div class="game-header">
                        <div class="game-icon">${game.icon}</div>
                        <div class="game-info">
                            <h4>${game.name}</h4>
                            <p class="game-category">${game.category} • ${game.difficulty}</p>
                        </div>
                        ${hasProgress ? '<div class="progress-indicator">💾</div>' : ''}
                    </div>
                    
                    <div class="game-description">
                        <p>${game.description}</p>
                    </div>
                    
                    <div class="game-features">
                        <div class="feature-tags">
                            ${game.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                        </div>
                        <div class="play-time">⏱️ ${game.estimatedPlayTime}</div>
                    </div>
                    
                    <div class="game-actions">
                        <button class="btn btn-primary play-btn" data-game="${game.id}">
                            ${hasProgress ? '📂 Continue' : '🎮 Play'}
                        </button>
                        ${hasProgress ? `<button class="btn btn-outline reset-btn" data-game="${game.id}">🔄 Reset</button>` : ''}
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

        document.getElementById('userMenuBtn').addEventListener('click', () => {
            this.showUserSettings();
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