// User Authentication and Session Management System
class UserSystem {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'cloudGameUser';
        this.init();
    }

    init() {
        this.loadSession();
    }

    // User Authentication
    login(username, password = null) {
        // Validate and sanitize username
        const validationResult = this.validateUsername(username);
        if (!validationResult.valid) {
            return { success: false, error: validationResult.error };
        }

        const sanitizedUsername = this.sanitizeInput(username.trim());
        
        try {
            const user = {
                id: this.generateUserId(sanitizedUsername),
                username: sanitizedUsername,
                displayName: sanitizedUsername,
                createdAt: Date.now(),
                lastLogin: Date.now(),
                preferences: {
                    theme: 'auto',
                    sound: true,
                    notifications: true
                },
                gameData: {
                    businessTycoon: null,
                    survivalMode: null,
                    strategyMode: null
                },
                achievements: [],
                totalPlayTime: 0
            };

            this.currentUser = user;
            this.saveSession();
            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username is required' };
        }
        
        const trimmed = username.trim();
        if (trimmed.length < 3) {
            return { valid: false, error: 'Username must be at least 3 characters' };
        }
        
        if (trimmed.length > 20) {
            return { valid: false, error: 'Username must be 20 characters or less' };
        }
        
        // Allow alphanumeric, underscore, and hyphen only
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            return { valid: false, error: 'Username can only contain letters, numbers, underscore, and hyphen' };
        }
        
        return { valid: true };
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        // Remove any HTML/script tags and encode special characters
        return input.replace(/[<>'"&]/g, (char) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return entities[char] || char;
        });
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.sessionKey + '_persistent');
    }

    register(username, displayName = null) {
        return this.login(username); // Simple registration = login for demo
    }

    // Session Management
    saveSession() {
        if (this.currentUser) {
            // Save to session storage for current session
            sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
            
            // Also save to localStorage for persistence across sessions
            const persistentData = {
                id: this.currentUser.id,
                username: this.currentUser.username,
                displayName: this.currentUser.displayName,
                preferences: this.currentUser.preferences,
                lastLogin: this.currentUser.lastLogin
            };
            localStorage.setItem(this.sessionKey + '_persistent', JSON.stringify(persistentData));
        }
    }

    loadSession() {
        try {
            // First try session storage (current session)
            let userData = sessionStorage.getItem(this.sessionKey);
            
            if (!userData) {
                // Fall back to localStorage (persistent across sessions)
                const persistentData = localStorage.getItem(this.sessionKey + '_persistent');
                if (persistentData) {
                    const parsed = this.safeParseJSON(persistentData);
                    if (parsed && this.validateUserData(parsed)) {
                        // Restore from persistent data and re-establish session
                        this.currentUser = {
                            id: this.sanitizeInput(parsed.id),
                            username: this.sanitizeInput(parsed.username),
                            displayName: this.sanitizeInput(parsed.displayName),
                            createdAt: Date.now(), // Will be overridden by game data
                            lastLogin: Date.now(),
                            preferences: parsed.preferences || {},
                            gameData: {
                                businessTycoon: null,
                                survivalMode: null,
                                strategyMode: null
                            },
                            achievements: [],
                            totalPlayTime: 0
                        };
                        
                        // Load user's game data from localStorage
                        this.loadUserGameData();
                        this.saveSession(); // Re-establish session storage
                    }
                }
            } else {
                const parsedUserData = this.safeParseJSON(userData);
                if (parsedUserData && this.validateUserData(parsedUserData)) {
                    this.currentUser = parsedUserData;
                }
            }
        } catch (error) {
            console.error('Session loading error:', error);
            this.currentUser = null;
        }
    }

    safeParseJSON(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON parsing error:', error);
            return null;
        }
    }

    validateUserData(userData) {
        if (!userData || typeof userData !== 'object') return false;
        if (!userData.id || typeof userData.id !== 'string') return false;
        if (!userData.username || typeof userData.username !== 'string') return false;
        return true;
    }

    // Game Data Management
    saveGameData(gameType, gameData) {
        if (this.currentUser) {
            this.currentUser.gameData[gameType] = gameData;
            this.currentUser.lastLogin = Date.now();
            this.saveSession();
            
            // Save specific game data to localStorage with user prefix
            const gameKey = `${this.sessionKey}_${this.currentUser.id}_${gameType}`;
            localStorage.setItem(gameKey, JSON.stringify(gameData));
        }
    }

    loadGameData(gameType) {
        if (this.currentUser) {
            // First check current user object
            if (this.currentUser.gameData[gameType]) {
                return this.currentUser.gameData[gameType];
            }
            
            // Fall back to localStorage
            const gameKey = `${this.sessionKey}_${this.currentUser.id}_${gameType}`;
            const saved = localStorage.getItem(gameKey);
            if (saved) {
                const gameData = JSON.parse(saved);
                this.currentUser.gameData[gameType] = gameData;
                return gameData;
            }
        }
        return null;
    }

    loadUserGameData() {
        if (this.currentUser) {
            const gameTypes = ['businessTycoon', 'survivalMode', 'strategyMode'];
            gameTypes.forEach(gameType => {
                const gameKey = `${this.sessionKey}_${this.currentUser.id}_${gameType}`;
                const saved = localStorage.getItem(gameKey);
                if (saved) {
                    this.currentUser.gameData[gameType] = JSON.parse(saved);
                }
            });
        }
    }

    // User Management
    updatePreferences(preferences) {
        if (this.currentUser) {
            this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
            this.saveSession();
        }
    }

    addAchievement(achievement) {
        if (this.currentUser) {
            if (!this.currentUser.achievements.find(a => a.id === achievement.id)) {
                this.currentUser.achievements.push({
                    ...achievement,
                    unlockedAt: Date.now()
                });
                this.saveSession();
                return true;
            }
        }
        return false;
    }

    updatePlayTime(seconds) {
        if (this.currentUser) {
            this.currentUser.totalPlayTime += seconds;
            this.saveSession();
        }
    }

    // Utility Methods
    generateUserId(username) {
        // Simple hash function for demo - in production use proper UUID
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            const char = username.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserStats() {
        if (!this.currentUser) return null;
        
        const gamesPlayed = Object.values(this.currentUser.gameData).filter(data => data !== null).length;
        const totalAchievements = this.currentUser.achievements.length;
        
        return {
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            gamesPlayed,
            totalAchievements,
            totalPlayTime: this.currentUser.totalPlayTime,
            memberSince: new Date(this.currentUser.createdAt).toLocaleDateString()
        };
    }

    // Migration from old save system
    migrateOldSave() {
        // Migrate existing Business Tycoon save if user is logged in
        if (this.currentUser) {
            try {
                const oldSave = localStorage.getItem('businessTycoonSave');
                if (oldSave && !this.currentUser.gameData.businessTycoon) {
                    const parsedSave = this.safeParseJSON(oldSave);
                    if (parsedSave) {
                        this.saveGameData('businessTycoon', parsedSave);
                        // Keep old save for now, don't delete it
                        return true;
                    }
                }
            } catch (error) {
                console.error('Migration error:', error);
            }
        }
        return false;
    }
}

// Export for use in other modules
window.UserSystem = UserSystem;