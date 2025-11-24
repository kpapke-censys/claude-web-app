/**
 * RPG World and Quest System
 * Manages game world, scenes, NPCs, and quest progression
 */

class WorldManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.playerPosition = { x: 5, y: 5 };
        this.scenes = WorldData.getScenes();
        this.npcs = new Map();
    }

    loadScene(sceneId) {
        const sceneData = this.scenes[sceneId];
        if (!sceneData) {
            console.error(`Scene ${sceneId} not found!`);
            return;
        }

        this.currentScene = sceneData;
        this.game.currentScene = sceneId;
        this.playerPosition = { ...sceneData.startPosition };
        
        // Initialize NPCs for this scene
        this.initializeNPCs(sceneData.npcs || []);
        
        this.game.ui.updateWorldView();
        console.log(`Loaded scene: ${sceneData.name}`);
    }

    initializeNPCs(npcData) {
        this.npcs.clear();
        
        npcData.forEach(data => {
            const npc = new NPC(data);
            this.npcs.set(npc.id, npc);
        });
    }

    movePlayer(direction) {
        const newPosition = { ...this.playerPosition };
        
        switch (direction) {
            case 'north':
                newPosition.y--;
                break;
            case 'south':
                newPosition.y++;
                break;
            case 'west':
                newPosition.x--;
                break;
            case 'east':
                newPosition.x++;
                break;
        }

        if (this.canMoveTo(newPosition)) {
            this.playerPosition = newPosition;
            this.checkForEvents();
            this.game.ui.updateWorldView();
        } else {
            this.game.showMessage("You can't go that way.");
        }
    }

    canMoveTo(position) {
        const { x, y } = position;
        const scene = this.currentScene;
        
        // Check bounds
        if (x < 0 || y < 0 || x >= scene.width || y >= scene.height) {
            return false;
        }
        
        // Check for walls or obstacles
        const tile = scene.map[y][x];
        return tile !== '#' && tile !== '~'; // '#' = wall, '~' = water
    }

    checkForEvents() {
        // Check for NPCs at current position
        const npc = this.getNPCAtPosition(this.playerPosition);
        if (npc) {
            this.game.showMessage(`You see ${npc.name}. Press Enter to talk.`);
        }
        
        // Check for random encounters
        if (this.currentScene.hasRandomEncounters) {
            const encounterChance = this.currentScene.encounterRate || 0.05;
            if (Math.random() < encounterChance) {
                this.triggerRandomEncounter();
            }
        }
        
        // Check for scene transitions
        const transition = this.getTransitionAtPosition(this.playerPosition);
        if (transition) {
            this.game.showMessage(`You see a path to ${transition.destination}. Press Enter to travel.`);
        }
    }

    interact() {
        // Check for NPCs
        const npc = this.getNPCAtPosition(this.playerPosition);
        if (npc) {
            this.talkToNPC(npc);
            return;
        }
        
        // Check for scene transitions
        const transition = this.getTransitionAtPosition(this.playerPosition);
        if (transition) {
            this.loadScene(transition.destination);
            return;
        }
        
        // Check for interactive objects
        const object = this.getObjectAtPosition(this.playerPosition);
        if (object) {
            this.interactWithObject(object);
            return;
        }
        
        this.game.showMessage("Nothing to interact with here.");
    }

    getNPCAtPosition(position) {
        return Array.from(this.npcs.values()).find(npc => 
            npc.position.x === position.x && npc.position.y === position.y
        );
    }

    getTransitionAtPosition(position) {
        return this.currentScene.transitions?.find(t =>
            t.x === position.x && t.y === position.y
        );
    }

    getObjectAtPosition(position) {
        return this.currentScene.objects?.find(obj =>
            obj.x === position.x && obj.y === position.y
        );
    }

    talkToNPC(npc) {
        const dialogue = npc.getDialogue(this.game);
        this.game.ui.showDialogue(npc, dialogue);
    }

    triggerRandomEncounter() {
        const playerLevel = this.game.getPlayer().level;
        const enemy = EnemyFactory.getRandomEnemy(playerLevel);
        
        this.game.showMessage(`A ${enemy.name} appears!`, 2000);
        setTimeout(() => {
            this.game.startCombat(enemy);
        }, 2000);
    }

    interactWithObject(object) {
        switch (object.type) {
            case 'chest':
                this.openChest(object);
                break;
            case 'shop':
                this.openShop(object);
                break;
            case 'shrine':
                this.useShrine(object);
                break;
            default:
                this.game.showMessage(`You examine the ${object.name}.`);
        }
    }

    openChest(chest) {
        if (chest.opened) {
            this.game.showMessage("The chest is empty.");
            return;
        }
        
        const loot = chest.contents || ItemDatabase.createRandomLoot(this.game.getPlayer().level);
        if (loot) {
            if (this.game.getPlayer().inventory.addItem(loot)) {
                this.game.showMessage(`Found ${loot.name}!`);
                chest.opened = true;
            } else {
                this.game.showMessage("Your inventory is full!");
            }
        } else {
            this.game.showMessage("The chest is empty.");
            chest.opened = true;
        }
    }

    openShop(shop) {
        this.game.ui.showShop(shop);
    }

    useShrine(shrine) {
        const player = this.game.getPlayer();
        
        switch (shrine.effect) {
            case 'heal':
                player.stats.health = player.stats.maxHealth;
                player.stats.mana = player.stats.maxMana;
                this.game.showMessage("You feel refreshed! Health and mana restored.");
                break;
            case 'save':
                this.game.saveGameData();
                this.game.showMessage("Your progress has been saved.");
                break;
        }
    }

    getSceneDescription() {
        return this.currentScene?.description || "You are in an unknown area.";
    }

    getVisibleTiles(radius = 3) {
        const tiles = [];
        const centerX = this.playerPosition.x;
        const centerY = this.playerPosition.y;
        
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (x >= 0 && y >= 0 && x < this.currentScene.width && y < this.currentScene.height) {
                    tiles.push({
                        x, y,
                        tile: this.currentScene.map[y][x],
                        isPlayer: x === centerX && y === centerY,
                        npc: this.getNPCAtPosition({ x, y }),
                        object: this.getObjectAtPosition({ x, y })
                    });
                }
            }
        }
        
        return tiles;
    }
}

class NPC {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.position = data.position;
        this.dialogue = data.dialogue;
        this.quests = data.quests || [];
        this.shop = data.shop || null;
        this.sprite = data.sprite || 'N';
    }

    getDialogue(game) {
        // Simple dialogue system - can be expanded
        if (Array.isArray(this.dialogue)) {
            return this.dialogue[Math.floor(Math.random() * this.dialogue.length)];
        }
        
        return this.dialogue || "Hello there!";
    }

    hasQuest(questId) {
        return this.quests.includes(questId);
    }

    giveQuest(game, questId) {
        return game.quest.startQuest(questId);
    }
}

class QuestSystem {
    constructor(game) {
        this.game = game;
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.questDatabase = QuestDatabase.getQuests();
    }

    startQuest(questId) {
        if (this.activeQuests.has(questId) || this.completedQuests.has(questId)) {
            return false;
        }
        
        const questData = this.questDatabase[questId];
        if (!questData) {
            console.error(`Quest ${questId} not found!`);
            return false;
        }
        
        const quest = new Quest(questData);
        this.activeQuests.set(questId, quest);
        
        this.game.showMessage(`New Quest: ${quest.name}`);
        console.log(`Started quest: ${quest.name}`);
        
        return true;
    }

    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return false;
        
        // Give rewards
        const player = this.game.getPlayer();
        
        if (quest.rewards.experience) {
            player.gainExperience(quest.rewards.experience);
        }
        
        if (quest.rewards.gold) {
            player.gold += quest.rewards.gold;
        }
        
        if (quest.rewards.items) {
            quest.rewards.items.forEach(itemId => {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    player.inventory.addItem(item);
                }
            });
        }
        
        this.activeQuests.delete(questId);
        this.completedQuests.add(questId);
        
        this.game.showMessage(`Quest Complete: ${quest.name}!`, 3000);
        return true;
    }

    updateQuestProgress(event, data) {
        this.activeQuests.forEach((quest, questId) => {
            quest.updateProgress(event, data);
            
            if (quest.isComplete()) {
                this.completeQuest(questId);
            }
        });
    }

    openQuestLog() {
        this.game.ui.showQuestLog(this.activeQuests, this.completedQuests);
    }

    getQuestData() {
        return {
            active: Array.from(this.activeQuests.entries()),
            completed: Array.from(this.completedQuests)
        };
    }

    loadQuestData(data) {
        this.activeQuests.clear();
        this.completedQuests.clear();
        
        if (data.active) {
            data.active.forEach(([questId, questData]) => {
                const quest = new Quest(this.questDatabase[questId]);
                quest.progress = questData.progress;
                this.activeQuests.set(questId, quest);
            });
        }
        
        if (data.completed) {
            data.completed.forEach(questId => {
                this.completedQuests.add(questId);
            });
        }
    }
}

class Quest {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.objectives = data.objectives;
        this.rewards = data.rewards;
        this.progress = {};
        
        // Initialize progress tracking
        this.objectives.forEach(objective => {
            this.progress[objective.id] = 0;
        });
    }

    updateProgress(event, data) {
        this.objectives.forEach(objective => {
            if (objective.type === event) {
                switch (event) {
                    case 'kill_enemy':
                        if (data.enemyType === objective.target) {
                            this.progress[objective.id]++;
                        }
                        break;
                    case 'collect_item':
                        if (data.itemId === objective.target) {
                            this.progress[objective.id] += data.quantity;
                        }
                        break;
                    case 'talk_to_npc':
                        if (data.npcId === objective.target) {
                            this.progress[objective.id] = 1;
                        }
                        break;
                }
            }
        });
    }

    isComplete() {
        return this.objectives.every(objective => 
            this.progress[objective.id] >= objective.required
        );
    }

    getProgressText() {
        return this.objectives.map(objective => {
            const current = this.progress[objective.id];
            const required = objective.required;
            const completed = current >= required;
            
            return `${objective.description}: ${current}/${required} ${completed ? '✓' : ''}`;
        });
    }
}

// Export classes
window.WorldManager = WorldManager;
window.NPC = NPC;
window.QuestSystem = QuestSystem;
window.Quest = Quest;