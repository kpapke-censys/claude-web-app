/**
 * RPG Inventory System
 * Manages player inventory, equipment, and items
 */

class Inventory {
    constructor(data = null) {
        this.items = data?.items || [];
        this.maxSlots = data?.maxSlots || 20;
        this.categories = ['all', 'weapons', 'armor', 'consumables', 'misc'];
    }

    addItem(item, quantity = 1) {
        if (!item) return false;

        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem && item.stackable) {
            existingItem.quantity += quantity;
            return true;
        }
        
        if (this.items.length >= this.maxSlots) {
            console.log("Inventory is full!");
            return false;
        }
        
        this.items.push({
            ...item,
            quantity: quantity,
            slot: this.items.length
        });
        
        return true;
    }

    removeItem(itemId, quantity = 1) {
        const itemIndex = this.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return false;
        
        const item = this.items[itemIndex];
        item.quantity -= quantity;
        
        if (item.quantity <= 0) {
            this.items.splice(itemIndex, 1);
        }
        
        return true;
    }

    hasItem(itemId, quantity = 1) {
        const item = this.items.find(i => i.id === itemId);
        return item && item.quantity >= quantity;
    }

    getItem(itemId) {
        return this.items.find(i => i.id === itemId);
    }

    getItemsByCategory(category) {
        if (category === 'all') return this.items;
        return this.items.filter(item => item.category === category);
    }

    useItem(itemId, target) {
        const item = this.getItem(itemId);
        if (!item || !item.usable) return false;
        
        const success = ItemDatabase.useItem(item, target);
        if (success) {
            this.removeItem(itemId, 1);
        }
        
        return success;
    }

    getTotalValue() {
        return this.items.reduce((total, item) => {
            return total + (item.value || 0) * item.quantity;
        }, 0);
    }

    serialize() {
        return {
            items: this.items,
            maxSlots: this.maxSlots
        };
    }
}

// Item Database and Factory
class ItemDatabase {
    static items = {
        // Weapons
        'iron_sword': {
            id: 'iron_sword',
            name: 'Iron Sword',
            description: 'A sturdy iron sword. +10 Attack',
            category: 'weapons',
            type: 'weapon',
            equipSlot: 'weapon',
            stats: { attack: 10 },
            value: 100,
            stackable: false,
            usable: false,
            icon: '⚔️'
        },
        'steel_sword': {
            id: 'steel_sword',
            name: 'Steel Sword',
            description: 'A sharp steel blade. +18 Attack',
            category: 'weapons',
            type: 'weapon',
            equipSlot: 'weapon',
            stats: { attack: 18 },
            value: 250,
            stackable: false,
            usable: false,
            icon: '🗡️'
        },
        'magic_staff': {
            id: 'magic_staff',
            name: 'Magic Staff',
            description: 'A staff imbued with magical power. +8 Attack, +15 Intelligence',
            category: 'weapons',
            type: 'weapon',
            equipSlot: 'weapon',
            stats: { attack: 8, intelligence: 15 },
            value: 180,
            stackable: false,
            usable: false,
            icon: '🔮'
        },

        // Armor
        'leather_armor': {
            id: 'leather_armor',
            name: 'Leather Armor',
            description: 'Basic leather protection. +5 Defense',
            category: 'armor',
            type: 'armor',
            equipSlot: 'armor',
            stats: { defense: 5 },
            value: 80,
            stackable: false,
            usable: false,
            icon: '🦺'
        },
        'chain_mail': {
            id: 'chain_mail',
            name: 'Chain Mail',
            description: 'Interlocking metal rings provide good protection. +12 Defense',
            category: 'armor',
            type: 'armor',
            equipSlot: 'armor',
            stats: { defense: 12 },
            value: 200,
            stackable: false,
            usable: false,
            icon: '🛡️'
        },

        // Consumables
        'health_potion': {
            id: 'health_potion',
            name: 'Health Potion',
            description: 'Restores 50 health points.',
            category: 'consumables',
            type: 'consumable',
            value: 25,
            stackable: true,
            usable: true,
            icon: '🧪',
            effect: {
                type: 'heal',
                amount: 50
            }
        },
        'mana_potion': {
            id: 'mana_potion',
            name: 'Mana Potion',
            description: 'Restores 30 mana points.',
            category: 'consumables',
            type: 'consumable',
            value: 30,
            stackable: true,
            usable: true,
            icon: '💙',
            effect: {
                type: 'restore_mana',
                amount: 30
            }
        },
        'strength_potion': {
            id: 'strength_potion',
            name: 'Strength Potion',
            description: 'Temporarily increases attack by 10 for 5 turns.',
            category: 'consumables',
            type: 'consumable',
            value: 50,
            stackable: true,
            usable: true,
            icon: '💪',
            effect: {
                type: 'buff',
                stat: 'attack',
                amount: 10,
                duration: 5
            }
        },

        // Miscellaneous
        'monster_fang': {
            id: 'monster_fang',
            name: 'Monster Fang',
            description: 'A sharp fang from a defeated monster. Can be sold for gold.',
            category: 'misc',
            type: 'misc',
            value: 15,
            stackable: true,
            usable: false,
            icon: '🦷'
        },
        'ancient_coin': {
            id: 'ancient_coin',
            name: 'Ancient Coin',
            description: 'A mysterious old coin with strange markings.',
            category: 'misc',
            type: 'misc',
            value: 100,
            stackable: true,
            usable: false,
            icon: '🪙'
        }
    };

    static getItem(itemId) {
        const item = this.items[itemId];
        return item ? { ...item } : null;
    }

    static getAllItems() {
        return Object.values(this.items);
    }

    static getItemsByCategory(category) {
        return Object.values(this.items).filter(item => item.category === category);
    }

    static useItem(item, target) {
        if (!item.usable || !item.effect) return false;

        switch (item.effect.type) {
            case 'heal':
                target.heal(item.effect.amount);
                console.log(`${target.name} restored ${item.effect.amount} health!`);
                return true;
                
            case 'restore_mana':
                const manaRestored = Math.min(item.effect.amount, target.stats.maxMana - target.stats.mana);
                target.stats.mana += manaRestored;
                console.log(`${target.name} restored ${manaRestored} mana!`);
                return true;
                
            case 'buff':
                target.statusEffects.push({
                    type: 'buff',
                    stat: item.effect.stat,
                    amount: item.effect.amount,
                    duration: item.effect.duration
                });
                console.log(`${target.name} gained +${item.effect.amount} ${item.effect.stat} for ${item.effect.duration} turns!`);
                return true;
                
            default:
                return false;
        }
    }

    static createRandomLoot(enemyLevel) {
        const lootTable = [
            { id: 'health_potion', weight: 40, minLevel: 1 },
            { id: 'mana_potion', weight: 30, minLevel: 1 },
            { id: 'monster_fang', weight: 25, minLevel: 1 },
            { id: 'ancient_coin', weight: 10, minLevel: 3 },
            { id: 'iron_sword', weight: 8, minLevel: 2 },
            { id: 'leather_armor', weight: 8, minLevel: 2 },
            { id: 'steel_sword', weight: 3, minLevel: 5 },
            { id: 'chain_mail', weight: 3, minLevel: 5 }
        ];

        const availableLoot = lootTable.filter(item => enemyLevel >= item.minLevel);
        const totalWeight = availableLoot.reduce((sum, item) => sum + item.weight, 0);
        
        let random = Math.random() * totalWeight;
        for (const loot of availableLoot) {
            random -= loot.weight;
            if (random <= 0) {
                return this.getItem(loot.id);
            }
        }
        
        return null;
    }
}

// Equipment Manager
class EquipmentManager {
    constructor(character) {
        this.character = character;
    }

    equip(item) {
        if (!item.equipSlot) return false;

        const currentEquipment = this.character.equipment[item.equipSlot];
        
        // Unequip current item if any
        if (currentEquipment) {
            this.character.inventory.addItem(currentEquipment);
        }
        
        // Equip new item
        this.character.equipment[item.equipSlot] = item;
        this.character.inventory.removeItem(item.id, 1);
        
        this.updateStats();
        return true;
    }

    unequip(slot) {
        const equipment = this.character.equipment[slot];
        if (!equipment) return false;
        
        if (!this.character.inventory.addItem(equipment)) {
            console.log("Inventory is full! Cannot unequip item.");
            return false;
        }
        
        this.character.equipment[slot] = null;
        this.updateStats();
        return true;
    }

    updateStats() {
        // In a full implementation, this would recalculate all stat bonuses from equipment
        // For now, equipment stats are calculated on-demand in Character methods
    }

    getEquippedItems() {
        return Object.values(this.character.equipment).filter(item => item !== null);
    }

    getTotalEquipmentValue() {
        return this.getEquippedItems().reduce((total, item) => total + (item.value || 0), 0);
    }
}

// Export classes
window.Inventory = Inventory;
window.ItemDatabase = ItemDatabase;
window.EquipmentManager = EquipmentManager;