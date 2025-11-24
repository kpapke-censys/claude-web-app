/**
 * RPG Game Framework - A comprehensive RPG system for learning game development
 * Features: Turn-based combat, character progression, inventory, quests, and world exploration
 */

class RPGGame {
    constructor() {
        this.isInitialized = false;
        this.gameState = 'menu'; // menu, playing, combat, inventory, paused
        this.currentScene = 'town';
        this.gameData = this.initializeGameData();
        this.ui = new RPGInterface(this);
        this.combat = new CombatSystem(this);
        this.world = new WorldManager(this);
        this.quest = new QuestSystem(this);
        this.saveInterval = null; // Store interval ID for cleanup
    }

    initializeGameData() {
        return {
            player: new Character({
                name: "Hero",
                type: "player",
                level: 1,
                experience: 0,
                experienceToNext: 100,
                stats: {
                    health: 100,
                    maxHealth: 100,
                    mana: 50,
                    maxMana: 50,
                    attack: 15,
                    defense: 8,
                    agility: 10,
                    intelligence: 12
                },
                inventory: new Inventory(),
                equipment: {
                    weapon: null,
                    armor: null,
                    accessory: null
                },
                gold: 50,
                skills: []
            }),
            currentEnemy: null,
            gameFlags: new Map(),
            saveData: {
                playTime: 0,
                lastSaved: Date.now(),
                version: "1.0.0"
            }
        };
    }

    async initialize(container) {
        if (this.isInitialized) return;

        this.container = container;
        await this.ui.initialize(container);
        this.setupEventListeners();
        this.loadGameData();
        this.startGameLoop();
        
        this.isInitialized = true;
        this.showMainMenu();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyInput(e));
        
        // Auto-save every 30 seconds during play
        this.saveInterval = setInterval(() => {
            if (this.gameState === 'playing' || this.gameState === 'combat') {
                this.saveGameData();
            }
        }, 30000);
    }

    handleKeyInput(event) {
        const key = event.key.toLowerCase();
        
        switch (this.gameState) {
            case 'playing':
                this.handleWorldInput(key);
                break;
            case 'combat':
                this.combat.handleInput(key);
                break;
            case 'menu':
                this.handleMenuInput(key);
                break;
        }
    }

    handleWorldInput(key) {
        switch (key) {
            case 'i':
                this.openInventory();
                break;
            case 'q':
                this.quest.openQuestLog();
                break;
            case 's':
                this.ui.showStatus();
                break;
            case 'arrowup':
            case 'w':
                this.world.movePlayer('north');
                break;
            case 'arrowdown':
            case 's':
                this.world.movePlayer('south');
                break;
            case 'arrowleft':
            case 'a':
                this.world.movePlayer('west');
                break;
            case 'arrowright':
            case 'd':
                this.world.movePlayer('east');
                break;
            case 'enter':
            case ' ':
                this.world.interact();
                break;
        }
    }

    handleMenuInput(key) {
        switch (key) {
            case '1':
            case 'enter':
                this.newGame();
                break;
            case '2':
                this.loadGame();
                break;
        }
    }

    newGame() {
        this.gameData = this.initializeGameData();
        this.gameData.player.inventory.addItem(ItemDatabase.getItem('health_potion'), 3);
        this.gameData.player.inventory.addItem(ItemDatabase.getItem('iron_sword'));
        this.gameState = 'playing';
        this.currentScene = 'town';
        this.ui.showGame();
        this.world.loadScene('town');
        this.quest.startQuest('welcome_quest');
    }

    loadGame() {
        const saved = localStorage.getItem('rpg_game_save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.gameData = this.reconstructGameData(data);
                this.gameState = 'playing';
                this.ui.showGame();
                this.world.loadScene(this.currentScene);
                this.ui.showMessage("Game loaded successfully!");
            } catch (error) {
                console.error("Failed to load game:", error);
                this.ui.showMessage("Failed to load save game. Starting new game.");
                this.newGame();
            }
        } else {
            this.ui.showMessage("No save game found. Starting new game.");
            this.newGame();
        }
    }

    saveGameData() {
        try {
            const saveData = {
                player: this.serializePlayer(),
                currentScene: this.currentScene,
                gameFlags: Array.from(this.gameData.gameFlags.entries()),
                quests: this.quest.getQuestData(),
                saveTime: Date.now(),
                playTime: this.gameData.saveData.playTime + (Date.now() - this.gameData.saveData.lastSaved)
            };
            
            localStorage.setItem('rpg_game_save', JSON.stringify(saveData));
            this.ui.showMessage("Game saved!", 1000);
        } catch (error) {
            console.error("Failed to save game:", error);
            this.ui.showMessage("Failed to save game!");
        }
    }

    reconstructGameData(data) {
        // Validate save data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid save data format');
        }
        
        // Validate required fields
        if (!data.player || !data.player.name || !data.player.stats) {
            throw new Error('Save data missing required player information');
        }
        
        if (!data.currentScene || typeof data.currentScene !== 'string') {
            throw new Error('Save data missing scene information');
        }
        
        try {
            // Reconstruct complex objects from save data
            const player = new Character(data.player);
            player.inventory = new Inventory(data.player.inventory);
            
            this.currentScene = data.currentScene;
            this.gameData.gameFlags = new Map(Array.isArray(data.gameFlags) ? data.gameFlags : []);
            
            // Safely load quest data
            if (data.quests) {
                this.quest.loadQuestData(data.quests);
            }
            
            return {
                player: player,
                currentEnemy: null,
                gameFlags: this.gameData.gameFlags,
                saveData: {
                    playTime: typeof data.playTime === 'number' ? data.playTime : 0,
                    lastSaved: typeof data.saveTime === 'number' ? data.saveTime : Date.now(),
                    version: "1.0.0"
                }
            };
        } catch (error) {
            throw new Error(`Failed to reconstruct game data: ${error.message}`);
        }
    }

    serializePlayer() {
        return {
            ...this.gameData.player,
            inventory: this.gameData.player.inventory.serialize()
        };
    }

    openInventory() {
        this.gameState = 'inventory';
        this.ui.showInventory();
    }

    closeInventory() {
        this.gameState = 'playing';
        this.ui.showGame();
    }

    startCombat(enemy) {
        this.gameData.currentEnemy = enemy;
        this.gameState = 'combat';
        this.combat.startCombat(this.gameData.player, enemy);
    }

    endCombat(victory) {
        if (victory) {
            const exp = this.gameData.currentEnemy.experienceReward;
            const gold = this.gameData.currentEnemy.goldReward;
            
            this.gameData.player.gainExperience(exp);
            this.gameData.player.gold += gold;
            
            this.ui.showMessage(`Victory! Gained ${exp} XP and ${gold} gold!`, 3000);
            
            // Check for item drops
            this.gameData.currentEnemy.checkItemDrop();
        }
        
        this.gameData.currentEnemy = null;
        this.gameState = 'playing';
        this.ui.showGame();
    }

    showMainMenu() {
        this.gameState = 'menu';
        this.ui.showMainMenu();
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }

    update() {
        if (this.gameState === 'combat') {
            this.combat.update();
        }
        
        // Update play time
        if (this.gameState === 'playing' || this.gameState === 'combat') {
            this.gameData.saveData.playTime += 16; // ~60fps
        }
    }

    render() {
        switch (this.gameState) {
            case 'playing':
                this.ui.renderGame();
                break;
            case 'combat':
                this.combat.render();
                break;
            case 'inventory':
                this.ui.renderInventory();
                break;
        }
    }

    // Utility methods for game systems
    getPlayer() {
        return this.gameData.player;
    }

    setGameFlag(flag, value) {
        this.gameData.gameFlags.set(flag, value);
    }

    getGameFlag(flag) {
        return this.gameData.gameFlags.get(flag) || false;
    }

    showMessage(message, duration = 2000) {
        this.ui.showMessage(message, duration);
    }

    pauseGame() {
        this.gameState = 'paused';
    }

    resumeGame() {
        this.gameState = 'playing';
    }

    destroy() {
        // Cleanup resources to prevent memory leaks
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
        
        // Additional cleanup could be added here (event listeners, etc.)
        this.isInitialized = false;
    }
}

// Character class for both player and enemies
class Character {
    constructor(config = {}) {
        this.name = config.name || "Unknown";
        this.type = config.type || "npc";
        this.level = config.level || 1;
        this.experience = config.experience || 0;
        this.experienceToNext = config.experienceToNext || 100;
        
        this.stats = {
            health: config.stats?.health || 50,
            maxHealth: config.stats?.maxHealth || 50,
            mana: config.stats?.mana || 20,
            maxMana: config.stats?.maxMana || 20,
            attack: config.stats?.attack || 10,
            defense: config.stats?.defense || 5,
            agility: config.stats?.agility || 8,
            intelligence: config.stats?.intelligence || 8,
            ...config.stats
        };

        this.inventory = config.inventory || new Inventory();
        this.equipment = config.equipment || { weapon: null, armor: null, accessory: null };
        this.gold = config.gold || 0;
        this.skills = config.skills || [];
        
        // Enemy-specific properties
        this.experienceReward = config.experienceReward || 0;
        this.goldReward = config.goldReward || 0;
        this.itemDrops = config.itemDrops || [];
        this.ai = config.ai || null;
        
        this.statusEffects = [];
        this.isAlive = true;
    }

    gainExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience -= this.experienceToNext;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
        
        // Increase stats on level up
        const statIncrease = {
            maxHealth: 15,
            maxMana: 8,
            attack: 3,
            defense: 2,
            agility: 2,
            intelligence: 2
        };

        Object.keys(statIncrease).forEach(stat => {
            this.stats[stat] += statIncrease[stat];
        });

        // Restore health and mana on level up
        this.stats.health = this.stats.maxHealth;
        this.stats.mana = this.stats.maxMana;

        console.log(`${this.name} reached level ${this.level}!`);
    }

    takeDamage(amount) {
        const damage = Math.max(1, amount - this.getDefense());
        this.stats.health = Math.max(0, this.stats.health - damage);
        
        if (this.stats.health <= 0) {
            this.isAlive = false;
        }
        
        return damage;
    }

    heal(amount) {
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
    }

    getAttack() {
        let attack = this.stats.attack;
        if (this.equipment.weapon) {
            attack += this.equipment.weapon.stats.attack || 0;
        }
        return attack;
    }

    getDefense() {
        let defense = this.stats.defense;
        if (this.equipment.armor) {
            defense += this.equipment.armor.stats.defense || 0;
        }
        return defense;
    }

    canUseSkill(skillName) {
        const skill = this.skills.find(s => s.name === skillName);
        return skill && this.stats.mana >= skill.manaCost;
    }

    useSkill(skillName, target) {
        const skill = this.skills.find(s => s.name === skillName);
        if (!skill || this.stats.mana < skill.manaCost) {
            return false;
        }
        
        this.stats.mana -= skill.manaCost;
        skill.effect(this, target);
        return true;
    }

    checkItemDrop() {
        this.itemDrops.forEach(drop => {
            if (Math.random() < drop.chance) {
                const item = ItemDatabase.getItem(drop.itemId);
                if (item) {
                    // For now, just log the drop - in full implementation this would go to player inventory
                    console.log(`${this.name} dropped ${item.name}!`);
                }
            }
        });
    }
}

// Initialize and expose the game
window.RPGGame = RPGGame;
window.Character = Character;