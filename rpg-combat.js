/**
 * RPG Combat System
 * Turn-based combat with skills, status effects, and AI
 */

class CombatSystem {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.currentTurn = 'player';
        this.turnQueue = [];
        this.combatLog = [];
        this.animationQueue = [];
        this.turnNumber = 1;
        this.selectedAction = null;
        this.selectedTarget = null;
    }

    startCombat(player, enemy) {
        this.isActive = true;
        this.player = player;
        this.enemy = enemy;
        this.turnQueue = this.initializeTurnOrder();
        this.combatLog = [];
        this.turnNumber = 1;
        this.currentTurn = 'player';
        
        this.addToCombatLog(`Combat begins! ${player.name} vs ${enemy.name}`);
        this.game.ui.showCombat(this);
    }

    initializeTurnOrder() {
        const participants = [
            { character: this.player, type: 'player' },
            { character: this.enemy, type: 'enemy' }
        ];
        
        // Sort by agility (higher agility goes first)
        return participants.sort((a, b) => 
            b.character.stats.agility - a.character.stats.agility
        );
    }

    handleInput(key) {
        if (!this.isActive || this.currentTurn !== 'player') return;

        switch (key) {
            case '1':
                this.selectAction('attack');
                break;
            case '2':
                this.selectAction('skill');
                break;
            case '3':
                this.selectAction('item');
                break;
            case '4':
                this.selectAction('defend');
                break;
            case 'enter':
                this.executePlayerAction();
                break;
            case 'escape':
                this.attemptFlee();
                break;
        }
    }

    selectAction(action) {
        this.selectedAction = action;
        this.selectedTarget = this.enemy; // For now, always target enemy
        
        switch (action) {
            case 'attack':
                this.addToCombatLog(`${this.player.name} prepares to attack!`);
                break;
            case 'defend':
                this.addToCombatLog(`${this.player.name} takes a defensive stance.`);
                break;
            case 'item':
                this.showItemSelection();
                break;
            case 'skill':
                this.showSkillSelection();
                break;
        }
    }

    executePlayerAction() {
        if (!this.selectedAction) return;

        switch (this.selectedAction) {
            case 'attack':
                this.performAttack(this.player, this.enemy);
                break;
            case 'defend':
                this.performDefend(this.player);
                break;
            case 'item':
                // Item usage would be implemented here
                this.addToCombatLog("Item usage not yet implemented in this demo.");
                break;
            case 'skill':
                // Skill usage would be implemented here
                this.addToCombatLog("Skill usage not yet implemented in this demo.");
                break;
        }

        this.selectedAction = null;
        this.endTurn();
    }

    performAttack(attacker, target) {
        const baseAttack = attacker.getAttack();
        const variance = Math.random() * 0.4 + 0.8; // 80-120% of base damage
        const damage = Math.floor(baseAttack * variance);
        
        const actualDamage = target.takeDamage(damage);
        
        this.addToCombatLog(
            `${attacker.name} attacks ${target.name} for ${actualDamage} damage!`
        );

        if (!target.isAlive) {
            this.endCombat(attacker === this.player);
        }
    }

    performDefend(character) {
        // Defending reduces incoming damage by 50% for the next turn
        character.statusEffects.push({
            type: 'defending',
            amount: 0.5,
            duration: 1
        });
        
        this.addToCombatLog(`${character.name} takes a defensive stance!`);
    }

    executeEnemyTurn() {
        if (!this.enemy.isAlive) return;

        // Simple AI: attack if low health, otherwise use a skill if available
        const enemyHealth = this.enemy.stats.health / this.enemy.stats.maxHealth;
        
        if (enemyHealth < 0.3 && Math.random() < 0.7) {
            // Try to heal or use defensive skill
            this.performDefend(this.enemy);
        } else {
            // Attack the player
            this.performAttack(this.enemy, this.player);
        }
    }

    endTurn() {
        this.processStatusEffects();
        
        if (this.currentTurn === 'player') {
            this.currentTurn = 'enemy';
            setTimeout(() => {
                if (this.isActive) {
                    this.executeEnemyTurn();
                    this.currentTurn = 'player';
                    this.turnNumber++;
                }
            }, 1000);
        }
    }

    processStatusEffects() {
        [this.player, this.enemy].forEach(character => {
            character.statusEffects = character.statusEffects.filter(effect => {
                effect.duration--;
                
                if (effect.duration <= 0) {
                    if (effect.type === 'buff') {
                        this.addToCombatLog(
                            `${character.name}'s ${effect.stat} boost wears off.`
                        );
                    }
                    return false;
                }
                return true;
            });
        });
    }

    attemptFlee() {
        const fleeChance = 0.7; // 70% base flee chance
        const agilityBonus = this.player.stats.agility / this.enemy.stats.agility;
        const finalChance = Math.min(0.95, fleeChance * agilityBonus);
        
        if (Math.random() < finalChance) {
            this.addToCombatLog(`${this.player.name} successfully fled from combat!`);
            this.endCombat(false, true);
        } else {
            this.addToCombatLog(`${this.player.name} couldn't escape!`);
            this.endTurn();
        }
    }

    endCombat(playerVictory, fled = false) {
        this.isActive = false;
        
        if (fled) {
            this.addToCombatLog("Fled from combat!");
        } else if (playerVictory) {
            this.addToCombatLog(`Victory! ${this.enemy.name} has been defeated!`);
        } else {
            this.addToCombatLog(`Defeat! ${this.player.name} has been defeated!`);
        }
        
        setTimeout(() => {
            this.game.endCombat(playerVictory && !fled);
        }, 2000);
    }

    addToCombatLog(message) {
        this.combatLog.push({
            message: message,
            timestamp: Date.now()
        });
        
        // Keep log reasonable size
        if (this.combatLog.length > 50) {
            this.combatLog.shift();
        }
        
        console.log(`[Combat] ${message}`);
    }

    showItemSelection() {
        const usableItems = this.player.inventory.items.filter(item => item.usable);
        
        if (usableItems.length === 0) {
            this.addToCombatLog("No usable items available!");
            return;
        }
        
        this.addToCombatLog("Select an item to use:");
        usableItems.forEach((item, index) => {
            this.addToCombatLog(`${index + 1}. ${item.name} (x${item.quantity})`);
        });
    }

    showSkillSelection() {
        const availableSkills = this.player.skills.filter(skill => 
            this.player.stats.mana >= skill.manaCost
        );
        
        if (availableSkills.length === 0) {
            this.addToCombatLog("No skills available! (Not enough mana or no skills learned)");
            return;
        }
        
        this.addToCombatLog("Select a skill to use:");
        availableSkills.forEach((skill, index) => {
            this.addToCombatLog(`${index + 1}. ${skill.name} (${skill.manaCost} MP)`);
        });
    }

    update() {
        // Handle animations and timing
        if (this.animationQueue.length > 0) {
            const animation = this.animationQueue[0];
            if (animation.isComplete()) {
                this.animationQueue.shift();
            }
        }
    }

    render() {
        // Combat rendering is handled by the UI system
        this.game.ui.renderCombat();
    }

    getCombatState() {
        return {
            isActive: this.isActive,
            currentTurn: this.currentTurn,
            turnNumber: this.turnNumber,
            combatLog: this.combatLog.slice(-10), // Last 10 messages
            player: {
                name: this.player.name,
                health: this.player.stats.health,
                maxHealth: this.player.stats.maxHealth,
                mana: this.player.stats.mana,
                maxMana: this.player.stats.maxMana,
                statusEffects: this.player.statusEffects
            },
            enemy: this.enemy ? {
                name: this.enemy.name,
                health: this.enemy.stats.health,
                maxHealth: this.enemy.stats.maxHealth,
                statusEffects: this.enemy.statusEffects
            } : null,
            selectedAction: this.selectedAction
        };
    }
}

// Enemy Factory
class EnemyFactory {
    static enemies = {
        'goblin': {
            name: 'Goblin',
            level: 1,
            stats: {
                health: 30,
                maxHealth: 30,
                mana: 0,
                maxMana: 0,
                attack: 8,
                defense: 3,
                agility: 12,
                intelligence: 5
            },
            experienceReward: 15,
            goldReward: 8,
            itemDrops: [
                { itemId: 'monster_fang', chance: 0.3 },
                { itemId: 'health_potion', chance: 0.2 }
            ],
            ai: 'aggressive'
        },
        'orc': {
            name: 'Orc',
            level: 3,
            stats: {
                health: 60,
                maxHealth: 60,
                mana: 0,
                maxMana: 0,
                attack: 15,
                defense: 8,
                agility: 6,
                intelligence: 4
            },
            experienceReward: 35,
            goldReward: 20,
            itemDrops: [
                { itemId: 'iron_sword', chance: 0.1 },
                { itemId: 'monster_fang', chance: 0.4 },
                { itemId: 'ancient_coin', chance: 0.15 }
            ],
            ai: 'aggressive'
        },
        'skeleton': {
            name: 'Skeleton',
            level: 2,
            stats: {
                health: 45,
                maxHealth: 45,
                mana: 20,
                maxMana: 20,
                attack: 12,
                defense: 5,
                agility: 8,
                intelligence: 8
            },
            experienceReward: 25,
            goldReward: 15,
            itemDrops: [
                { itemId: 'ancient_coin', chance: 0.2 },
                { itemId: 'mana_potion', chance: 0.25 }
            ],
            ai: 'balanced',
            skills: ['bone_throw']
        },
        'dragon': {
            name: 'Young Dragon',
            level: 8,
            stats: {
                health: 150,
                maxHealth: 150,
                mana: 80,
                maxMana: 80,
                attack: 30,
                defense: 20,
                agility: 15,
                intelligence: 25
            },
            experienceReward: 200,
            goldReward: 100,
            itemDrops: [
                { itemId: 'steel_sword', chance: 0.3 },
                { itemId: 'chain_mail', chance: 0.25 },
                { itemId: 'ancient_coin', chance: 0.8 }
            ],
            ai: 'intelligent',
            skills: ['fire_breath', 'intimidate']
        }
    };

    static createEnemy(enemyId, levelAdjustment = 0) {
        const template = this.enemies[enemyId];
        if (!template) return null;

        const enemy = new Character({
            ...template,
            type: 'enemy',
            level: template.level + levelAdjustment
        });

        // Scale stats based on level adjustment
        if (levelAdjustment !== 0) {
            const multiplier = 1 + (levelAdjustment * 0.15);
            Object.keys(enemy.stats).forEach(stat => {
                if (stat !== 'maxHealth' && stat !== 'maxMana') {
                    enemy.stats[stat] = Math.floor(enemy.stats[stat] * multiplier);
                }
            });
            
            enemy.stats.health = enemy.stats.maxHealth;
            enemy.stats.mana = enemy.stats.maxMana;
            enemy.experienceReward = Math.floor(enemy.experienceReward * multiplier);
            enemy.goldReward = Math.floor(enemy.goldReward * multiplier);
        }

        return enemy;
    }

    static getRandomEnemy(playerLevel) {
        const enemyIds = Object.keys(this.enemies);
        const availableEnemies = enemyIds.filter(id => {
            const enemy = this.enemies[id];
            return enemy.level >= playerLevel - 2 && enemy.level <= playerLevel + 2;
        });

        if (availableEnemies.length === 0) {
            return this.createEnemy('goblin', Math.max(0, playerLevel - 1));
        }

        const randomEnemyId = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        const levelVariance = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        
        return this.createEnemy(randomEnemyId, levelVariance);
    }
}

// Export classes
window.CombatSystem = CombatSystem;
window.EnemyFactory = EnemyFactory;