/**
 * RPG Game Data
 * Contains world data, quest definitions, and game configuration
 */

class WorldData {
    static getScenes() {
        return {
            'town': {
                id: 'town',
                name: 'Adventurer\'s Town',
                description: 'A bustling town where adventurers gather. You can see shops, an inn, and fellow travelers.',
                width: 12,
                height: 10,
                startPosition: { x: 5, y: 8 },
                hasRandomEncounters: false,
                map: [
                    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', 'S', '.', '.', 'I', '.', '.', '.', 'T', '.', '.', '#'],
                    ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
                    ['#', '.', '.', 'C', '.', '.', '.', 'N', '.', '.', '.', '#'],
                    ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
                    ['#', '.', '.', '.', '.', 'F', '.', '.', '.', '.', '.', '#'],
                    ['#', '.', '.', '.', '.', '.', '.', '.', '.', 'H', '.', '#'],
                    ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
                    ['#', '.', '.', '.', '.', '@', '.', '.', '.', '.', '.', '#'],
                    ['#', '#', '#', '#', '.', '.', '.', '#', '#', '#', '#', '#']
                ],
                npcs: [
                    {
                        id: 'elder',
                        name: 'Village Elder',
                        position: { x: 7, y: 3 },
                        sprite: 'E',
                        dialogue: [
                            "Welcome to our humble town, brave adventurer!",
                            "The lands beyond are dangerous, but great treasures await.",
                            "Visit the shops to prepare yourself for the journey ahead."
                        ],
                        quests: ['welcome_quest']
                    },
                    {
                        id: 'shopkeeper',
                        name: 'Merchant',
                        position: { x: 1, y: 1 },
                        sprite: 'M',
                        dialogue: "Welcome to my shop! I have the finest wares for adventurers.",
                        shop: {
                            items: [
                                { itemId: 'health_potion', price: 30, stock: 10 },
                                { itemId: 'mana_potion', price: 40, stock: 8 },
                                { itemId: 'iron_sword', price: 120, stock: 1 },
                                { itemId: 'leather_armor', price: 100, stock: 1 }
                            ]
                        }
                    }
                ],
                objects: [
                    {
                        id: 'chest1',
                        name: 'Treasure Chest',
                        type: 'chest',
                        x: 3, y: 3,
                        contents: ItemDatabase.getItem('strength_potion'),
                        opened: false
                    },
                    {
                        id: 'shrine',
                        name: 'Healing Shrine',
                        type: 'shrine',
                        x: 9, y: 6,
                        effect: 'heal'
                    }
                ],
                transitions: [
                    {
                        x: 5, y: 9,
                        destination: 'forest',
                        direction: 'south'
                    }
                ]
            },

            'forest': {
                id: 'forest',
                name: 'Mystic Forest',
                description: 'A dense forest filled with ancient trees. Strange sounds echo from the shadows.',
                width: 15,
                height: 12,
                startPosition: { x: 7, y: 1 },
                hasRandomEncounters: true,
                encounterRate: 0.08,
                map: [
                    ['T', 'T', 'T', 'T', 'T', 'T', 'T', '.', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
                    ['T', '.', '.', '.', 'T', '.', '.', '@', '.', '.', 'T', '.', '.', '.', 'T'],
                    ['T', '.', 'T', '.', '.', '.', 'T', '.', 'T', '.', '.', '.', 'T', '.', 'T'],
                    ['T', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'T'],
                    ['T', 'T', '.', '.', 'T', '.', '.', 'C', '.', '.', 'T', '.', '.', 'T', 'T'],
                    ['T', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'T'],
                    ['T', '.', 'T', '.', '.', '.', 'T', '.', 'T', '.', '.', '.', 'T', '.', 'T'],
                    ['T', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'T'],
                    ['T', '.', '.', 'T', '.', '.', '.', 'N', '.', '.', '.', 'T', '.', '.', 'T'],
                    ['T', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'T'],
                    ['T', '.', '.', '.', 'T', '.', '.', '.', '.', '.', 'T', '.', '.', '.', 'T'],
                    ['T', 'T', 'T', 'T', 'T', 'T', 'T', '.', 'T', 'T', 'T', 'T', 'T', 'T', 'T']
                ],
                npcs: [
                    {
                        id: 'hermit',
                        name: 'Forest Hermit',
                        position: { x: 7, y: 8 },
                        sprite: 'H',
                        dialogue: [
                            "Ah, another brave soul ventures into the forest...",
                            "Beware the creatures that lurk in these woods.",
                            "I sense great potential in you, young one."
                        ]
                    }
                ],
                objects: [
                    {
                        id: 'forest_chest',
                        name: 'Hidden Cache',
                        type: 'chest',
                        x: 7, y: 4,
                        contents: ItemDatabase.getItem('steel_sword'),
                        opened: false
                    }
                ],
                transitions: [
                    {
                        x: 7, y: 0,
                        destination: 'town',
                        direction: 'north'
                    },
                    {
                        x: 7, y: 11,
                        destination: 'dungeon',
                        direction: 'south'
                    }
                ]
            },

            'dungeon': {
                id: 'dungeon',
                name: 'Ancient Dungeon',
                description: 'Dark stone corridors filled with the echoes of ancient magic. Danger lurks around every corner.',
                width: 10,
                height: 8,
                startPosition: { x: 4, y: 6 },
                hasRandomEncounters: true,
                encounterRate: 0.12,
                map: [
                    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '.', '.', '#', '.', '.', '#', '.', '.', '#'],
                    ['#', '.', 'C', '.', '.', '.', '.', 'C', '.', '#'],
                    ['#', '#', '.', '#', '.', '.', '#', '.', '#', '#'],
                    ['#', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
                    ['#', '.', '#', '.', 'B', '.', '.', '#', '.', '#'],
                    ['#', '.', '.', '.', '@', '.', '.', '.', '.', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
                ],
                objects: [
                    {
                        id: 'treasure1',
                        name: 'Ancient Chest',
                        type: 'chest',
                        x: 2, y: 2,
                        contents: ItemDatabase.getItem('chain_mail'),
                        opened: false
                    },
                    {
                        id: 'treasure2',
                        name: 'Golden Chest',
                        type: 'chest',
                        x: 7, y: 2,
                        contents: ItemDatabase.getItem('magic_staff'),
                        opened: false
                    },
                    {
                        id: 'boss_area',
                        name: 'Ancient Altar',
                        type: 'boss',
                        x: 4, y: 4,
                        boss: 'dragon'
                    }
                ],
                transitions: [
                    {
                        x: 4, y: 7,
                        destination: 'forest',
                        direction: 'north'
                    }
                ]
            }
        };
    }

    static getTileSymbols() {
        return {
            '.': '🟫', // Floor
            '#': '🧱', // Wall
            'T': '🌲', // Tree
            '~': '💧', // Water
            '@': '🧙', // Player start
            'N': '👤', // NPC
            'S': '🏪', // Shop
            'I': '🏨', // Inn
            'C': '📦', // Chest
            'F': '⛲', // Fountain
            'H': '🏥', // Healer
            'B': '👹', // Boss
            'E': '👴'  // Elder
        };
    }

    static getTileNames() {
        return {
            '.': 'Floor',
            '#': 'Wall',
            'T': 'Tree',
            '~': 'Water',
            'N': 'Person',
            'S': 'Shop',
            'I': 'Inn',
            'C': 'Chest',
            'F': 'Fountain',
            'H': 'Healer',
            'B': 'Boss Area',
            'E': 'Elder'
        };
    }
}

class QuestDatabase {
    static getQuests() {
        return {
            'welcome_quest': {
                id: 'welcome_quest',
                name: 'Welcome to Adventure',
                description: 'Learn the basics of adventuring by completing simple tasks.',
                objectives: [
                    {
                        id: 'talk_elder',
                        type: 'talk_to_npc',
                        target: 'elder',
                        description: 'Talk to the Village Elder',
                        required: 1
                    },
                    {
                        id: 'visit_shop',
                        type: 'talk_to_npc',
                        target: 'shopkeeper',
                        description: 'Visit the merchant\'s shop',
                        required: 1
                    }
                ],
                rewards: {
                    experience: 50,
                    gold: 25,
                    items: ['health_potion']
                }
            },

            'forest_exploration': {
                id: 'forest_exploration',
                name: 'Forest Explorer',
                description: 'Explore the Mystic Forest and defeat some of its creatures.',
                objectives: [
                    {
                        id: 'kill_goblins',
                        type: 'kill_enemy',
                        target: 'goblin',
                        description: 'Defeat 3 Goblins',
                        required: 3
                    },
                    {
                        id: 'find_hermit',
                        type: 'talk_to_npc',
                        target: 'hermit',
                        description: 'Find and talk to the Forest Hermit',
                        required: 1
                    }
                ],
                rewards: {
                    experience: 100,
                    gold: 50,
                    items: ['mana_potion', 'strength_potion']
                }
            },

            'dungeon_delver': {
                id: 'dungeon_delver',
                name: 'Dungeon Delver',
                description: 'Brave the Ancient Dungeon and claim its treasures.',
                objectives: [
                    {
                        id: 'reach_dungeon',
                        type: 'visit_location',
                        target: 'dungeon',
                        description: 'Enter the Ancient Dungeon',
                        required: 1
                    },
                    {
                        id: 'open_chests',
                        type: 'open_chest',
                        target: 'any',
                        description: 'Open 2 treasure chests',
                        required: 2
                    }
                ],
                rewards: {
                    experience: 200,
                    gold: 100,
                    items: ['ancient_coin', 'ancient_coin']
                }
            },

            'dragon_slayer': {
                id: 'dragon_slayer',
                name: 'Dragon Slayer',
                description: 'Defeat the mighty dragon that guards the deepest part of the dungeon.',
                objectives: [
                    {
                        id: 'kill_dragon',
                        type: 'kill_enemy',
                        target: 'dragon',
                        description: 'Defeat the Young Dragon',
                        required: 1
                    }
                ],
                rewards: {
                    experience: 500,
                    gold: 250,
                    items: ['steel_sword', 'chain_mail', 'ancient_coin']
                }
            }
        };
    }
}

class SkillDatabase {
    static getSkills() {
        return {
            'power_attack': {
                id: 'power_attack',
                name: 'Power Attack',
                description: 'A mighty attack that deals 150% normal damage.',
                manaCost: 10,
                targetType: 'enemy',
                effect: (caster, target) => {
                    const damage = Math.floor(caster.getAttack() * 1.5);
                    return target.takeDamage(damage);
                }
            },

            'heal': {
                id: 'heal',
                name: 'Heal',
                description: 'Restore health using magical energy.',
                manaCost: 15,
                targetType: 'self',
                effect: (caster, target) => {
                    const healAmount = 30 + Math.floor(caster.stats.intelligence * 0.5);
                    target.heal(healAmount);
                    return healAmount;
                }
            },

            'fireball': {
                id: 'fireball',
                name: 'Fireball',
                description: 'Launch a ball of fire at your enemy.',
                manaCost: 20,
                targetType: 'enemy',
                effect: (caster, target) => {
                    const damage = 20 + Math.floor(caster.stats.intelligence * 0.8);
                    return target.takeDamage(damage);
                }
            },

            'shield': {
                id: 'shield',
                name: 'Magic Shield',
                description: 'Create a protective barrier that reduces incoming damage.',
                manaCost: 12,
                targetType: 'self',
                effect: (caster, target) => {
                    target.statusEffects.push({
                        type: 'shield',
                        amount: 0.4,
                        duration: 3
                    });
                }
            },

            'double_strike': {
                id: 'double_strike',
                name: 'Double Strike',
                description: 'Strike twice in rapid succession.',
                manaCost: 8,
                targetType: 'enemy',
                effect: (caster, target) => {
                    const damage1 = target.takeDamage(caster.getAttack() * 0.7);
                    const damage2 = target.takeDamage(caster.getAttack() * 0.7);
                    return damage1 + damage2;
                }
            }
        };
    }

    static getSkill(skillId) {
        const skill = this.getSkills()[skillId];
        return skill ? { ...skill } : null;
    }

    static getSkillsByLevel(level) {
        const allSkills = this.getSkills();
        const availableSkills = [];

        // Define skill unlock levels
        const skillLevels = {
            'power_attack': 2,
            'heal': 3,
            'shield': 4,
            'double_strike': 5,
            'fireball': 6
        };

        Object.keys(allSkills).forEach(skillId => {
            if (level >= (skillLevels[skillId] || 1)) {
                availableSkills.push(allSkills[skillId]);
            }
        });

        return availableSkills;
    }
}

// Export classes
window.WorldData = WorldData;
window.QuestDatabase = QuestDatabase;
window.SkillDatabase = SkillDatabase;