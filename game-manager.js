// Game Manager - Central coordinator for all game modes
class GameManager {
    constructor() {
        this.userSystem = null;
        this.gameMenu = null;
        this.currentGame = null;
        this.currentGameId = null;
        this.gameInstances = {};
        this.sharedSystems = {};
        
        this.init();
    }

    init() {
        // Initialize core systems
        this.userSystem = new UserSystem();
        this.gameMenu = new GameMenu(this.userSystem);
        
        // Initialize shared game systems
        this.initializeSharedSystems();
        
        // Setup global navigation
        this.setupGlobalNavigation();
        
        // Check if user is already logged in
        if (this.userSystem.isLoggedIn()) {
            this.gameMenu.showGameDashboard();
        }
    }

    initializeSharedSystems() {
        // Shared systems that all games can use
        this.sharedSystems = {
            worlds: new WorldSystem(),
            characters: new CharacterSystem(),
            items: new ItemSystem(),
            quests: new QuestSystem(),
            achievements: new AchievementSystem(this.userSystem)
        };
    }

    setupGlobalNavigation() {
        // Add return to menu button as fixed position in lower left for consistency
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            const menuButton = document.createElement('button');
            menuButton.id = 'returnToMenuBtn';
            menuButton.className = 'btn btn-outline menu-btn back-to-dashboard';
            menuButton.innerHTML = '🏠 Back to Dashboard';
            menuButton.addEventListener('click', () => {
                if (window.SharedComponents) {
                    const sharedComponents = new window.SharedComponents();
                    sharedComponents.togglePauseMenu();
                } else {
                    this.returnToMenu();
                }
            });
            
            // Remove any existing buttons first
            const existingButton = document.getElementById('returnToMenuBtn');
            if (existingButton) {
                existingButton.remove();
            }
            
            document.body.appendChild(menuButton);
        }
    }

    // Game launching and management
    launchGame(gameId) {
        this.currentGameId = gameId;
        
        // Load user's game data
        const userData = this.userSystem.loadGameData(gameId);
        
        // Stop current game if running
        if (this.currentGame) {
            this.stopCurrentGame();
        }
        
        // Launch specific game
        switch (gameId) {
            case 'businessTycoon':
                this.launchBusinessTycoon(userData);
                break;
            case 'survivalMode':
                this.launchSurvivalMode(userData);
                break;
            case 'strategyMode':
                this.launchStrategyMode(userData);
                break;
            case 'heroCrafting':
                this.launchHeroCrafting(userData);
                break;
            default:
                console.error('Unknown game:', gameId);
                this.returnToMenu();
        }
    }

    launchBusinessTycoon(userData) {
        // Initialize or restore business tycoon game
        if (!this.gameInstances.businessTycoon) {
            this.gameInstances.businessTycoon = new BusinessTycoonGame();
            this.currentGame = this.gameInstances.businessTycoon;
        } else {
            this.currentGame = this.gameInstances.businessTycoon;
            this.currentGame.loadGame();
        }
        
        // Migrate old save if needed
        this.userSystem.migrateOldSave();
        
        // Override save system to use user system
        this.setupGameSaveIntegration('businessTycoon');
    }

    launchSurvivalMode(userData) {
        if (!this.gameInstances.survivalMode) {
            this.gameInstances.survivalMode = new SurvivalGame(this.sharedSystems);
            this.currentGame = this.gameInstances.survivalMode;
        } else {
            this.currentGame = this.gameInstances.survivalMode;
        }
        
        // Load user data if available
        if (userData) {
            this.currentGame.loadGameState(userData);
        }
        
        this.setupGameSaveIntegration('survivalMode');
    }

    launchStrategyMode(userData) {
        if (!this.gameInstances.strategyMode) {
            this.gameInstances.strategyMode = new StrategyGame(this.sharedSystems);
            this.currentGame = this.gameInstances.strategyMode;
        } else {
            this.currentGame = this.gameInstances.strategyMode;
        }
        
        // Load user data if available
        if (userData) {
            this.currentGame.loadGameState(userData);
        }
        
        this.setupGameSaveIntegration('strategyMode');
    }

    launchHeroCrafting(userData) {
        if (!this.gameInstances.heroCrafting) {
            this.gameInstances.heroCrafting = new HeroCraftingGame(this.sharedSystems);
            this.currentGame = this.gameInstances.heroCrafting;
            window.heroGame = this.currentGame; // Set global reference for easy access
        } else {
            this.currentGame = this.gameInstances.heroCrafting;
            window.heroGame = this.currentGame;
        }
        
        // Load user data if available
        if (userData) {
            this.currentGame.loadGameState(userData);
        }
        
        this.setupGameSaveIntegration('heroCrafting');
    }

    setupGameSaveIntegration(gameId) {
        // Override the game's save method to use user system
        if (this.currentGame && this.currentGame.saveGame) {
            const originalSave = this.currentGame.saveGame.bind(this.currentGame);
            this.currentGame.saveGame = () => {
                originalSave();
                // Save to user system
                const gameData = this.currentGame.gameState || this.currentGame.getGameState();
                this.userSystem.saveGameData(gameId, gameData);
            };
        }
    }

    stopCurrentGame() {
        if (this.currentGame) {
            // Save current game before stopping
            if (this.currentGame.saveGame) {
                this.currentGame.saveGame();
            }
            
            // Stop game loops - comprehensive cleanup
            if (this.currentGame.updateInterval) {
                clearInterval(this.currentGame.updateInterval);
                this.currentGame.updateInterval = null;
            }
            if (this.currentGame.saveInterval) {
                clearInterval(this.currentGame.saveInterval);
                this.currentGame.saveInterval = null;
            }
            if (this.currentGame.worldUpdateInterval) {
                clearInterval(this.currentGame.worldUpdateInterval);
                this.currentGame.worldUpdateInterval = null;
            }
            if (this.currentGame.resourceUpdateInterval) {
                clearInterval(this.currentGame.resourceUpdateInterval);
                this.currentGame.resourceUpdateInterval = null;
            }
            if (this.currentGame.gameLoopInterval) {
                clearInterval(this.currentGame.gameLoopInterval);
                this.currentGame.gameLoopInterval = null;
            }
            
            // Call cleanup method if it exists
            if (typeof this.currentGame.cleanup === 'function') {
                this.currentGame.cleanup();
            }
            
            this.currentGame = null;
            this.currentGameId = null;
        }
    }

    returnToMenu() {
        this.stopCurrentGame();
        this.gameMenu.returnToDashboard();
    }

    // Shared system access for games
    getSharedSystem(systemName) {
        return this.sharedSystems[systemName];
    }

    // Achievement integration
    unlockAchievement(achievementId, gameId) {
        if (this.sharedSystems.achievements) {
            this.sharedSystems.achievements.unlock(achievementId, gameId);
        }
    }
}

// Shared Game Systems - Base classes that games can extend
class WorldSystem {
    constructor() {
        this.worlds = new Map();
    }

    createWorld(id, config) {
        const world = {
            id,
            name: config.name,
            description: config.description,
            biome: config.biome || 'temperate',
            resources: config.resources || [],
            hazards: config.hazards || [],
            npcs: config.npcs || [],
            structures: config.structures || [],
            events: config.events || [],
            createdAt: Date.now()
        };
        
        this.worlds.set(id, world);
        return world;
    }

    getWorld(id) {
        return this.worlds.get(id);
    }

    updateWorld(id, updates) {
        const world = this.worlds.get(id);
        if (world) {
            Object.assign(world, updates);
        }
    }
}

class CharacterSystem {
    constructor() {
        this.characters = new Map();
    }

    createCharacter(id, config) {
        const character = {
            id,
            name: config.name,
            type: config.type || 'player',
            level: config.level || 1,
            health: config.health || 100,
            maxHealth: config.maxHealth || 100,
            stats: config.stats || {},
            inventory: config.inventory || [],
            position: config.position || { x: 0, y: 0 },
            worldId: config.worldId,
            createdAt: Date.now()
        };
        
        this.characters.set(id, character);
        return character;
    }

    getCharacter(id) {
        return this.characters.get(id);
    }

    updateCharacter(id, updates) {
        const character = this.characters.get(id);
        if (character) {
            Object.assign(character, updates);
        }
    }
}

class ItemSystem {
    constructor() {
        this.items = new Map();
        this.itemTemplates = new Map();
        this.initializeBaseItems();
    }

    initializeBaseItems() {
        // Define base item templates that games can use
        const baseItems = [
            { id: 'wood', name: 'Wood', type: 'resource', rarity: 'common', stackable: true },
            { id: 'stone', name: 'Stone', type: 'resource', rarity: 'common', stackable: true },
            { id: 'metal', name: 'Metal', type: 'resource', rarity: 'uncommon', stackable: true },
            { id: 'energy', name: 'Energy Cell', type: 'resource', rarity: 'rare', stackable: true },
            { id: 'food', name: 'Food', type: 'consumable', rarity: 'common', stackable: true },
            { id: 'water', name: 'Water', type: 'consumable', rarity: 'common', stackable: true }
        ];

        baseItems.forEach(item => {
            this.itemTemplates.set(item.id, item);
        });
    }

    createItem(templateId, quantity = 1) {
        const template = this.itemTemplates.get(templateId);
        if (!template) return null;

        const item = {
            ...template,
            id: this.generateItemId(),
            templateId,
            quantity,
            createdAt: Date.now()
        };

        this.items.set(item.id, item);
        return item;
    }

    generateItemId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

class QuestSystem {
    constructor() {
        this.quests = new Map();
        this.activeQuests = new Map();
    }

    createQuest(id, config) {
        const quest = {
            id,
            title: config.title,
            description: config.description,
            objectives: config.objectives || [],
            rewards: config.rewards || [],
            prerequisites: config.prerequisites || [],
            type: config.type || 'main',
            status: 'available',
            progress: {},
            createdAt: Date.now()
        };

        this.quests.set(id, quest);
        return quest;
    }

    startQuest(questId, characterId) {
        const quest = this.quests.get(questId);
        if (quest && quest.status === 'available') {
            quest.status = 'active';
            quest.startedAt = Date.now();
            quest.characterId = characterId;
            this.activeQuests.set(questId, quest);
            return true;
        }
        return false;
    }

    updateQuestProgress(questId, objectiveId, progress) {
        const quest = this.activeQuests.get(questId);
        if (quest) {
            quest.progress[objectiveId] = progress;
            this.checkQuestCompletion(questId);
        }
    }

    checkQuestCompletion(questId) {
        const quest = this.activeQuests.get(questId);
        if (quest) {
            const allObjectivesComplete = quest.objectives.every(obj => 
                quest.progress[obj.id] >= obj.target
            );
            
            if (allObjectivesComplete) {
                quest.status = 'completed';
                quest.completedAt = Date.now();
                this.activeQuests.delete(questId);
                return true;
            }
        }
        return false;
    }
}

class AchievementSystem {
    constructor(userSystem) {
        this.userSystem = userSystem;
        this.achievements = new Map();
        this.initializeBaseAchievements();
    }

    initializeBaseAchievements() {
        const baseAchievements = [
            {
                id: 'first_login',
                name: 'Welcome Player',
                description: 'Log in for the first time',
                icon: '🎮',
                category: 'general'
            },
            {
                id: 'first_game',
                name: 'Getting Started',
                description: 'Play your first game',
                icon: '🎯',
                category: 'general'
            },
            {
                id: 'multi_gamer',
                name: 'Multi-Gamer',
                description: 'Play all three game modes',
                icon: '🏆',
                category: 'general'
            }
        ];

        baseAchievements.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });
    }

    unlock(achievementId, gameId = null) {
        const achievement = this.achievements.get(achievementId);
        if (achievement) {
            const unlocked = this.userSystem.addAchievement({
                ...achievement,
                gameId
            });
            
            if (unlocked) {
                this.showAchievementNotification(achievement);
            }
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
}

// Initialize game manager when DOM is loaded
let gameManager;
document.addEventListener('DOMContentLoaded', () => {
    // Check if required dependencies are loaded
    const checkDependencies = () => {
        return typeof UserSystem !== 'undefined' && 
               typeof GameMenu !== 'undefined' && 
               typeof BusinessTycoonGame !== 'undefined';
    };
    
    // Initialize immediately if dependencies are ready
    if (checkDependencies()) {
        gameManager = new GameManager();
        window.gameManager = gameManager;
    } else {
        // Poll for dependencies with timeout
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        const checkInterval = setInterval(() => {
            attempts++;
            if (checkDependencies()) {
                clearInterval(checkInterval);
                gameManager = new GameManager();
                window.gameManager = gameManager;
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('Failed to initialize GameManager: Required dependencies not loaded');
            }
        }, 100);
    }
});

// Export for global access
window.GameManager = GameManager;