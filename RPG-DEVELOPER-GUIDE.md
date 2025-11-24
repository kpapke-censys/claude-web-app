# 🎮 RPG Adventure Framework - Developer Guide

## 📋 Overview

This is a complete RPG game framework built with vanilla JavaScript, designed as an educational tool for learning game development concepts. The framework includes all the core systems you'd expect in a modern RPG:

- Turn-based combat system
- Character progression and leveling
- Inventory and equipment management
- Quest system with objectives
- World exploration with multiple areas
- NPC interactions and dialogue
- Save/load functionality

## 🏗️ Architecture

The game follows a modular architecture where each system is implemented as a separate class:

```
RPGGame (main controller)
├── RPGInterface (UI management)
├── CombatSystem (turn-based combat)
├── WorldManager (exploration & NPCs)
├── QuestSystem (objectives & rewards)
└── Player Character
    ├── Inventory (items & equipment)
    └── Stats & Progression
```

## 📁 File Structure

### Core Game Files
- **`rpg-game.js`** - Main game controller and initialization
- **`rpg-ui.js`** - User interface and screen management
- **`rpg-combat.js`** - Combat system and enemy AI
- **`rpg-world.js`** - World exploration, NPCs, and quests
- **`rpg-inventory.js`** - Inventory, items, and equipment
- **`rpg-data.js`** - Game data (world maps, quests, items)

## 🎯 Key Classes and Systems

### RPGGame (Main Controller)
The central game controller that manages all systems and game state.

```javascript
const game = new RPGGame();
await game.initialize(containerElement);
```

**Key Methods:**
- `initialize()` - Sets up all game systems
- `newGame()` - Creates a new character and starts adventure
- `saveGameData()` - Saves progress to localStorage
- `loadGame()` - Loads saved progress

### Character System
Represents both the player and enemies with stats, skills, and equipment.

```javascript
const player = new Character({
    name: "Hero",
    level: 1,
    stats: { health: 100, attack: 15, defense: 8 }
});
```

**Key Features:**
- Level progression with automatic stat increases
- Equipment system affecting combat stats
- Status effects and buffs/debuffs
- Experience gain and skill learning

### Combat System
Turn-based tactical combat with multiple action types.

```javascript
// Combat automatically starts when encountering enemies
game.startCombat(enemy);
```

**Combat Actions:**
- **Attack** - Basic melee combat
- **Skills** - Special abilities using mana
- **Items** - Use consumables for healing/buffs
- **Defend** - Reduce incoming damage
- **Flee** - Attempt to escape combat

### Inventory System
Complete item management with categories and equipment.

```javascript
const inventory = new Inventory();
inventory.addItem(ItemDatabase.getItem('health_potion'), 5);
```

**Item Categories:**
- **Weapons** - Swords, staves, etc. (increase attack)
- **Armor** - Protection gear (increase defense)
- **Consumables** - Potions and temporary buffs
- **Miscellaneous** - Quest items and crafting materials

### World System
Tile-based exploration with NPCs, objects, and scene transitions.

**Map Format:**
```javascript
map: [
    ['#', '#', '#', '#'],  // # = wall
    ['#', '.', 'N', '#'],  // . = floor, N = NPC
    ['#', 'C', '@', '#'],  // C = chest, @ = player start
    ['#', '#', '#', '#']
]
```

### Quest System
Objective-based quests with progress tracking and rewards.

```javascript
// Quest structure
{
    id: 'welcome_quest',
    name: 'Welcome to Adventure',
    objectives: [
        { type: 'talk_to_npc', target: 'elder', required: 1 }
    ],
    rewards: { experience: 50, gold: 25 }
}
```

## 🛠️ Extending the Framework

### Adding New Items

1. Add item data to `ItemDatabase` in `rpg-data.js`:
```javascript
'magic_sword': {
    id: 'magic_sword',
    name: 'Magic Sword',
    description: 'A sword imbued with magical power',
    category: 'weapons',
    stats: { attack: 25, intelligence: 5 },
    value: 500,
    icon: '⚡'
}
```

2. Items are automatically available through `ItemDatabase.getItem('magic_sword')`

### Creating New Areas

1. Add scene data to `WorldData` in `rpg-data.js`:
```javascript
'my_area': {
    id: 'my_area',
    name: 'My Custom Area',
    description: 'A description of your area',
    width: 10,
    height: 10,
    map: [...], // 2D array representing the area
    npcs: [...], // NPCs in this area
    objects: [...], // Interactive objects
    transitions: [...] // Connections to other areas
}
```

### Adding New Enemies

1. Define enemy template in `EnemyFactory` in `rpg-combat.js`:
```javascript
'my_monster': {
    name: 'My Monster',
    level: 5,
    stats: { health: 80, attack: 20, defense: 10 },
    experienceReward: 75,
    goldReward: 30,
    itemDrops: [
        { itemId: 'monster_fang', chance: 0.4 }
    ]
}
```

2. Create enemies with: `EnemyFactory.createEnemy('my_monster')`

### Creating New Quests

1. Add quest definition to `QuestDatabase` in `rpg-data.js`:
```javascript
'my_quest': {
    id: 'my_quest',
    name: 'My Quest Name',
    description: 'Quest description',
    objectives: [
        {
            id: 'kill_monsters',
            type: 'kill_enemy',
            target: 'goblin',
            description: 'Defeat 5 Goblins',
            required: 5
        }
    ],
    rewards: { experience: 100, gold: 50, items: ['health_potion'] }
}
```

2. Start quests with: `game.quest.startQuest('my_quest')`

### Adding New Skills

1. Define skills in `SkillDatabase` in `rpg-data.js`:
```javascript
'my_skill': {
    id: 'my_skill',
    name: 'My Skill',
    description: 'Skill description',
    manaCost: 15,
    targetType: 'enemy',
    effect: (caster, target) => {
        // Custom skill logic here
        const damage = caster.getAttack() * 1.5;
        return target.takeDamage(damage);
    }
}
```

## 🎮 Game Flow

1. **Initialization** - Game loads, UI is set up
2. **Main Menu** - Player chooses to start new game or load save
3. **Character Creation** - Player character is created with starting equipment
4. **Town Exploration** - Player learns controls and basic mechanics
5. **Quest System** - Player receives first quest from Village Elder
6. **Combat Introduction** - First battles teach combat mechanics
7. **Progression** - Player levels up, finds better equipment
8. **Area Expansion** - Access to forest and dungeon areas
9. **Advanced Systems** - More complex quests, equipment, and enemies

## 🔧 Configuration

### Game Balance
Key balance parameters can be adjusted in the respective classes:

- **Experience Curves** - `Character.levelUp()` method
- **Combat Damage** - `CombatSystem.performAttack()` method
- **Item Drop Rates** - `itemDrops` arrays in enemy definitions
- **Random Encounter Rates** - `encounterRate` in scene definitions

### UI Customization
The UI system uses CSS classes that can be styled in `rpg-ui.js`:

- `.rpg-game` - Main container
- `.world-view` - Exploration grid
- `.combat-layout` - Combat interface
- `.inventory-modal` - Inventory screen

## 💡 Learning Opportunities

This framework demonstrates many important game development concepts:

### Programming Patterns
- **State Management** - Game state transitions (menu → playing → combat)
- **Factory Pattern** - Creating enemies and items from templates
- **Observer Pattern** - Quest progress tracking and UI updates
- **Component System** - Modular game systems

### Game Design Concepts
- **Game Loops** - Main update/render cycle
- **Turn-Based Combat** - Action selection and resolution
- **Persistent Progression** - Save/load system with character advancement
- **Resource Management** - Health, mana, inventory space

### Data Structures
- **2D Arrays** - World maps and tile systems
- **Object Composition** - Character stats and equipment bonuses
- **State Machines** - Combat flow and game states
- **Trees/Graphs** - Quest dependencies and world connections

## 🚀 Performance Notes

- **Local Storage** - All save data uses browser localStorage
- **No External Dependencies** - Pure vanilla JavaScript for learning
- **Mobile Responsive** - Touch-friendly controls and layouts
- **Progressive Web App** - Installable and works offline

## 🐛 Debugging Tips

- Check browser console for error messages and game logs
- Use `game.getPlayer()` to inspect character state
- Combat logs show detailed battle information
- Quest progress can be checked with `game.quest.activeQuests`

---

## 🎓 Next Steps

After exploring this framework, try:

1. **Add Your Own Content** - Create new areas, enemies, or quests
2. **Implement New Systems** - Add crafting, magic schools, or guilds
3. **Improve the AI** - Make enemies smarter with advanced behaviors
4. **Add Multiplayer** - Extend to support multiple players
5. **Create Your Own Game** - Use this as a foundation for your own RPG

The code is well-commented and modular, making it easy to understand and extend. Happy coding! 🎮