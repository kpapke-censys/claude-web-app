// Base Commander Strategy Game Mode
class StrategyGame {
    constructor(sharedSystems) {
        this.sharedSystems = sharedSystems;
        this.gameState = {
            player: {
                name: 'Commander',
                level: 1,
                experience: 0,
                reputation: 100
            },
            base: {
                mainBase: {
                    id: 'main',
                    name: 'Main Base',
                    position: { x: 250, y: 250 },
                    health: 100,
                    maxHealth: 100,
                    level: 1,
                    buildings: {
                        command_center: 1,
                        power_plant: 1,
                        barracks: 0,
                        factory: 0,
                        research_lab: 0,
                        defense_turret: 0
                    },
                    defenses: 10
                }
            },
            resources: {
                energy: 100,
                minerals: 50,
                alloy: 0,
                intel: 0
            },
            units: {
                scout: 0,
                trader: 0,
                defender: 0,
                warrior: 0
            },
            missions: {
                active: [],
                completed: []
            },
            combat: {
                battlesWon: 0,
                battlesLost: 0,
                enemiesDefeated: 0
            },
            world: {
                discovered: ['main_base'],
                locations: {},
                threats: []
            },
            research: {
                completed: {},
                inProgress: null,
                points: 0
            },
            stats: {
                totalUnitsBuilt: 0,
                totalBuildingsBuilt: 1,
                totalResourcesGathered: 0,
                timePlayed: 0
            },
            lastSave: Date.now(),
            gameStarted: Date.now()
        };

        this.gameData = this.initializeGameData();
        this.updateInterval = null;
        this.saveInterval = null;
        this.selectedUnits = [];
        this.gameMap = this.initializeMap();
        
        this.init();
    }

    init() {
        this.setupUI();
        this.initializeWorld();
        this.startGameLoop();
        this.renderAll();
        this.showCommanderIntro();
    }

    initializeGameData() {
        return {
            buildings: {
                command_center: {
                    name: 'Command Center',
                    icon: '🏛️',
                    description: 'Central hub for base operations',
                    cost: { energy: 0, minerals: 0 },
                    produces: { intel: 1 },
                    unlocked: true,
                    maxLevel: 5
                },
                power_plant: {
                    name: 'Power Plant',
                    icon: '⚡',
                    description: 'Generates energy for base operations',
                    cost: { energy: 0, minerals: 20 },
                    produces: { energy: 5 },
                    unlocked: true,
                    maxLevel: 10
                },
                barracks: {
                    name: 'Barracks',
                    icon: '🏗️',
                    description: 'Train military units',
                    cost: { energy: 30, minerals: 40 },
                    produces: {},
                    unlocked: true,
                    maxLevel: 5
                },
                factory: {
                    name: 'Factory',
                    icon: '🏭',
                    description: 'Produces advanced materials',
                    cost: { energy: 50, minerals: 60 },
                    produces: { alloy: 2 },
                    unlocked: false,
                    maxLevel: 5
                },
                research_lab: {
                    name: 'Research Lab',
                    icon: '🔬',
                    description: 'Conducts technological research',
                    cost: { energy: 40, minerals: 50 },
                    produces: { intel: 3 },
                    unlocked: false,
                    maxLevel: 5
                },
                defense_turret: {
                    name: 'Defense Turret',
                    icon: '🗼',
                    description: 'Automated base defense',
                    cost: { energy: 25, minerals: 35, alloy: 10 },
                    produces: {},
                    unlocked: false,
                    maxLevel: 8
                }
            },

            units: {
                scout: {
                    name: 'Scout',
                    icon: '🔍',
                    description: 'Fast reconnaissance unit',
                    cost: { energy: 15, minerals: 10 },
                    stats: { health: 30, speed: 8, attack: 5, defense: 2 },
                    abilities: ['explore', 'stealth'],
                    unlocked: true,
                    buildTime: 30
                },
                trader: {
                    name: 'Trader',
                    icon: '💼',
                    description: 'Gathers resources from distant locations',
                    cost: { energy: 20, minerals: 15 },
                    stats: { health: 40, speed: 5, attack: 2, defense: 3 },
                    abilities: ['trade', 'transport'],
                    unlocked: true,
                    buildTime: 45
                },
                defender: {
                    name: 'Defender',
                    icon: '🛡️',
                    description: 'Heavy defensive unit',
                    cost: { energy: 30, minerals: 25, alloy: 5 },
                    stats: { health: 80, speed: 3, attack: 15, defense: 20 },
                    abilities: ['defend', 'fortify'],
                    unlocked: false,
                    buildTime: 60
                },
                warrior: {
                    name: 'Warrior',
                    icon: '⚔️',
                    description: 'Elite combat unit',
                    cost: { energy: 40, minerals: 30, alloy: 10 },
                    stats: { health: 60, speed: 6, attack: 25, defense: 10 },
                    abilities: ['assault', 'leadership'],
                    unlocked: false,
                    buildTime: 75
                }
            },

            research: {
                advanced_materials: {
                    name: 'Advanced Materials',
                    icon: '🧪',
                    description: 'Unlocks factory and alloy production',
                    cost: 50,
                    unlocks: ['factory'],
                    prereq: []
                },
                military_tactics: {
                    name: 'Military Tactics',
                    icon: '📋',
                    description: 'Unlocks defender and warrior units',
                    cost: 75,
                    unlocks: ['defender', 'warrior'],
                    prereq: ['advanced_materials']
                },
                defensive_systems: {
                    name: 'Defensive Systems',
                    icon: '🛡️',
                    description: 'Unlocks defense turrets and fortifications',
                    cost: 100,
                    unlocks: ['defense_turret', 'research_lab'],
                    prereq: ['military_tactics']
                },
                long_range_communication: {
                    name: 'Long Range Communication',
                    icon: '📡',
                    description: 'Enables coordination with distant outposts',
                    cost: 125,
                    unlocks: ['expansion'],
                    prereq: ['defensive_systems']
                }
            },

            worldLocations: {
                mineral_deposit: {
                    name: 'Mineral Deposit',
                    icon: '⛰️',
                    description: 'Rich source of minerals',
                    resources: { minerals: 100 },
                    danger: 2,
                    distance: 150
                },
                energy_source: {
                    name: 'Energy Source',
                    icon: '🔋',
                    description: 'Natural energy accumulation',
                    resources: { energy: 80 },
                    danger: 1,
                    distance: 120
                },
                ancient_ruins: {
                    name: 'Ancient Ruins',
                    icon: '🏛️',
                    description: 'Mysterious technology remnants',
                    resources: { intel: 50, alloy: 20 },
                    danger: 4,
                    distance: 200
                },
                enemy_outpost: {
                    name: 'Enemy Outpost',
                    icon: '☠️',
                    description: 'Hostile forces detected',
                    resources: { alloy: 30, intel: 25 },
                    danger: 5,
                    distance: 180
                }
            },

            missionTypes: {
                exploration: {
                    name: 'Exploration Mission',
                    icon: '🗺️',
                    description: 'Send scouts to discover new locations',
                    duration: 60,
                    requirements: ['scout']
                },
                resource_gathering: {
                    name: 'Resource Gathering',
                    icon: '⛏️',
                    description: 'Collect resources from known locations',
                    duration: 90,
                    requirements: ['trader']
                },
                assault: {
                    name: 'Assault Mission',
                    icon: '⚔️',
                    description: 'Attack enemy positions',
                    duration: 120,
                    requirements: ['warrior']
                },
                defense: {
                    name: 'Base Defense',
                    icon: '🛡️',
                    description: 'Defend against incoming attacks',
                    duration: 45,
                    requirements: ['defender']
                }
            }
        };
    }

    setupUI() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.innerHTML = `
            <header class="strategy-header">
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
                <div class="commander-info">
                    <div class="commander-avatar">👨‍💼</div>
                    <div class="commander-details">
                        <h2>Commander ${this.gameState.player.name}</h2>
                        <div class="commander-stats">
                            <span>Level ${this.gameState.player.level}</span>
                            <span>XP: ${this.gameState.player.experience}</span>
                            <span>Rep: ${this.gameState.player.reputation}</span>
                        </div>
                    </div>
                </div>
                <div class="resource-display">
                    <div class="resource" id="energyDisplay">
                        <span class="resource-icon">⚡</span>
                        <span class="resource-amount">100</span>
                    </div>
                    <div class="resource" id="mineralsDisplay">
                        <span class="resource-icon">⛰️</span>
                        <span class="resource-amount">50</span>
                    </div>
                    <div class="resource" id="alloyDisplay">
                        <span class="resource-icon">🔩</span>
                        <span class="resource-amount">0</span>
                    </div>
                    <div class="resource" id="intelDisplay">
                        <span class="resource-icon">🧠</span>
                        <span class="resource-amount">0</span>
                    </div>
                </div>
            </header>

            <main class="strategy-main">
                <div class="strategy-tabs">
                    <button class="tab-btn active" data-tab="base">🏗️ Base</button>
                    <button class="tab-btn" data-tab="units">👥 Units</button>
                    <button class="tab-btn" data-tab="missions">🎯 Missions</button>
                    <button class="tab-btn" data-tab="research">🔬 Research</button>
                    <button class="tab-btn" data-tab="map">🗺️ World Map</button>
                </div>

                <div class="tab-content active" id="base-tab">
                    <div class="base-management" id="baseManagement">
                        <!-- Base management content -->
                    </div>
                </div>

                <div class="tab-content" id="units-tab">
                    <div class="unit-management" id="unitManagement">
                        <!-- Unit management content -->
                    </div>
                </div>

                <div class="tab-content" id="missions-tab">
                    <div class="mission-control" id="missionControl">
                        <!-- Mission control content -->
                    </div>
                </div>

                <div class="tab-content" id="research-tab">
                    <div class="research-center" id="researchCenter">
                        <!-- Research content -->
                    </div>
                </div>

                <div class="tab-content" id="map-tab">
                    <div class="world-map" id="worldMap">
                        <!-- World map content -->
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

    renderBase() {
        const area = document.getElementById('baseManagement');
        const base = this.gameState.base.mainBase;
        
        area.innerHTML = `
            <div class="base-header">
                <h3>🏗️ Base Management</h3>
                <div class="base-status">
                    <div class="base-health">
                        <span class="health-icon">❤️</span>
                        <span>${base.health}/${base.maxHealth}</span>
                    </div>
                    <div class="base-level">
                        <span class="level-icon">⭐</span>
                        <span>Level ${base.level}</span>
                    </div>
                    <div class="base-defenses">
                        <span class="defense-icon">🛡️</span>
                        <span>${base.defenses} Defense</span>
                    </div>
                </div>
            </div>
            
            <div class="buildings-section">
                <h4>Buildings</h4>
                <div class="buildings-grid">
                    ${Object.entries(this.gameData.buildings).map(([id, building]) => {
                        const owned = base.buildings[id] || 0;
                        const canAfford = this.canAffordBuilding(building);
                        const isUnlocked = building.unlocked;
                        
                        return `
                            <div class="building-card ${!isUnlocked ? 'locked' : ''}">
                                <div class="building-header">
                                    <div class="building-icon">${building.icon}</div>
                                    <div class="building-info">
                                        <h5>${building.name}</h5>
                                        <p>${building.description}</p>
                                    </div>
                                    ${owned > 0 ? `<div class="building-count">x${owned}</div>` : ''}
                                </div>
                                
                                <div class="building-production">
                                    ${Object.entries(building.produces).length > 0 ? `
                                        <h6>Produces:</h6>
                                        <div class="production-list">
                                            ${Object.entries(building.produces).map(([resource, amount]) => `
                                                <span class="production-item">
                                                    ${this.getResourceIcon(resource)} +${amount * owned}/min
                                                </span>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div class="building-cost">
                                    <h6>Cost:</h6>
                                    <div class="cost-list">
                                        ${Object.entries(building.cost).map(([resource, amount]) => {
                                            const owned = this.gameState.resources[resource] || 0;
                                            const affordable = owned >= amount;
                                            return `
                                                <span class="cost-item ${affordable ? 'affordable' : 'expensive'}">
                                                    ${this.getResourceIcon(resource)} ${amount}
                                                </span>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                                
                                <div class="building-actions">
                                    <button class="btn btn-primary build-btn" data-building="${id}" 
                                        ${!isUnlocked || !canAfford ? 'disabled' : ''}>
                                        ${!isUnlocked ? '🔒 Locked' : '🏗️ Build'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add build button events
        document.querySelectorAll('.build-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingId = e.target.dataset.building;
                this.buildBuilding(buildingId);
            });
        });
    }

    renderUnits() {
        const area = document.getElementById('unitManagement');
        
        area.innerHTML = `
            <div class="units-header">
                <h3>👥 Unit Management</h3>
                <p>Train and command your military forces</p>
            </div>
            
            <div class="current-units">
                <h4>Current Forces</h4>
                <div class="units-display">
                    ${Object.entries(this.gameState.units).map(([unitType, count]) => {
                        const unit = this.gameData.units[unitType];
                        return `
                            <div class="unit-count">
                                <span class="unit-icon">${unit.icon}</span>
                                <span class="unit-name">${unit.name}</span>
                                <span class="unit-amount">x${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="unit-training">
                <h4>Train Units</h4>
                <div class="units-grid">
                    ${Object.entries(this.gameData.units).map(([id, unit]) => {
                        const canAfford = this.canAffordUnit(unit);
                        const canTrain = this.canTrainUnit(id);
                        
                        return `
                            <div class="unit-card ${!unit.unlocked ? 'locked' : ''}">
                                <div class="unit-header">
                                    <div class="unit-icon">${unit.icon}</div>
                                    <div class="unit-info">
                                        <h5>${unit.name}</h5>
                                        <p>${unit.description}</p>
                                    </div>
                                </div>
                                
                                <div class="unit-stats">
                                    <div class="stat-row">
                                        <span>❤️ Health: ${unit.stats.health}</span>
                                        <span>⚡ Speed: ${unit.stats.speed}</span>
                                    </div>
                                    <div class="stat-row">
                                        <span>⚔️ Attack: ${unit.stats.attack}</span>
                                        <span>🛡️ Defense: ${unit.stats.defense}</span>
                                    </div>
                                </div>
                                
                                <div class="unit-abilities">
                                    <h6>Abilities:</h6>
                                    <div class="abilities-list">
                                        ${unit.abilities.map(ability => `
                                            <span class="ability-tag">${ability}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="unit-cost">
                                    <h6>Cost:</h6>
                                    <div class="cost-list">
                                        ${Object.entries(unit.cost).map(([resource, amount]) => {
                                            const owned = this.gameState.resources[resource] || 0;
                                            const affordable = owned >= amount;
                                            return `
                                                <span class="cost-item ${affordable ? 'affordable' : 'expensive'}">
                                                    ${this.getResourceIcon(resource)} ${amount}
                                                </span>
                                            `;
                                        }).join('')}
                                    </div>
                                    <div class="train-time">⏱️ ${unit.buildTime}s</div>
                                </div>
                                
                                <div class="unit-actions">
                                    <button class="btn btn-primary train-btn" data-unit="${id}" 
                                        ${!canTrain || !canAfford ? 'disabled' : ''}>
                                        ${!unit.unlocked ? '🔒 Locked' : '🎯 Train'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add train button events
        document.querySelectorAll('.train-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unitId = e.target.dataset.unit;
                this.trainUnit(unitId);
            });
        });
    }

    renderMissions() {
        const area = document.getElementById('missionControl');
        
        area.innerHTML = `
            <div class="missions-header">
                <h3>🎯 Mission Control</h3>
                <p>Deploy units on strategic missions</p>
            </div>
            
            <div class="active-missions">
                <h4>Active Missions</h4>
                <div class="missions-list">
                    ${this.gameState.missions.active.length === 0 ? 
                        '<p class="no-missions">No active missions</p>' :
                        this.gameState.missions.active.map(mission => `
                            <div class="mission-card active">
                                <div class="mission-icon">${mission.icon}</div>
                                <div class="mission-info">
                                    <h5>${mission.name}</h5>
                                    <p>${mission.description}</p>
                                    <div class="mission-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${mission.progress}%"></div>
                                        </div>
                                        <span>${Math.floor(mission.timeRemaining)}s remaining</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            
            <div class="available-missions">
                <h4>Available Missions</h4>
                <div class="missions-grid">
                    ${Object.entries(this.gameData.missionTypes).map(([id, mission]) => {
                        const canStart = this.canStartMission(mission);
                        
                        return `
                            <div class="mission-card">
                                <div class="mission-header">
                                    <div class="mission-icon">${mission.icon}</div>
                                    <div class="mission-info">
                                        <h5>${mission.name}</h5>
                                        <p>${mission.description}</p>
                                    </div>
                                </div>
                                
                                <div class="mission-requirements">
                                    <h6>Requirements:</h6>
                                    <div class="requirements-list">
                                        ${mission.requirements.map(req => {
                                            const available = this.gameState.units[req] || 0;
                                            const hasUnits = available > 0;
                                            return `
                                                <span class="requirement ${hasUnits ? 'met' : 'unmet'}">
                                                    ${this.gameData.units[req].icon} ${this.gameData.units[req].name} (${available})
                                                </span>
                                            `;
                                        }).join('')}
                                    </div>
                                    <div class="mission-duration">⏱️ ${mission.duration}s</div>
                                </div>
                                
                                <div class="mission-actions">
                                    <button class="btn btn-primary start-mission-btn" data-mission="${id}" 
                                        ${!canStart ? 'disabled' : ''}>
                                        🚀 Start Mission
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add mission button events
        document.querySelectorAll('.start-mission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const missionId = e.target.dataset.mission;
                this.startMission(missionId);
            });
        });
    }

    renderResearch() {
        const area = document.getElementById('researchCenter');
        
        area.innerHTML = `
            <div class="research-header">
                <h3>🔬 Research Center</h3>
                <p>Research Points: ${this.gameState.research.points}</p>
                ${this.gameState.research.inProgress ? `
                    <div class="research-progress">
                        <p>Currently researching: ${this.gameData.research[this.gameState.research.inProgress].name}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="research-tree">
                <div class="research-grid">
                    ${Object.entries(this.gameData.research).map(([id, tech]) => {
                        const completed = this.gameState.research.completed[id];
                        const canResearch = this.canResearch(tech);
                        const isResearching = this.gameState.research.inProgress === id;
                        
                        return `
                            <div class="research-card ${completed ? 'completed' : ''} ${isResearching ? 'researching' : ''}">
                                <div class="research-header">
                                    <div class="research-icon">${tech.icon}</div>
                                    <div class="research-info">
                                        <h5>${tech.name}</h5>
                                        <p>${tech.description}</p>
                                    </div>
                                    ${completed ? '<div class="completed-badge">✅</div>' : ''}
                                </div>
                                
                                <div class="research-unlocks">
                                    <h6>Unlocks:</h6>
                                    <div class="unlocks-list">
                                        ${tech.unlocks.map(unlock => `
                                            <span class="unlock-tag">${unlock}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="research-cost">
                                    <span class="cost-label">Cost:</span>
                                    <span class="cost-value">${tech.cost} RP</span>
                                </div>
                                
                                <div class="research-actions">
                                    <button class="btn btn-primary research-btn" data-tech="${id}" 
                                        ${completed || !canResearch || isResearching ? 'disabled' : ''}>
                                        ${completed ? '✅ Completed' : 
                                          isResearching ? '🔬 Researching...' :
                                          canResearch ? '🔬 Research' : '❌ Requirements not met'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add research button events
        document.querySelectorAll('.research-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const techId = e.target.dataset.tech;
                this.startResearch(techId);
            });
        });
    }

    renderMap() {
        const area = document.getElementById('worldMap');
        
        area.innerHTML = `
            <div class="map-header">
                <h3>🗺️ World Map</h3>
                <p>Explore and control strategic locations</p>
            </div>
            
            <div class="map-container">
                <div class="tactical-map" id="tacticalMap">
                    <!-- Map will be rendered here -->
                </div>
            </div>
            
            <div class="discovered-locations">
                <h4>Known Locations</h4>
                <div class="locations-grid">
                    ${Object.entries(this.gameData.worldLocations).map(([id, location]) => {
                        const discovered = this.gameState.world.discovered.includes(id);
                        
                        return `
                            <div class="location-card ${discovered ? 'discovered' : 'undiscovered'}">
                                <div class="location-header">
                                    <div class="location-icon">${discovered ? location.icon : '❓'}</div>
                                    <div class="location-info">
                                        <h5>${discovered ? location.name : 'Unknown Location'}</h5>
                                        <p>${discovered ? location.description : 'Send scouts to reveal'}</p>
                                    </div>
                                </div>
                                
                                ${discovered ? `
                                    <div class="location-resources">
                                        <h6>Resources:</h6>
                                        <div class="resource-list">
                                            ${Object.entries(location.resources).map(([resource, amount]) => `
                                                <span class="resource-tag">
                                                    ${this.getResourceIcon(resource)} ${amount}
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="location-stats">
                                        <div class="danger-level">
                                            <span>⚠️ Danger: ${location.danger}/5</span>
                                        </div>
                                        <div class="distance">
                                            <span>📏 Distance: ${location.distance}km</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.renderTacticalMap();
    }

    renderTacticalMap() {
        const mapElement = document.getElementById('tacticalMap');
        if (!mapElement) return;

        mapElement.innerHTML = `
            <div class="map-legend">
                <div class="legend-item">🏛️ Your Base</div>
                <div class="legend-item">⛰️ Resources</div>
                <div class="legend-item">☠️ Enemies</div>
                <div class="legend-item">🔍 Units</div>
            </div>
            <div class="map-grid">
                <!-- Simplified tactical map representation -->
                <div class="map-cell base-cell" style="grid-column: 5; grid-row: 5;">
                    🏛️
                </div>
                ${this.gameState.world.discovered.includes('mineral_deposit') ? 
                    '<div class="map-cell resource-cell" style="grid-column: 7; grid-row: 3;">⛰️</div>' : ''}
                ${this.gameState.world.discovered.includes('energy_source') ? 
                    '<div class="map-cell resource-cell" style="grid-column: 3; grid-row: 7;">🔋</div>' : ''}
                ${this.gameState.world.discovered.includes('enemy_outpost') ? 
                    '<div class="map-cell enemy-cell" style="grid-column: 8; grid-row: 8;">☠️</div>' : ''}
            </div>
        `;
    }

    // Game Actions
    buildBuilding(buildingId) {
        const building = this.gameData.buildings[buildingId];
        if (!building || !this.canAffordBuilding(building) || !building.unlocked) return;

        // Deduct resources
        Object.entries(building.cost).forEach(([resource, amount]) => {
            this.gameState.resources[resource] -= amount;
        });

        // Add building
        this.gameState.base.mainBase.buildings[buildingId] = (this.gameState.base.mainBase.buildings[buildingId] || 0) + 1;
        this.gameState.stats.totalBuildingsBuilt++;

        this.showMessage(`Built ${building.name}!`, 'success');
        this.renderBase();
        this.updateUI();
    }

    trainUnit(unitId) {
        const unit = this.gameData.units[unitId];
        if (!unit || !this.canAffordUnit(unit) || !this.canTrainUnit(unitId)) return;

        // Deduct resources
        Object.entries(unit.cost).forEach(([resource, amount]) => {
            this.gameState.resources[resource] -= amount;
        });

        // Simulate training time (simplified for demo)
        setTimeout(() => {
            this.gameState.units[unitId] = (this.gameState.units[unitId] || 0) + 1;
            this.gameState.stats.totalUnitsBuilt++;
            this.showMessage(`${unit.name} training completed!`, 'success');
            this.renderUnits();
        }, unit.buildTime * 100); // Accelerated for demo

        this.showMessage(`Training ${unit.name}... (${unit.buildTime}s)`, 'info');
        this.renderUnits();
        this.updateUI();
    }

    startMission(missionId) {
        const missionType = this.gameData.missionTypes[missionId];
        if (!missionType || !this.canStartMission(missionType)) return;

        // Deduct units for mission
        missionType.requirements.forEach(unitType => {
            this.gameState.units[unitType]--;
        });

        // Create active mission
        const mission = {
            id: Date.now().toString(),
            type: missionId,
            name: missionType.name,
            icon: missionType.icon,
            description: missionType.description,
            duration: missionType.duration,
            timeRemaining: missionType.duration,
            progress: 0,
            startedAt: Date.now()
        };

        this.gameState.missions.active.push(mission);
        this.showMessage(`Started ${missionType.name}!`, 'success');
        this.renderMissions();
        this.renderUnits();
    }

    startResearch(techId) {
        const tech = this.gameData.research[techId];
        if (!tech || !this.canResearch(tech) || this.gameState.research.inProgress) return;

        if (this.gameState.research.points >= tech.cost) {
            this.gameState.research.points -= tech.cost;
            this.gameState.research.inProgress = techId;

            // Simulate research time (simplified)
            setTimeout(() => {
                this.completeResearch(techId);
            }, 5000); // 5 seconds for demo

            this.showMessage(`Started researching ${tech.name}!`, 'success');
            this.renderResearch();
        }
    }

    completeResearch(techId) {
        const tech = this.gameData.research[techId];
        this.gameState.research.completed[techId] = true;
        this.gameState.research.inProgress = null;

        // Unlock technologies
        tech.unlocks.forEach(unlock => {
            if (this.gameData.buildings[unlock]) {
                this.gameData.buildings[unlock].unlocked = true;
            }
            if (this.gameData.units[unlock]) {
                this.gameData.units[unlock].unlocked = true;
            }
        });

        this.showMessage(`Research completed: ${tech.name}!`, 'success');
        this.renderResearch();
        this.renderBase();
        this.renderUnits();
    }

    // Helper Methods
    canAffordBuilding(building) {
        return Object.entries(building.cost).every(([resource, amount]) => 
            (this.gameState.resources[resource] || 0) >= amount
        );
    }

    canAffordUnit(unit) {
        return Object.entries(unit.cost).every(([resource, amount]) => 
            (this.gameState.resources[resource] || 0) >= amount
        );
    }

    canTrainUnit(unitId) {
        const unit = this.gameData.units[unitId];
        if (!unit.unlocked) return false;
        
        // Check if we have barracks
        return (this.gameState.base.mainBase.buildings.barracks || 0) > 0;
    }

    canStartMission(mission) {
        return mission.requirements.every(unitType => 
            (this.gameState.units[unitType] || 0) > 0
        );
    }

    canResearch(tech) {
        if (this.gameState.research.points < tech.cost) return false;
        
        return tech.prereq.every(prereqId => 
            this.gameState.research.completed[prereqId]
        );
    }

    getResourceIcon(resource) {
        const icons = {
            energy: '⚡',
            minerals: '⛰️',
            alloy: '🔩',
            intel: '🧠'
        };
        return icons[resource] || '❓';
    }

    // Game Systems
    initializeWorld() {
        // Add some initial discovered locations
        this.gameState.world.discovered = ['main_base'];
        
        // Create initial threats
        this.generateRandomThreats();
    }

    initializeMap() {
        // Initialize a simple grid-based map
        return {
            width: 10,
            height: 10,
            cells: new Array(100).fill(null).map(() => ({ type: 'empty', entities: [] }))
        };
    }

    generateRandomThreats() {
        // Periodically generate random threats/events
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                this.addRandomThreat();
            }
        }, 30000); // Check every 30 seconds
    }

    addRandomThreat() {
        const threats = ['Raider Attack', 'Resource Shortage', 'Equipment Malfunction'];
        const threat = threats[Math.floor(Math.random() * threats.length)];
        
        this.gameState.world.threats.push({
            id: Date.now().toString(),
            name: threat,
            severity: Math.floor(Math.random() * 5) + 1,
            timeToImpact: 60 + Math.random() * 120 // 1-3 minutes
        });

        this.showMessage(`⚠️ Threat detected: ${threat}!`, 'warning');
    }

    startGameLoop() {
        this.updateInterval = setInterval(() => {
            this.updateResources();
            this.updateMissions();
            this.updateThreats();
            this.updateUI();
        }, 1000); // Update every second

        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, 10000); // Save every 10 seconds
    }

    updateResources() {
        const base = this.gameState.base.mainBase;
        
        // Generate resources from buildings
        Object.entries(base.buildings).forEach(([buildingId, count]) => {
            const building = this.gameData.buildings[buildingId];
            if (building && count > 0) {
                Object.entries(building.produces).forEach(([resource, amount]) => {
                    this.gameState.resources[resource] += (amount * count) / 60; // Per minute to per second
                });
            }
        });

        // Round resources
        Object.keys(this.gameState.resources).forEach(resource => {
            this.gameState.resources[resource] = Math.floor(this.gameState.resources[resource]);
        });
    }

    updateMissions() {
        this.gameState.missions.active = this.gameState.missions.active.filter(mission => {
            mission.timeRemaining--;
            mission.progress = ((mission.duration - mission.timeRemaining) / mission.duration) * 100;
            
            if (mission.timeRemaining <= 0) {
                this.completeMission(mission);
                return false;
            }
            return true;
        });
    }

    completeMission(mission) {
        // Return units and give rewards
        const missionType = this.gameData.missionTypes[mission.type];
        
        // Return units
        missionType.requirements.forEach(unitType => {
            this.gameState.units[unitType]++;
        });

        // Give rewards based on mission type
        const rewards = this.calculateMissionRewards(mission);
        Object.entries(rewards).forEach(([resource, amount]) => {
            this.gameState.resources[resource] += amount;
        });

        // Add to completed missions
        this.gameState.missions.completed.push(mission);
        
        // Update stats
        if (mission.type === 'assault') {
            this.gameState.combat.battlesWon++;
            this.gameState.combat.enemiesDefeated += Math.floor(Math.random() * 5) + 1;
        }

        this.showMessage(`Mission completed: ${mission.name}! Rewards received.`, 'success');
    }

    calculateMissionRewards(mission) {
        const baseRewards = {
            exploration: { intel: 20, minerals: 10 },
            resource_gathering: { minerals: 30, energy: 15 },
            assault: { alloy: 15, intel: 25 },
            defense: { energy: 20, minerals: 15 }
        };

        return baseRewards[mission.type] || {};
    }

    updateThreats() {
        this.gameState.world.threats = this.gameState.world.threats.filter(threat => {
            threat.timeToImpact--;
            
            if (threat.timeToImpact <= 0) {
                this.handleThreatImpact(threat);
                return false;
            }
            return true;
        });
    }

    handleThreatImpact(threat) {
        // Apply threat effects
        const damage = threat.severity * 5;
        this.gameState.base.mainBase.health = Math.max(0, this.gameState.base.mainBase.health - damage);
        
        this.showMessage(`${threat.name} has impacted your base! (-${damage} health)`, 'error');
        
        if (this.gameState.base.mainBase.health <= 0) {
            this.triggerGameOver();
        }
    }

    updateUI() {
        // Update resource display
        document.getElementById('energyDisplay').querySelector('.resource-amount').textContent = 
            Math.floor(this.gameState.resources.energy);
        document.getElementById('mineralsDisplay').querySelector('.resource-amount').textContent = 
            Math.floor(this.gameState.resources.minerals);
        document.getElementById('alloyDisplay').querySelector('.resource-amount').textContent = 
            Math.floor(this.gameState.resources.alloy);
        document.getElementById('intelDisplay').querySelector('.resource-amount').textContent = 
            Math.floor(this.gameState.resources.intel);
    }

    renderAll() {
        this.renderBase();
        this.updateUI();
    }

    // Story Elements
    showCommanderIntro() {
        this.showMessage(`
            🎖️ WELCOME, COMMANDER! 🎖️
            
            You've been assigned to establish and defend a strategic outpost in hostile territory.
            
            Your objectives:
            • Build and expand your base
            • Train and deploy military units
            • Research advanced technologies
            • Defend against enemy threats
            
            The success of this operation depends on your tactical decisions. Good luck, Commander!
        `, 'story', 8000);
    }

    triggerGameOver() {
        this.showMessage(`
            💀 BASE DESTROYED 💀
            
            Your base has been overwhelmed by enemy forces.
            
            Final Stats:
            • Buildings Built: ${this.gameState.stats.totalBuildingsBuilt}
            • Units Trained: ${this.gameState.stats.totalUnitsBuilt}
            • Battles Won: ${this.gameState.combat.battlesWon}
            
            The mission has failed, Commander.
        `, 'gameover', 10000);
    }

    showMessage(text, type = 'info', duration = 4000) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `strategy-message strategy-message-${type}`;
        
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
            window.gameManager.userSystem.saveGameData('strategyMode', this.gameState);
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
window.StrategyGame = StrategyGame;