/**
 * RPG User Interface System
 * Manages all UI elements, screens, and user interactions
 */

class RPGInterface {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentScreen = 'menu';
        this.messageQueue = [];
        this.isShowingDialogue = false;
    }

    async initialize(container) {
        this.container = container;
        this.createMainStructure();
        this.setupEventListeners();
    }

    createMainStructure() {
        this.container.innerHTML = `
            <div id="rpg-game" class="rpg-game">
                <!-- Main Menu Screen -->
                <div id="menu-screen" class="rpg-screen active">
                    <div class="menu-container">
                        <h1 class="rpg-title">⚔️ RPG Adventure</h1>
                        <div class="menu-subtitle">A Learning Framework for Game Development</div>
                        <div class="menu-options">
                            <button class="rpg-btn primary" onclick="window.rpgGame.newGame()">
                                ⭐ Start New Adventure
                            </button>
                            <button class="rpg-btn secondary" onclick="window.rpgGame.loadGame()">
                                💾 Continue Journey
                            </button>
                            <button class="rpg-btn" onclick="this.showInstructions()">
                                📖 How to Play
                            </button>
                        </div>
                        <div class="game-description">
                            <h3>🎮 Features</h3>
                            <ul>
                                <li>🗺️ Explore multiple interconnected areas</li>
                                <li>⚔️ Turn-based tactical combat</li>
                                <li>📦 Inventory and equipment system</li>
                                <li>📜 Quest system with objectives</li>
                                <li>⬆️ Character progression and leveling</li>
                                <li>💾 Auto-save functionality</li>
                            </ul>
                            <div class="controls-info">
                                <strong>🎯 Controls:</strong> WASD/Arrow Keys to move, Enter to interact, 
                                I for inventory, Q for quests, S for status
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Game Screen -->
                <div id="game-screen" class="rpg-screen">
                    <div class="game-layout">
                        <!-- Left Panel: World View -->
                        <div class="world-panel">
                            <div class="world-header">
                                <h3 id="scene-name">Adventure Awaits</h3>
                                <div id="scene-description">Begin your journey...</div>
                            </div>
                            <div id="world-view" class="world-view">
                                <!-- World tiles will be rendered here -->
                            </div>
                            <div class="movement-hint">
                                Use WASD or arrow keys to move • Enter to interact
                            </div>
                        </div>

                        <!-- Right Panel: Character Info -->
                        <div class="info-panel">
                            <!-- Character Status -->
                            <div class="character-status">
                                <h4>🧙‍♂️ <span id="player-name">Hero</span></h4>
                                <div class="level-info">
                                    <span>Level <span id="player-level">1</span></span>
                                    <span id="player-class">Adventurer</span>
                                </div>
                                
                                <!-- Health Bar -->
                                <div class="stat-bar">
                                    <label>❤️ Health</label>
                                    <div class="bar health-bar">
                                        <div id="health-fill" class="bar-fill" style="width: 100%"></div>
                                    </div>
                                    <span id="health-text">100/100</span>
                                </div>

                                <!-- Mana Bar -->
                                <div class="stat-bar">
                                    <label>💙 Mana</label>
                                    <div class="bar mana-bar">
                                        <div id="mana-fill" class="bar-fill" style="width: 100%"></div>
                                    </div>
                                    <span id="mana-text">50/50</span>
                                </div>

                                <!-- Experience Bar -->
                                <div class="stat-bar">
                                    <label>⭐ Experience</label>
                                    <div class="bar exp-bar">
                                        <div id="exp-fill" class="bar-fill" style="width: 0%"></div>
                                    </div>
                                    <span id="exp-text">0/100</span>
                                </div>

                                <!-- Gold -->
                                <div class="gold-display">
                                    🪙 <span id="player-gold">50</span> Gold
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="quick-actions">
                                <h4>⚡ Quick Actions</h4>
                                <div class="action-buttons">
                                    <button class="rpg-btn small" onclick="window.rpgGame.openInventory()" title="Inventory">
                                        📦 Items
                                    </button>
                                    <button class="rpg-btn small" onclick="window.rpgGame.quest.openQuestLog()" title="Quests">
                                        📜 Quests
                                    </button>
                                    <button class="rpg-btn small" onclick="window.rpgGame.ui.showStatus()" title="Character">
                                        🧙‍♂️ Stats
                                    </button>
                                    <button class="rpg-btn small" onclick="window.rpgGame.saveGameData()" title="Save Game">
                                        💾 Save
                                    </button>
                                </div>
                            </div>

                            <!-- Active Quests -->
                            <div class="active-quests">
                                <h4>📜 Active Quests</h4>
                                <div id="quest-list" class="quest-list">
                                    <div class="quest-item">
                                        <div class="quest-name">Welcome to Adventure</div>
                                        <div class="quest-progress">Talk to Village Elder: 0/1</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Game Messages -->
                    <div id="message-area" class="message-area">
                        <div id="message-log" class="message-log"></div>
                    </div>
                </div>

                <!-- Combat Screen -->
                <div id="combat-screen" class="rpg-screen">
                    <div class="combat-layout">
                        <div class="combat-header">
                            <h2>⚔️ Combat</h2>
                            <div id="turn-indicator" class="turn-indicator">Your Turn</div>
                        </div>

                        <div class="combat-view">
                            <!-- Enemy Display -->
                            <div class="enemy-display">
                                <div id="enemy-sprite" class="enemy-sprite">👹</div>
                                <div id="enemy-name" class="enemy-name">Enemy</div>
                                <div class="enemy-health">
                                    <div class="bar enemy-health-bar">
                                        <div id="enemy-health-fill" class="bar-fill" style="width: 100%"></div>
                                    </div>
                                    <span id="enemy-health-text">100/100</span>
                                </div>
                            </div>

                            <!-- Player Combat Display -->
                            <div class="player-combat">
                                <div class="player-sprite">🧙‍♂️</div>
                                <div class="player-combat-stats">
                                    <div class="bar health-bar">
                                        <div id="combat-health-fill" class="bar-fill"></div>
                                    </div>
                                    <span id="combat-health-text">100/100</span>
                                    <div class="bar mana-bar">
                                        <div id="combat-mana-fill" class="bar-fill"></div>
                                    </div>
                                    <span id="combat-mana-text">50/50</span>
                                </div>
                            </div>
                        </div>

                        <!-- Combat Actions -->
                        <div class="combat-actions">
                            <h4>Choose your action:</h4>
                            <div class="action-grid">
                                <button class="combat-btn" onclick="window.rpgGame.combat.selectAction('attack')">
                                    ⚔️ Attack<br><small>Basic melee attack</small>
                                </button>
                                <button class="combat-btn" onclick="window.rpgGame.combat.selectAction('skill')">
                                    🔮 Skills<br><small>Use special abilities</small>
                                </button>
                                <button class="combat-btn" onclick="window.rpgGame.combat.selectAction('item')">
                                    📦 Items<br><small>Use consumables</small>
                                </button>
                                <button class="combat-btn" onclick="window.rpgGame.combat.selectAction('defend')">
                                    🛡️ Defend<br><small>Reduce incoming damage</small>
                                </button>
                            </div>
                            <div class="combat-controls">
                                <button class="rpg-btn secondary" onclick="window.rpgGame.combat.executePlayerAction()">
                                    ✨ Execute Action
                                </button>
                                <button class="rpg-btn" onclick="window.rpgGame.combat.attemptFlee()">
                                    🏃 Attempt to Flee
                                </button>
                            </div>
                        </div>

                        <!-- Combat Log -->
                        <div class="combat-log">
                            <h4>📋 Combat Log</h4>
                            <div id="combat-messages" class="combat-messages">
                                <div class="combat-message">Combat begins!</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inventory Screen -->
                <div id="inventory-screen" class="rpg-screen modal-screen">
                    <div class="modal-content inventory-modal">
                        <div class="modal-header">
                            <h3>📦 Inventory & Equipment</h3>
                            <button class="close-btn" onclick="window.rpgGame.closeInventory()">✕</button>
                        </div>
                        
                        <div class="inventory-layout">
                            <!-- Equipment Slots -->
                            <div class="equipment-panel">
                                <h4>⚔️ Equipment</h4>
                                <div class="equipment-slots">
                                    <div class="equipment-slot" data-slot="weapon">
                                        <div class="slot-label">Weapon</div>
                                        <div id="weapon-slot" class="slot-content empty">⚔️</div>
                                    </div>
                                    <div class="equipment-slot" data-slot="armor">
                                        <div class="slot-label">Armor</div>
                                        <div id="armor-slot" class="slot-content empty">👕</div>
                                    </div>
                                    <div class="equipment-slot" data-slot="accessory">
                                        <div class="slot-label">Accessory</div>
                                        <div id="accessory-slot" class="slot-content empty">💍</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Inventory Items -->
                            <div class="inventory-panel">
                                <h4>🎒 Items</h4>
                                <div class="inventory-filter">
                                    <select id="item-filter">
                                        <option value="all">All Items</option>
                                        <option value="weapons">Weapons</option>
                                        <option value="armor">Armor</option>
                                        <option value="consumables">Consumables</option>
                                        <option value="misc">Miscellaneous</option>
                                    </select>
                                </div>
                                <div id="inventory-grid" class="inventory-grid">
                                    <!-- Items will be populated here -->
                                </div>
                            </div>
                        </div>

                        <!-- Item Details -->
                        <div id="item-details" class="item-details">
                            <div class="item-info">
                                <h4 id="item-name">Select an item</h4>
                                <p id="item-description">Click on an item to see its details.</p>
                                <div id="item-stats" class="item-stats"></div>
                            </div>
                            <div class="item-actions">
                                <button id="use-item-btn" class="rpg-btn primary" style="display: none;">Use Item</button>
                                <button id="equip-item-btn" class="rpg-btn secondary" style="display: none;">Equip</button>
                                <button id="drop-item-btn" class="rpg-btn" style="display: none;">Drop</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating Messages -->
                <div id="floating-messages" class="floating-messages"></div>
            </div>
        `;

        // Add CSS styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('rpg-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'rpg-styles';
        styles.textContent = `
            .rpg-game {
                width: 100%;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            }

            .rpg-screen {
                display: none;
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }

            .rpg-screen.active {
                display: block;
            }

            /* Main Menu */
            .menu-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                padding: 2rem;
                text-align: center;
            }

            .rpg-title {
                font-size: 4rem;
                margin-bottom: 0.5rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                background: linear-gradient(45deg, #ffd700, #ff6b35);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .menu-subtitle {
                font-size: 1.2rem;
                color: #a0a0a0;
                margin-bottom: 3rem;
            }

            .menu-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 3rem;
            }

            .rpg-btn {
                padding: 1rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 250px;
                background: rgba(255,255,255,0.1);
                color: #ffffff;
                border: 2px solid rgba(255,255,255,0.2);
            }

            .rpg-btn:hover {
                background: rgba(255,255,255,0.2);
                border-color: rgba(255,255,255,0.4);
                transform: translateY(-2px);
            }

            .rpg-btn.primary {
                background: linear-gradient(45deg, #ff6b35, #f7931e);
                border-color: #ff6b35;
            }

            .rpg-btn.secondary {
                background: linear-gradient(45deg, #4facfe, #00f2fe);
                border-color: #4facfe;
            }

            .rpg-btn.small {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                min-width: auto;
            }

            /* Game Layout */
            .game-layout {
                display: grid;
                grid-template-columns: 2fr 1fr;
                height: calc(100vh - 100px);
                gap: 1rem;
                padding: 1rem;
            }

            .world-panel {
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
            }

            .world-header h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
                color: #ffd700;
            }

            .world-view {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                background: #222;
                border-radius: 8px;
                padding: 1rem;
                font-size: 1.5rem;
                max-width: 500px;
                max-height: 400px;
            }

            .world-tile {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                position: relative;
                transition: all 0.2s ease;
            }

            .world-tile.player {
                background: radial-gradient(circle, rgba(255,215,0,0.3), transparent);
                box-shadow: 0 0 15px rgba(255,215,0,0.5);
            }

            .info-panel {
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
                padding: 1.5rem;
                overflow-y: auto;
            }

            .character-status h4 {
                margin: 0 0 1rem 0;
                color: #ffd700;
            }

            .stat-bar {
                margin-bottom: 1rem;
            }

            .stat-bar label {
                display: block;
                margin-bottom: 0.3rem;
                font-weight: 600;
            }

            .bar {
                width: 100%;
                height: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }

            .bar-fill {
                height: 100%;
                border-radius: 10px;
                transition: width 0.5s ease;
            }

            .health-bar .bar-fill {
                background: linear-gradient(90deg, #ff4757, #ff6b35);
            }

            .mana-bar .bar-fill {
                background: linear-gradient(90deg, #4facfe, #00f2fe);
            }

            .exp-bar .bar-fill {
                background: linear-gradient(90deg, #ffd700, #ffb142);
            }

            .message-area {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 100px;
                background: rgba(0,0,0,0.8);
                padding: 1rem;
                overflow-y: auto;
            }

            .message-log {
                font-size: 0.9rem;
                line-height: 1.4;
            }

            /* Combat Screen */
            .combat-layout {
                padding: 2rem;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .combat-header {
                text-align: center;
            }

            .combat-view {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex: 1;
                max-height: 300px;
            }

            .enemy-display, .player-combat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            .enemy-sprite, .player-sprite {
                font-size: 6rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }

            .combat-actions {
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
                padding: 1.5rem;
            }

            .action-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin: 1rem 0;
            }

            .combat-btn {
                padding: 1rem;
                background: rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: white;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .combat-btn:hover {
                background: rgba(255,255,255,0.2);
                border-color: rgba(255,255,255,0.4);
                transform: translateY(-2px);
            }

            .combat-log {
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
                padding: 1rem;
                max-height: 200px;
                overflow-y: auto;
            }

            /* Modal Screens */
            .modal-screen {
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 16px;
                padding: 2rem;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }

            .inventory-modal {
                width: 800px;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .close-btn {
                background: none;
                border: none;
                color: #ffffff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
            }

            .inventory-layout {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .equipment-slots {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .equipment-slot {
                display: flex;
                align-items: center;
                gap: 1rem;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                padding: 1rem;
            }

            .slot-content {
                width: 50px;
                height: 50px;
                border: 2px dashed rgba(255,255,255,0.3);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .inventory-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 0.5rem;
                max-height: 300px;
                overflow-y: auto;
            }

            .inventory-item {
                aspect-ratio: 1;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                padding: 0.5rem;
            }

            .inventory-item:hover {
                background: rgba(255,255,255,0.2);
                border-color: rgba(255,255,255,0.4);
            }

            .inventory-item.selected {
                border-color: #ffd700;
                background: rgba(255,215,0,0.2);
            }

            .item-icon {
                font-size: 1.5rem;
                margin-bottom: 0.2rem;
            }

            .item-quantity {
                font-size: 0.8rem;
                color: #a0a0a0;
            }

            .floating-messages {
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 1000;
                pointer-events: none;
            }

            .floating-message {
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                margin-bottom: 0.5rem;
                animation: fadeInOut 3s ease-in-out;
                border-left: 4px solid #ffd700;
            }

            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(100px); }
                10%, 90% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100px); }
            }

            .game-description {
                max-width: 600px;
                text-align: left;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 2rem;
            }

            .game-description h3 {
                color: #ffd700;
                margin-bottom: 1rem;
            }

            .game-description ul {
                list-style: none;
                padding: 0;
                margin-bottom: 1.5rem;
            }

            .game-description li {
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .controls-info {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 8px;
                font-size: 0.9rem;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .game-layout {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr auto;
                }
                
                .world-view {
                    font-size: 1rem;
                }
                
                .inventory-modal {
                    width: 95vw;
                }
                
                .inventory-layout {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Inventory filter
        const filterSelect = document.getElementById('item-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.renderInventory();
            });
        }
    }

    showMainMenu() {
        this.setActiveScreen('menu');
    }

    showGame() {
        this.setActiveScreen('game');
        this.updateCharacterDisplay();
        this.updateWorldView();
    }

    showCombat(combat) {
        this.setActiveScreen('combat');
        this.currentCombat = combat;
        this.updateCombatDisplay();
    }

    showInventory() {
        this.setActiveScreen('inventory');
        this.renderInventory();
    }

    setActiveScreen(screenName) {
        const screens = document.querySelectorAll('.rpg-screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        const activeScreen = document.getElementById(`${screenName}-screen`);
        if (activeScreen) {
            activeScreen.classList.add('active');
        }
        
        this.currentScreen = screenName;
    }

    updateCharacterDisplay() {
        const player = this.game.getPlayer();
        
        // Update basic info
        document.getElementById('player-name').textContent = player.name;
        document.getElementById('player-level').textContent = player.level;
        document.getElementById('player-gold').textContent = player.gold;

        // Update health bar
        const healthPercent = (player.stats.health / player.stats.maxHealth) * 100;
        document.getElementById('health-fill').style.width = `${healthPercent}%`;
        document.getElementById('health-text').textContent = `${player.stats.health}/${player.stats.maxHealth}`;

        // Update mana bar
        const manaPercent = (player.stats.mana / player.stats.maxMana) * 100;
        document.getElementById('mana-fill').style.width = `${manaPercent}%`;
        document.getElementById('mana-text').textContent = `${player.stats.mana}/${player.stats.maxMana}`;

        // Update experience bar
        const expPercent = (player.experience / player.experienceToNext) * 100;
        document.getElementById('exp-fill').style.width = `${expPercent}%`;
        document.getElementById('exp-text').textContent = `${player.experience}/${player.experienceToNext}`;
    }

    updateWorldView() {
        const worldView = document.getElementById('world-view');
        if (!worldView || !this.game.world.currentScene) return;

        // Update scene info
        const scene = this.game.world.currentScene;
        document.getElementById('scene-name').textContent = scene.name;
        document.getElementById('scene-description').textContent = scene.description;

        // Render visible tiles
        const tiles = this.game.world.getVisibleTiles();
        const tileSymbols = WorldData.getTileSymbols();
        
        worldView.innerHTML = '';
        
        tiles.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'world-tile';
            
            if (tile.isPlayer) {
                tileElement.classList.add('player');
                tileElement.textContent = '🧙‍♂️';
            } else if (tile.npc) {
                tileElement.textContent = '👤';
                tileElement.title = tile.npc.name;
            } else if (tile.object) {
                tileElement.textContent = tileSymbols[tile.object.type] || '❓';
                tileElement.title = tile.object.name;
            } else {
                tileElement.textContent = tileSymbols[tile.tile] || tile.tile;
            }
            
            worldView.appendChild(tileElement);
        });
    }

    updateCombatDisplay() {
        if (!this.currentCombat) return;

        const state = this.currentCombat.getCombatState();
        
        // Update enemy display
        if (state.enemy) {
            document.getElementById('enemy-name').textContent = state.enemy.name;
            
            const enemyHealthPercent = (state.enemy.health / state.enemy.maxHealth) * 100;
            document.getElementById('enemy-health-fill').style.width = `${enemyHealthPercent}%`;
            document.getElementById('enemy-health-text').textContent = 
                `${state.enemy.health}/${state.enemy.maxHealth}`;
        }

        // Update player combat display
        const playerHealthPercent = (state.player.health / state.player.maxHealth) * 100;
        document.getElementById('combat-health-fill').style.width = `${playerHealthPercent}%`;
        document.getElementById('combat-health-text').textContent = 
            `${state.player.health}/${state.player.maxHealth}`;

        const playerManaPercent = (state.player.mana / state.player.maxMana) * 100;
        document.getElementById('combat-mana-fill').style.width = `${playerManaPercent}%`;
        document.getElementById('combat-mana-text').textContent = 
            `${state.player.mana}/${state.player.maxMana}`;

        // Update turn indicator
        const turnText = state.currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn';
        document.getElementById('turn-indicator').textContent = turnText;

        // Update combat log
        const messagesContainer = document.getElementById('combat-messages');
        messagesContainer.innerHTML = '';
        
        state.combatLog.forEach(log => {
            const messageElement = document.createElement('div');
            messageElement.className = 'combat-message';
            messageElement.textContent = log.message;
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    renderInventory() {
        const player = this.game.getPlayer();
        const inventory = player.inventory;
        const filter = document.getElementById('item-filter')?.value || 'all';
        
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;

        const filteredItems = inventory.getItemsByCategory(filter);
        
        inventoryGrid.innerHTML = '';
        
        filteredItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerHTML = `
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-name" style="font-size: 0.8rem; text-align: center;">${item.name}</div>
                ${item.quantity > 1 ? `<div class="item-quantity">x${item.quantity}</div>` : ''}
            `;
            
            itemElement.addEventListener('click', () => {
                this.selectInventoryItem(item);
            });
            
            inventoryGrid.appendChild(itemElement);
        });

        // Update equipment display
        this.updateEquipmentDisplay();
    }

    selectInventoryItem(item) {
        // Remove previous selection
        document.querySelectorAll('.inventory-item').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked item
        event.currentTarget.classList.add('selected');
        
        // Update item details
        document.getElementById('item-name').textContent = item.name;
        document.getElementById('item-description').textContent = item.description;
        
        // Show appropriate action buttons
        const useBtn = document.getElementById('use-item-btn');
        const equipBtn = document.getElementById('equip-item-btn');
        const dropBtn = document.getElementById('drop-item-btn');
        
        useBtn.style.display = item.usable ? 'inline-block' : 'none';
        equipBtn.style.display = item.equipSlot ? 'inline-block' : 'none';
        dropBtn.style.display = 'inline-block';
        
        // Set up button handlers
        useBtn.onclick = () => this.useItem(item);
        equipBtn.onclick = () => this.equipItem(item);
        dropBtn.onclick = () => this.dropItem(item);
    }

    useItem(item) {
        const player = this.game.getPlayer();
        const success = player.inventory.useItem(item.id, player);
        
        if (success) {
            this.showMessage(`Used ${item.name}!`);
            this.renderInventory();
            this.updateCharacterDisplay();
        } else {
            this.showMessage(`Cannot use ${item.name} right now.`);
        }
    }

    equipItem(item) {
        const player = this.game.getPlayer();
        const equipManager = new EquipmentManager(player);
        
        const success = equipManager.equip(item);
        
        if (success) {
            this.showMessage(`Equipped ${item.name}!`);
            this.renderInventory();
            this.updateCharacterDisplay();
        } else {
            this.showMessage(`Cannot equip ${item.name}!`);
        }
    }

    dropItem(item) {
        const player = this.game.getPlayer();
        const success = player.inventory.removeItem(item.id, 1);
        
        if (success) {
            this.showMessage(`Dropped ${item.name}.`);
            this.renderInventory();
        }
    }

    updateEquipmentDisplay() {
        const player = this.game.getPlayer();
        const equipment = player.equipment;
        
        // Update equipment slots
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const slotElement = document.getElementById(`${slot}-slot`);
            if (slotElement) {
                const equippedItem = equipment[slot];
                if (equippedItem) {
                    slotElement.textContent = equippedItem.icon || equippedItem.name[0];
                    slotElement.classList.remove('empty');
                    slotElement.title = equippedItem.name;
                } else {
                    slotElement.textContent = slot === 'weapon' ? '⚔️' : slot === 'armor' ? '👕' : '💍';
                    slotElement.classList.add('empty');
                    slotElement.title = `No ${slot} equipped`;
                }
            }
        });
    }

    showMessage(message, duration = 2000) {
        // Add to message log
        const messageLog = document.getElementById('message-log');
        if (messageLog) {
            const messageElement = document.createElement('div');
            messageElement.textContent = `> ${message}`;
            messageLog.appendChild(messageElement);
            messageLog.scrollTop = messageLog.scrollHeight;
            
            // Keep log reasonable size
            if (messageLog.children.length > 50) {
                messageLog.removeChild(messageLog.firstChild);
            }
        }

        // Show floating message
        const floatingMessages = document.getElementById('floating-messages');
        if (floatingMessages) {
            const floatingMessage = document.createElement('div');
            floatingMessage.className = 'floating-message';
            floatingMessage.textContent = message;
            floatingMessages.appendChild(floatingMessage);
            
            setTimeout(() => {
                if (floatingMessage.parentNode) {
                    floatingMessage.parentNode.removeChild(floatingMessage);
                }
            }, duration);
        }
    }

    showStatus() {
        const player = this.game.getPlayer();
        const stats = player.stats;
        
        const statusInfo = `
📊 Character Stats:
❤️ Health: ${stats.health}/${stats.maxHealth}
💙 Mana: ${stats.mana}/${stats.maxMana}
⚔️ Attack: ${player.getAttack()}
🛡️ Defense: ${player.getDefense()}
⚡ Agility: ${stats.agility}
🧠 Intelligence: ${stats.intelligence}
🪙 Gold: ${player.gold}
⭐ Level: ${player.level} (${player.experience}/${player.experienceToNext} XP)
        `.trim();
        
        this.showMessage(statusInfo, 5000);
    }

    renderGame() {
        this.updateCharacterDisplay();
        this.updateWorldView();
    }

    renderCombat() {
        this.updateCombatDisplay();
    }

    renderInventory() {
        // Already implemented above
    }
}

// Export class
window.RPGInterface = RPGInterface;