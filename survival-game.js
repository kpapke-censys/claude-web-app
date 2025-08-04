// Alien Survival Game Mode
class SurvivalGame {
    constructor(sharedSystems) {
        this.sharedSystems = sharedSystems;
        this.gameState = {
            player: {
                health: 100,
                maxHealth: 100,
                oxygen: 100,
                maxOxygen: 100,
                energy: 100,
                maxEnergy: 100,
                temperature: 20,
                position: { x: 0, y: 0 }
            },
            world: {
                day: 1,
                timeOfDay: 8, // 0-23 hours
                weather: 'clear',
                temperature: 15
            },
            inventory: {
                wood: 0,
                stone: 0,
                metal: 0,
                food: 10,
                water: 10,
                oxygen_tank: 3,
                scrap: 5,
                crystal: 0,
                alien_tech: 0
            },
            crafting: {
                recipes: {},
                queue: []
            },
            base: {
                structures: {},
                power: 0,
                maxPower: 0,
                defenses: 0
            },
            technology: {
                researched: {},
                points: 0
            },
            quests: {
                active: [],
                completed: []
            },
            stats: {
                daysSurvived: 0,
                itemsCrafted: 0,
                aliensDefeated: 0,
                distanceExplored: 0
            },
            lastSave: Date.now(),
            gameStarted: Date.now()
        };

        this.gameData = this.initializeGameData();
        this.updateInterval = null;
        this.saveInterval = null;
        this.worldEvents = [];
        
        this.init();
    }

    init() {
        this.setupUI();
        this.initializeQuests();
        this.startGameLoop();
        this.renderAll();
        this.showCrashLandingIntro();
    }

    initializeGameData() {
        return {
            resources: {
                wood: { name: 'Wood', icon: '🪵', description: 'Basic building material from alien trees' },
                stone: { name: 'Stone', icon: '🪨', description: 'Sturdy material for construction' },
                metal: { name: 'Metal', icon: '🔩', description: 'Salvaged from your crashed ship' },
                food: { name: 'Food', icon: '🍎', description: 'Sustenance to maintain energy' },
                water: { name: 'Water', icon: '💧', description: 'Essential for survival' },
                oxygen_tank: { name: 'Oxygen', icon: '🫁', description: 'Breathable air in hostile environment' },
                scrap: { name: 'Scrap', icon: '⚙️', description: 'Electronic components from wreckage' },
                crystal: { name: 'Energy Crystal', icon: '💎', description: 'Alien power source' },
                alien_tech: { name: 'Alien Tech', icon: '👽', description: 'Advanced alien technology' }
            },
            
            crafting: {
                basic_shelter: {
                    name: 'Basic Shelter',
                    icon: '🏠',
                    description: 'Protection from the elements',
                    cost: { wood: 10, stone: 5 },
                    category: 'shelter',
                    unlocked: true
                },
                oxygen_generator: {
                    name: 'Oxygen Generator',
                    icon: '🌬️',
                    description: 'Generates oxygen from alien atmosphere',
                    cost: { metal: 8, scrap: 5, crystal: 1 },
                    category: 'life_support',
                    unlocked: false
                },
                water_purifier: {
                    name: 'Water Purifier',
                    icon: '🔧',
                    description: 'Purifies alien water for consumption',
                    cost: { metal: 5, scrap: 3 },
                    category: 'life_support',
                    unlocked: false
                },
                solar_panel: {
                    name: 'Solar Panel',
                    icon: '☀️',
                    description: 'Harnesses alien sun for power',
                    cost: { metal: 12, scrap: 8, crystal: 2 },
                    category: 'power',
                    unlocked: false
                },
                communication_array: {
                    name: 'Communication Array',
                    icon: '📡',
                    description: 'Send distress signal to space',
                    cost: { metal: 20, scrap: 15, alien_tech: 3, crystal: 5 },
                    category: 'escape',
                    unlocked: false
                },
                escape_pod: {
                    name: 'Escape Pod',
                    icon: '🚀',
                    description: 'Your ticket off this alien world',
                    cost: { metal: 50, scrap: 30, alien_tech: 10, crystal: 15 },
                    category: 'escape',
                    unlocked: false
                }
            },

            exploration: {
                crash_site: {
                    name: 'Crash Site',
                    icon: '💥',
                    description: 'Your ship wreckage',
                    resources: { metal: 20, scrap: 15 },
                    danger: 0,
                    explored: true
                },
                alien_forest: {
                    name: 'Alien Forest',
                    icon: '🌲',
                    description: 'Strange purple trees with useful wood',
                    resources: { wood: 30, food: 10 },
                    danger: 2,
                    explored: false
                },
                crystal_caves: {
                    name: 'Crystal Caves',
                    icon: '🔮',
                    description: 'Glowing caves filled with energy crystals',
                    resources: { crystal: 15, stone: 25 },
                    danger: 4,
                    explored: false
                },
                alien_ruins: {
                    name: 'Alien Ruins',
                    icon: '🏛️',
                    description: 'Ancient alien civilization remains',
                    resources: { alien_tech: 8, crystal: 5 },
                    danger: 5,
                    explored: false
                },
                underground_lake: {
                    name: 'Underground Lake',
                    icon: '🌊',
                    description: 'Source of pure water',
                    resources: { water: 50 },
                    danger: 3,
                    explored: false
                }
            },

            technology: {
                basic_tools: {
                    name: 'Basic Tools',
                    icon: '🔨',
                    description: 'Improves resource gathering efficiency',
                    cost: 10,
                    effect: 'gathering_efficiency',
                    unlocked: true
                },
                advanced_scanning: {
                    name: 'Advanced Scanning',
                    icon: '📊',
                    description: 'Reveals more exploration sites',
                    cost: 25,
                    effect: 'exploration_range',
                    unlocked: false
                },
                alien_language: {
                    name: 'Alien Language',
                    icon: '👽',
                    description: 'Understand alien technology better',
                    cost: 40,
                    effect: 'tech_efficiency',
                    unlocked: false
                },
                atmospheric_adaptation: {
                    name: 'Atmospheric Adaptation',
                    icon: '🫁',
                    description: 'Reduces oxygen consumption',
                    cost: 35,
                    effect: 'oxygen_efficiency',
                    unlocked: false
                }
            }
        };
    }

    setupUI() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.innerHTML = `
            <header class="survival-header">
                <button class="btn btn-secondary menu-btn back-to-dashboard" onclick="
                    if (window.SharedComponents) {
                        const sharedComponents = new SharedComponents();
                        sharedComponents.togglePauseMenu();
                    } else {
                        window.gameManager.gameMenu.returnToDashboard();
                    }
                ">
                    🏠 Menu
                </button>
                <div class="survival-stats">
                    <div class="vital-signs">
                        <div class="vital health">
                            <span class="vital-icon">❤️</span>
                            <div class="vital-bar">
                                <div class="vital-fill" id="healthBar"></div>
                            </div>
                            <span id="healthText">100/100</span>
                        </div>
                        <div class="vital oxygen">
                            <span class="vital-icon">🫁</span>
                            <div class="vital-bar">
                                <div class="vital-fill" id="oxygenBar"></div>
                            </div>
                            <span id="oxygenText">100/100</span>
                        </div>
                        <div class="vital energy">
                            <span class="vital-icon">⚡</span>
                            <div class="vital-bar">
                                <div class="vital-fill" id="energyBar"></div>
                            </div>
                            <span id="energyText">100/100</span>
                        </div>
                    </div>
                    <div class="world-info">
                        <div class="time-display">
                            <span id="dayCounter">Day 1</span>
                            <span id="timeDisplay">08:00</span>
                        </div>
                        <div class="weather-display">
                            <span id="weatherIcon">☀️</span>
                            <span id="temperatureDisplay">15°C</span>
                        </div>
                    </div>
                </div>
            </header>

            <main class="survival-main">
                <div class="survival-tabs">
                    <button class="tab-btn active" data-tab="explore">🗺️ Explore</button>
                    <button class="tab-btn" data-tab="craft">🔨 Craft</button>
                    <button class="tab-btn" data-tab="base">🏠 Base</button>
                    <button class="tab-btn" data-tab="tech">🔬 Research</button>
                    <button class="tab-btn" data-tab="inventory">🎒 Inventory</button>
                </div>

                <div class="tab-content active" id="explore-tab">
                    <div class="exploration-area" id="explorationArea">
                        <!-- Exploration content -->
                    </div>
                </div>

                <div class="tab-content" id="craft-tab">
                    <div class="crafting-area" id="craftingArea">
                        <!-- Crafting content -->
                    </div>
                </div>

                <div class="tab-content" id="base-tab">
                    <div class="base-area" id="baseArea">
                        <!-- Base building content -->
                    </div>
                </div>

                <div class="tab-content" id="tech-tab">
                    <div class="research-area" id="researchArea">
                        <!-- Research content -->
                    </div>
                </div>

                <div class="tab-content" id="inventory-tab">
                    <div class="inventory-area" id="inventoryArea">
                        <!-- Inventory content -->
                    </div>
                </div>
            </main>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Render tab content
        this[`render${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`]();
    }

    renderExplore() {
        const area = document.getElementById('explorationArea');
        area.innerHTML = `
            <div class="exploration-header">
                <h3>🗺️ Planetary Exploration</h3>
                <p>Venture out to gather resources and discover alien secrets</p>
            </div>
            <div class="exploration-grid">
                ${Object.entries(this.gameData.exploration).map(([id, location]) => `
                    <div class="location-card ${location.explored ? 'explored' : ''}" data-location="${id}">
                        <div class="location-header">
                            <div class="location-icon">${location.icon}</div>
                            <div class="location-info">
                                <h4>${location.name}</h4>
                                <p>${location.description}</p>
                            </div>
                            ${location.explored ? '<div class="explored-badge">✅</div>' : ''}
                        </div>
                        <div class="location-resources">
                            <h5>Available Resources:</h5>
                            <div class="resource-list">
                                ${Object.entries(location.resources).map(([resource, amount]) => `
                                    <span class="resource-tag">
                                        ${this.gameData.resources[resource]?.icon || '❓'} ${amount}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="location-danger">
                            <span class="danger-label">Danger:</span>
                            <div class="danger-meter">
                                ${'🔴'.repeat(location.danger)}${'⚪'.repeat(5 - location.danger)}
                            </div>
                        </div>
                        <div class="location-actions">
                            <button class="btn btn-primary explore-btn" data-location="${id}" ${!location.explored && location.danger > 2 ? 'disabled' : ''}>
                                ${location.explored ? '🔄 Re-explore' : '🚀 Explore'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add explore button events
        document.querySelectorAll('.explore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const locationId = e.target.dataset.location;
                this.exploreLocation(locationId);
            });
        });
    }

    renderCraft() {
        const area = document.getElementById('craftingArea');
        const categories = ['shelter', 'life_support', 'power', 'escape'];
        
        area.innerHTML = `
            <div class="crafting-header">
                <h3>🔨 Crafting & Construction</h3>
                <p>Build essential equipment for survival and escape</p>
            </div>
            ${categories.map(category => `
                <div class="crafting-category">
                    <h4>${category.replace('_', ' ').toUpperCase()}</h4>
                    <div class="crafting-grid">
                        ${Object.entries(this.gameData.crafting)
                            .filter(([id, item]) => item.category === category)
                            .map(([id, item]) => `
                                <div class="craft-card ${!item.unlocked ? 'locked' : ''}">
                                    <div class="craft-header">
                                        <div class="craft-icon">${item.icon}</div>
                                        <div class="craft-info">
                                            <h5>${item.name}</h5>
                                            <p>${item.description}</p>
                                        </div>
                                    </div>
                                    <div class="craft-cost">
                                        <h6>Required:</h6>
                                        <div class="cost-list">
                                            ${Object.entries(item.cost).map(([resource, amount]) => {
                                                const owned = this.gameState.inventory[resource] || 0;
                                                const hasEnough = owned >= amount;
                                                return `
                                                    <span class="cost-item ${hasEnough ? 'affordable' : 'expensive'}">
                                                        ${this.gameData.resources[resource]?.icon || '❓'} 
                                                        ${amount} (${owned})
                                                    </span>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                    <div class="craft-actions">
                                        <button class="btn btn-primary craft-btn" data-item="${id}" 
                                            ${!item.unlocked || !this.canCraft(item) ? 'disabled' : ''}>
                                            ${!item.unlocked ? '🔒 Locked' : '🔨 Craft'}
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            `).join('')}
        `;

        // Add craft button events
        document.querySelectorAll('.craft-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.item;
                this.craftItem(itemId);
            });
        });
    }

    renderBase() {
        const area = document.getElementById('baseArea');
        area.innerHTML = `
            <div class="base-header">
                <h3>🏠 Base Status</h3>
                <p>Your survival outpost on the alien world</p>
            </div>
            <div class="base-stats">
                <div class="base-stat">
                    <span class="stat-icon">⚡</span>
                    <span class="stat-label">Power:</span>
                    <span class="stat-value">${this.gameState.base.power}/${this.gameState.base.maxPower}</span>
                </div>
                <div class="base-stat">
                    <span class="stat-icon">🛡️</span>
                    <span class="stat-label">Defenses:</span>
                    <span class="stat-value">${this.gameState.base.defenses}</span>
                </div>
            </div>
            <div class="base-structures">
                <h4>Built Structures</h4>
                <div class="structures-grid">
                    ${Object.keys(this.gameState.base.structures).length === 0 ? 
                        '<p class="no-structures">No structures built yet. Start crafting!</p>' :
                        Object.entries(this.gameState.base.structures).map(([id, structure]) => `
                            <div class="structure-card">
                                <div class="structure-icon">${structure.icon}</div>
                                <div class="structure-info">
                                    <h5>${structure.name}</h5>
                                    <p>Status: ${structure.active ? '🟢 Active' : '🔴 Inactive'}</p>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    renderTech() {
        const area = document.getElementById('researchArea');
        area.innerHTML = `
            <div class="research-header">
                <h3>🔬 Technology Research</h3>
                <p>Research Points: ${this.gameState.technology.points}</p>
            </div>
            <div class="research-grid">
                ${Object.entries(this.gameData.technology).map(([id, tech]) => {
                    const researched = this.gameState.technology.researched[id];
                    const canResearch = this.gameState.technology.points >= tech.cost;
                    
                    return `
                        <div class="research-card ${researched ? 'researched' : ''}">
                            <div class="research-header">
                                <div class="research-icon">${tech.icon}</div>
                                <div class="research-info">
                                    <h5>${tech.name}</h5>
                                    <p>${tech.description}</p>
                                </div>
                                ${researched ? '<div class="researched-badge">✅</div>' : ''}
                            </div>
                            <div class="research-cost">
                                <span class="cost-label">Cost:</span>
                                <span class="cost-value">${tech.cost} RP</span>
                            </div>
                            <div class="research-actions">
                                <button class="btn btn-primary research-btn" data-tech="${id}" 
                                    ${researched || !canResearch ? 'disabled' : ''}>
                                    ${researched ? '✅ Researched' : canResearch ? '🔬 Research' : '❌ Not enough RP'}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Add research button events
        document.querySelectorAll('.research-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const techId = e.target.dataset.tech;
                this.researchTech(techId);
            });
        });
    }

    renderInventory() {
        const area = document.getElementById('inventoryArea');
        area.innerHTML = `
            <div class="inventory-header">
                <h3>🎒 Inventory</h3>
                <p>Resources and items you've collected</p>
            </div>
            <div class="inventory-grid">
                ${Object.entries(this.gameState.inventory).map(([resource, amount]) => {
                    const resourceData = this.gameData.resources[resource];
                    return `
                        <div class="inventory-item">
                            <div class="item-icon">${resourceData?.icon || '❓'}</div>
                            <div class="item-info">
                                <h5>${resourceData?.name || resource}</h5>
                                <p class="item-amount">Amount: ${amount}</p>
                                <p class="item-desc">${resourceData?.description || 'Unknown item'}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Game Actions
    exploreLocation(locationId) {
        const location = this.gameData.exploration[locationId];
        if (!location) return;

        // Energy cost for exploration
        const energyCost = location.danger * 5 + 10;
        if (this.gameState.player.energy < energyCost) {
            this.showMessage('Not enough energy to explore!', 'error');
            return;
        }

        this.gameState.player.energy -= energyCost;
        location.explored = true;

        // Collect resources
        const bonusMultiplier = this.gameState.technology.researched.basic_tools ? 1.5 : 1;
        Object.entries(location.resources).forEach(([resource, baseAmount]) => {
            const amount = Math.floor(baseAmount * bonusMultiplier * (0.8 + Math.random() * 0.4));
            this.gameState.inventory[resource] = (this.gameState.inventory[resource] || 0) + amount;
        });

        // Gain research points
        this.gameState.technology.points += location.danger * 2 + 3;

        // Update stats
        this.gameState.stats.distanceExplored += 100 + location.danger * 50;

        this.showMessage(`Explored ${location.name}! Found resources and gained knowledge.`, 'success');
        this.renderExplore();
        this.updateUI();
    }

    canCraft(item) {
        return Object.entries(item.cost).every(([resource, amount]) => 
            (this.gameState.inventory[resource] || 0) >= amount
        );
    }

    craftItem(itemId) {
        const item = this.gameData.crafting[itemId];
        if (!item || !this.canCraft(item)) return;

        // Deduct resources
        Object.entries(item.cost).forEach(([resource, amount]) => {
            this.gameState.inventory[resource] -= amount;
        });

        // Add to base
        this.gameState.base.structures[itemId] = {
            name: item.name,
            icon: item.icon,
            active: true,
            builtAt: Date.now()
        };

        // Apply effects
        if (item.category === 'power') {
            this.gameState.base.power += 10;
            this.gameState.base.maxPower += 10;
        }

        this.gameState.stats.itemsCrafted++;
        this.showMessage(`Crafted ${item.name}!`, 'success');
        
        // Check for escape condition
        if (itemId === 'escape_pod') {
            this.triggerEscape();
        }

        this.renderCraft();
        this.renderBase();
        this.updateUI();
    }

    researchTech(techId) {
        const tech = this.gameData.technology[techId];
        if (!tech || this.gameState.technology.points < tech.cost) return;

        this.gameState.technology.points -= tech.cost;
        this.gameState.technology.researched[techId] = true;

        // Unlock crafting recipes based on research
        if (techId === 'basic_tools') {
            this.gameData.crafting.water_purifier.unlocked = true;
        } else if (techId === 'advanced_scanning') {
            this.gameData.crafting.oxygen_generator.unlocked = true;
            this.gameData.crafting.solar_panel.unlocked = true;
        } else if (techId === 'alien_language') {
            this.gameData.crafting.communication_array.unlocked = true;
            this.gameData.crafting.escape_pod.unlocked = true;
        }

        this.showMessage(`Researched ${tech.name}!`, 'success');
        this.renderTech();
        this.renderCraft();
    }

    // Game Systems
    startGameLoop() {
        this.updateInterval = setInterval(() => {
            this.updateWorld();
            this.updatePlayer();
            this.updateUI();
        }, 2000); // Update every 2 seconds

        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, 10000); // Save every 10 seconds
    }

    updateWorld() {
        // Advance time
        this.gameState.world.timeOfDay += 0.5;
        if (this.gameState.world.timeOfDay >= 24) {
            this.gameState.world.timeOfDay = 0;
            this.gameState.world.day++;
            this.gameState.stats.daysSurvived++;
        }

        // Random weather changes
        if (Math.random() < 0.1) {
            const weathers = ['clear', 'cloudy', 'storm', 'toxic_rain'];
            this.gameState.world.weather = weathers[Math.floor(Math.random() * weathers.length)];
        }
    }

    updatePlayer() {
        // Consume oxygen slowly
        const oxygenRate = this.gameState.technology.researched.atmospheric_adaptation ? 0.3 : 0.5;
        this.gameState.player.oxygen = Math.max(0, this.gameState.player.oxygen - oxygenRate);

        // Consume energy
        this.gameState.player.energy = Math.max(0, this.gameState.player.energy - 0.2);

        // Regenerate health if well-fed
        if (this.gameState.inventory.food > 0 && this.gameState.player.health < this.gameState.player.maxHealth) {
            this.gameState.player.health = Math.min(this.gameState.player.maxHealth, this.gameState.player.health + 0.5);
        }

        // Consume food and water
        if (this.gameState.world.timeOfDay % 6 === 0) { // Every 6 hours
            this.gameState.inventory.food = Math.max(0, this.gameState.inventory.food - 1);
            this.gameState.inventory.water = Math.max(0, this.gameState.inventory.water - 1);
        }

        // Check survival conditions
        if (this.gameState.player.oxygen <= 0) {
            this.gameState.player.health -= 2;
        }
        if (this.gameState.inventory.food <= 0) {
            this.gameState.player.energy -= 1;
        }

        // Game over condition
        if (this.gameState.player.health <= 0) {
            this.triggerGameOver();
        }
    }

    updateUI() {
        // Update vital signs
        const healthPercent = (this.gameState.player.health / this.gameState.player.maxHealth) * 100;
        const oxygenPercent = (this.gameState.player.oxygen / this.gameState.player.maxOxygen) * 100;
        const energyPercent = (this.gameState.player.energy / this.gameState.player.maxEnergy) * 100;

        document.getElementById('healthBar').style.width = healthPercent + '%';
        document.getElementById('oxygenBar').style.width = oxygenPercent + '%';
        document.getElementById('energyBar').style.width = energyPercent + '%';

        document.getElementById('healthText').textContent = `${Math.floor(this.gameState.player.health)}/${this.gameState.player.maxHealth}`;
        document.getElementById('oxygenText').textContent = `${Math.floor(this.gameState.player.oxygen)}/${this.gameState.player.maxOxygen}`;
        document.getElementById('energyText').textContent = `${Math.floor(this.gameState.player.energy)}/${this.gameState.player.maxEnergy}`;

        // Update world info
        document.getElementById('dayCounter').textContent = `Day ${this.gameState.world.day}`;
        document.getElementById('timeDisplay').textContent = String(Math.floor(this.gameState.world.timeOfDay)).padStart(2, '0') + ':00';
        
        const weatherIcons = { clear: '☀️', cloudy: '☁️', storm: '⛈️', toxic_rain: '☢️' };
        document.getElementById('weatherIcon').textContent = weatherIcons[this.gameState.world.weather] || '☀️';
        document.getElementById('temperatureDisplay').textContent = `${this.gameState.world.temperature}°C`;
    }

    renderAll() {
        this.renderExplore();
        this.updateUI();
    }

    // Story Elements
    showCrashLandingIntro() {
        this.showMessage(`
            🚀 CRASH LANDING! 🚀
            
            Your ship has crashed on an alien planet. The atmosphere is hostile, resources are scarce, and unknown dangers lurk in the alien landscape.
            
            Your mission: Survive, adapt, and find a way to escape this world.
            
            Start by exploring the crash site to salvage materials from your ship!
        `, 'story', 8000);
    }

    initializeQuests() {
        const quests = [
            {
                id: 'first_exploration',
                title: 'Salvage Operation',
                description: 'Explore the crash site to salvage materials',
                objectives: [{ id: 'explore_crash', target: 1 }]
            },
            {
                id: 'build_shelter',
                title: 'Shelter from the Storm',
                description: 'Build a basic shelter for protection',
                objectives: [{ id: 'craft_shelter', target: 1 }]
            }
        ];

        // Add quests using shared system
        quests.forEach(quest => {
            this.sharedSystems.quests.createQuest(quest.id, quest);
            this.sharedSystems.quests.startQuest(quest.id, 'player');
        });
    }

    triggerEscape() {
        this.showMessage(`
            🎉 ESCAPE SUCCESSFUL! 🎉
            
            You've built an escape pod and successfully left the alien planet!
            
            Days survived: ${this.gameState.stats.daysSurvived}
            Items crafted: ${this.gameState.stats.itemsCrafted}
            Distance explored: ${this.gameState.stats.distanceExplored}m
            
            You are a true survivor!
        `, 'victory', 10000);

        // Unlock achievement
        if (window.gameManager) {
            window.gameManager.unlockAchievement('alien_survivor', 'survivalMode');
        }
    }

    triggerGameOver() {
        this.showMessage(`
            💀 GAME OVER 💀
            
            You couldn't survive the harsh alien environment.
            
            Days survived: ${this.gameState.stats.daysSurvived}
            
            Better luck next time, explorer!
        `, 'gameover', 10000);
    }

    showMessage(text, type = 'info', duration = 4000) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `survival-message survival-message-${type}`;
        
        // Add close button for story/intro messages or longer messages
        const showCloseButton = type === 'story' || duration >= 6000;
        const closeButtonHtml = showCloseButton ? 
            '<button class="message-close-btn" onclick="this.parentElement.remove()" title="Close">&times;</button>' : '';
        
        messageDiv.innerHTML = `
            ${closeButtonHtml}
            <div class="message-content">
                ${text.replace(/\n/g, '<br>')}
            </div>
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, duration);
    }

    // Save/Load System
    saveGame() {
        this.gameState.lastSave = Date.now();
        if (window.gameManager) {
            window.gameManager.userSystem.saveGameData('survivalMode', this.gameState);
        }
    }

    loadGameState(savedState) {
        if (savedState) {
            this.gameState = { ...this.gameState, ...savedState };
            this.renderAll();
        }
    }

    getGameState() {
        return this.gameState;
    }
}

// Export for use by game manager
window.SurvivalGame = SurvivalGame;