// Hero Crafting Game Mode - Fourth game using achievement points
class HeroCraftingGame {
    constructor(sharedSystems) {
        this.sharedSystems = sharedSystems;
        this.gameState = {
            player: {
                name: 'Hero Master',
                level: 1,
                experience: 0,
                achievementPoints: 0,
                totalAchievementPoints: 0
            },
            heroes: {
                collection: {},
                active: null,
                slots: 4
            },
            classes: {
                warrior: {
                    name: 'Warrior',
                    icon: '⚔️',
                    color: '#dc2626',
                    description: 'Masters of combat and physical prowess',
                    stats: { attack: 8, defense: 6, speed: 4, magic: 2 },
                    unlocked: true,
                    cost: 100
                },
                mage: {
                    name: 'Mage',
                    icon: '🔮',
                    color: '#7c3aed',
                    description: 'Wielders of arcane magic and elemental power',
                    stats: { attack: 3, defense: 2, speed: 5, magic: 10 },
                    unlocked: false,
                    cost: 150
                },
                archer: {
                    name: 'Archer',
                    icon: '🏹',
                    color: '#059669',
                    description: 'Precise ranged attackers with keen sight',
                    stats: { attack: 6, defense: 3, speed: 8, magic: 3 },
                    unlocked: false,
                    cost: 125
                },
                healer: {
                    name: 'Healer',
                    icon: '💚',
                    color: '#0891b2',
                    description: 'Support specialists focused on restoration',
                    stats: { attack: 2, defense: 4, speed: 6, magic: 8 },
                    unlocked: false,
                    cost: 175
                },
                rogue: {
                    name: 'Rogue',
                    icon: '🗡️',
                    color: '#7c2d12',
                    description: 'Stealthy assassins with critical strike abilities',
                    stats: { attack: 7, defense: 3, speed: 9, magic: 1 },
                    unlocked: false,
                    cost: 200
                },
                tank: {
                    name: 'Tank',
                    icon: '🛡️',
                    color: '#374151',
                    description: 'Defensive juggernauts who protect allies',
                    stats: { attack: 4, defense: 10, speed: 2, magic: 4 },
                    unlocked: false,
                    cost: 225
                }
            },
            upgrades: {
                combat_mastery: {
                    name: 'Combat Mastery',
                    description: 'Increases attack power of all heroes by 20%',
                    cost: 300,
                    effect: 'attack_boost',
                    value: 1.2,
                    purchased: false
                },
                defensive_training: {
                    name: 'Defensive Training',
                    description: 'Increases defense of all heroes by 25%',
                    cost: 350,
                    effect: 'defense_boost',
                    value: 1.25,
                    purchased: false
                },
                speed_enhancement: {
                    name: 'Speed Enhancement',
                    description: 'Increases speed of all heroes by 30%',
                    cost: 400,
                    effect: 'speed_boost',
                    value: 1.3,
                    purchased: false
                },
                magical_aptitude: {
                    name: 'Magical Aptitude',
                    description: 'Increases magic power of all heroes by 35%',
                    cost: 450,
                    effect: 'magic_boost',
                    value: 1.35,
                    purchased: false
                },
                hero_slots: {
                    name: 'Additional Hero Slots',
                    description: 'Allows you to maintain 2 more active heroes',
                    cost: 500,
                    effect: 'slots_increase',
                    value: 2,
                    purchased: false
                }
            },
            missions: {
                active: [],
                completed: [],
                available: [
                    {
                        id: 'village_defense',
                        name: 'Village Defense',
                        description: 'Protect a village from bandit attacks',
                        difficulty: 'Easy',
                        duration: 300,
                        requirements: { totalPower: 50 },
                        rewards: { points: 25, experience: 100 },
                        preferredClasses: ['warrior', 'tank']
                    },
                    {
                        id: 'magical_research',
                        name: 'Magical Research',
                        description: 'Assist scholars in arcane experiments',
                        difficulty: 'Medium',
                        duration: 450,
                        requirements: { totalPower: 75, hasClass: 'mage' },
                        rewards: { points: 40, experience: 150 },
                        preferredClasses: ['mage', 'healer']
                    },
                    {
                        id: 'stealth_operation',
                        name: 'Stealth Operation',
                        description: 'Infiltrate enemy territory for intelligence',
                        difficulty: 'Hard',
                        duration: 600,
                        requirements: { totalPower: 100, hasClass: 'rogue' },
                        rewards: { points: 60, experience: 200 },
                        preferredClasses: ['rogue', 'archer']
                    }
                ]
            },
            stats: {
                heroesCreated: 0,
                missionsCompleted: 0,
                totalPower: 0,
                timePlayed: 0
            },
            lastSave: Date.now(),
            gameStarted: Date.now()
        };

        this.updateInterval = null;
        this.saveInterval = null;
        
        this.init();
    }

    init() {
        this.loadAchievementPoints();
        this.setupUI();
        this.startGameLoop();
        this.renderAll();
        // Show welcome text in center instead of notification modal
        this.addCenterWelcomeText();
    }

    loadAchievementPoints() {
        // Load achievement points from user system
        if (window.gameManager && window.gameManager.userSystem) {
            const user = window.gameManager.userSystem.getCurrentUser();
            if (user && user.stats) {
                this.gameState.player.achievementPoints = user.stats.totalAchievements * 50; // 50 points per achievement
                this.gameState.player.totalAchievementPoints = this.gameState.player.achievementPoints;
            }
        }
    }

    setupUI() {
        const gameContainer = document.querySelector('.game-container');
        
        // Create header using shared components
        const headerConfig = {
            gameType: 'hero-crafting',
            icon: '🦸',
            title: 'Hero Forge',
            subtitle: 'Craft legendary heroes from your achievements',
            stats: {
                points: { icon: '🏆', value: this.gameState.player.achievementPoints },
                level: { icon: '⭐', value: this.gameState.player.level },
                heroes: { icon: '🦸', value: Object.keys(this.gameState.heroes.collection).length }
            }
        };

        const header = window.SharedComponents.createGameHeader(headerConfig);
        
        // Create tab navigation
        const tabs = [
            { id: 'forge', name: 'Forge', icon: '🔨', description: 'Create new heroes' },
            { id: 'collection', name: 'Collection', icon: '📚', description: 'View your heroes' },
            { id: 'missions', name: 'Missions', icon: '🎯', description: 'Send heroes on quests' },
            { id: 'upgrades', name: 'Upgrades', icon: '⬆️', description: 'Enhance your heroes' },
            { id: 'classes', name: 'Classes', icon: '🎭', description: 'Unlock new hero types' }
        ];

        const tabNav = window.SharedComponents.createTabNavigation(tabs);

        gameContainer.innerHTML = '';
        gameContainer.appendChild(header);
        gameContainer.appendChild(tabNav);

        // Listen for tab changes
        tabNav.addEventListener('tabChanged', (e) => {
            const { tabId } = e.detail;
            this[`render${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`]();
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Additional event listeners will be added by individual render methods
    }

    renderForge() {
        const content = document.getElementById('forge-tab');
        if (!content) return;

        content.innerHTML = `
            <div class="hero-forge-container">
                <div class="forge-header">
                    <h3>🔨 Hero Forge</h3>
                    <p>Transform your achievements into powerful heroes</p>
                    <div class="achievement-points">
                        <span class="points-icon">🏆</span>
                        <span class="points-amount">${this.gameState.player.achievementPoints} Achievement Points</span>
                    </div>
                </div>

                <div class="class-selection">
                    <h4>Choose Hero Class</h4>
                    <div class="class-grid">
                        ${Object.entries(this.gameState.classes).map(([classId, heroClass]) => {
                            const unlocked = heroClass.unlocked;
                            const canAfford = this.gameState.player.achievementPoints >= heroClass.cost;
                            
                            return `
                                <div class="class-card ${!unlocked ? 'locked' : ''}" data-class="${classId}">
                                    <div class="class-header">
                                        <div class="class-icon" style="color: ${heroClass.color}">${heroClass.icon}</div>
                                        <div class="class-info">
                                            <h5 style="color: ${heroClass.color}">${heroClass.name}</h5>
                                            <p>${heroClass.description}</p>
                                        </div>
                                        ${!unlocked ? '<div class="locked-badge">🔒</div>' : ''}
                                    </div>
                                    
                                    <div class="class-stats">
                                        <div class="stat-grid">
                                            <div class="stat-item">
                                                <span class="stat-label">⚔️ ATK</span>
                                                <span class="stat-value">${heroClass.stats.attack}</span>
                                            </div>
                                            <div class="stat-item">
                                                <span class="stat-label">🛡️ DEF</span>
                                                <span class="stat-value">${heroClass.stats.defense}</span>
                                            </div>
                                            <div class="stat-item">
                                                <span class="stat-label">⚡ SPD</span>
                                                <span class="stat-value">${heroClass.stats.speed}</span>
                                            </div>
                                            <div class="stat-item">
                                                <span class="stat-label">🔮 MAG</span>
                                                <span class="stat-value">${heroClass.stats.magic}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="class-cost">
                                        <span class="cost-label">Cost:</span>
                                        <span class="cost-amount ${canAfford ? 'affordable' : 'expensive'}">
                                            🏆 ${heroClass.cost}
                                        </span>
                                    </div>
                                    
                                    <div class="class-actions">
                                        <button class="btn btn-primary forge-btn" 
                                                data-class="${classId}"
                                                ${!unlocked || !canAfford ? 'disabled' : ''}>
                                            ${!unlocked ? '🔒 Locked' : canAfford ? '🔨 Forge Hero' : '💰 Need More Points'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="forge-process" id="forgeProcess" style="display: none;">
                    <h4>🔥 Forging in Progress...</h4>
                    <div class="forge-animation">
                        <div class="anvil">🔨</div>
                        <div class="sparks">✨</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="forgeProgress"></div>
                    </div>
                </div>
            </div>
        `;

        // Add forge button events
        content.querySelectorAll('.forge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = e.target.dataset.class;
                this.forgeHero(classId);
            });
        });
    }

    renderCollection() {
        const content = document.getElementById('collection-tab');
        if (!content) return;

        const heroes = Object.values(this.gameState.heroes.collection);

        content.innerHTML = `
            <div class="hero-collection">
                <div class="collection-header">
                    <h3>📚 Hero Collection</h3>
                    <p>Your legendary heroes await your command</p>
                    <div class="collection-stats">
                        <span>Heroes: ${heroes.length}/${this.gameState.heroes.slots}</span>
                        <span>Total Power: ${this.calculateTotalPower()}</span>
                    </div>
                </div>

                <div class="heroes-grid">
                    ${heroes.length === 0 ? `
                        <div class="empty-collection">
                            <div class="empty-icon">🏺</div>
                            <h4>No Heroes Yet</h4>
                            <p>Visit the Forge to create your first hero!</p>
                        </div>
                    ` : heroes.map(hero => this.renderHeroCard(hero)).join('')}
                </div>

                ${heroes.length > 0 ? `
                    <div class="collection-actions">
                        <button class="btn btn-secondary" onclick="heroGame.dismissAllHeroes()">
                            📤 Dismiss All
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderHeroCard(hero) {
        const heroClass = this.gameState.classes[hero.class];
        const isActive = this.gameState.heroes.active === hero.id;
        const power = this.calculateHeroPower(hero);

        return `
            <div class="hero-card ${isActive ? 'active' : ''}" data-hero="${hero.id}">
                <div class="hero-header">
                    <div class="hero-icon" style="color: ${heroClass.color}">${heroClass.icon}</div>
                    <div class="hero-info">
                        <h4>${hero.name}</h4>
                        <div class="hero-class-indicator" style="background: ${heroClass.color}15; border-color: ${heroClass.color}; color: ${heroClass.color}">
                            ${heroClass.icon} ${heroClass.name}
                        </div>
                    </div>
                    ${isActive ? '<div class="active-badge">⭐ Active</div>' : ''}
                </div>
                
                <div class="hero-stats">
                    <div class="stat-row">
                        <span>⚔️ Attack: ${hero.stats.attack}</span>
                        <span>🛡️ Defense: ${hero.stats.defense}</span>
                    </div>
                    <div class="stat-row">
                        <span>⚡ Speed: ${hero.stats.speed}</span>
                        <span>🔮 Magic: ${hero.stats.magic}</span>
                    </div>
                    <div class="hero-power">
                        <strong>💪 Power: ${power}</strong>
                    </div>
                </div>
                
                <div class="hero-actions">
                    <button class="btn btn-primary ${isActive ? 'btn-secondary' : ''}" 
                            onclick="heroGame.${isActive ? 'deactivateHero' : 'activateHero'}('${hero.id}')">
                        ${isActive ? '📤 Deactivate' : '⭐ Activate'}
                    </button>
                    <button class="btn btn-outline" onclick="heroGame.dismissHero('${hero.id}')">
                        🗑️ Dismiss
                    </button>
                </div>
            </div>
        `;
    }

    renderMissions() {
        const content = document.getElementById('missions-tab');
        if (!content) return;

        const activeMissions = this.gameState.missions.active;
        const availableMissions = this.gameState.missions.available;

        content.innerHTML = `
            <div class="missions-container">
                <div class="missions-header">
                    <h3>🎯 Hero Missions</h3>
                    <p>Send your heroes on epic quests to earn rewards</p>
                </div>

                <div class="active-missions">
                    <h4>Active Missions</h4>
                    <div class="missions-list">
                        ${activeMissions.length === 0 ? 
                            '<p class="no-missions">No active missions</p>' :
                            activeMissions.map(mission => this.renderActiveMission(mission)).join('')
                        }
                    </div>
                </div>

                <div class="available-missions">
                    <h4>Available Missions</h4>
                    <div class="missions-grid">
                        ${availableMissions.map(mission => this.renderMissionCard(mission)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderMissionCard(mission) {
        const canStart = this.canStartMission(mission);
        const hasPreferredClass = mission.preferredClasses.some(className => 
            Object.values(this.gameState.heroes.collection).some(hero => 
                hero.class === className && this.gameState.heroes.active === hero.id
            )
        );

        return `
            <div class="mission-card">
                <div class="mission-header">
                    <h5>${mission.name}</h5>
                    <span class="mission-difficulty difficulty-${mission.difficulty.toLowerCase()}">${mission.difficulty}</span>
                </div>
                
                <div class="mission-description">
                    <p>${mission.description}</p>
                </div>
                
                <div class="mission-requirements">
                    <h6>Requirements:</h6>
                    <ul>
                        <li>💪 Total Power: ${mission.requirements.totalPower}</li>
                        ${mission.requirements.hasClass ? `<li>🎭 Requires: ${this.gameState.classes[mission.requirements.hasClass].name}</li>` : ''}
                    </ul>
                </div>
                
                <div class="mission-rewards">
                    <h6>Rewards:</h6>
                    <div class="reward-list">
                        <span class="reward-item">🏆 ${mission.rewards.points} Points</span>
                        <span class="reward-item">✨ ${mission.rewards.experience} XP</span>
                    </div>
                </div>
                
                <div class="mission-preferred">
                    <h6>Preferred Classes:</h6>
                    <div class="preferred-classes">
                        ${mission.preferredClasses.map(className => {
                            const heroClass = this.gameState.classes[className];
                            return `<span class="class-tag" style="color: ${heroClass.color}">${heroClass.icon} ${heroClass.name}</span>`;
                        }).join('')}
                    </div>
                    ${hasPreferredClass ? '<div class="bonus-indicator">⭐ Class Bonus Available!</div>' : ''}
                </div>
                
                <div class="mission-actions">
                    <button class="btn btn-primary start-mission-btn" 
                            data-mission="${mission.id}"
                            ${!canStart ? 'disabled' : ''}>
                        ${canStart ? '🚀 Start Mission' : '❌ Requirements Not Met'}
                    </button>
                </div>
            </div>
        `;
    }

    renderActiveMission(mission) {
        const progress = ((mission.duration - mission.timeRemaining) / mission.duration) * 100;
        
        return `
            <div class="active-mission-card">
                <div class="mission-info">
                    <h5>${mission.name}</h5>
                    <p>Hero: ${mission.heroName}</p>
                </div>
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="time-remaining">${Math.ceil(mission.timeRemaining / 1000)}s remaining</span>
                </div>
            </div>
        `;
    }

    renderUpgrades() {
        const content = document.getElementById('upgrades-tab');
        if (!content) return;

        content.innerHTML = `
            <div class="upgrades-container">
                <div class="upgrades-header">
                    <h3>⬆️ Hero Upgrades</h3>
                    <p>Enhance all your heroes with powerful upgrades</p>
                </div>

                <div class="upgrades-grid">
                    ${Object.entries(this.gameState.upgrades).map(([upgradeId, upgrade]) => {
                        const canAfford = this.gameState.player.achievementPoints >= upgrade.cost;
                        
                        return `
                            <div class="upgrade-card ${upgrade.purchased ? 'purchased' : ''}">
                                <div class="upgrade-header">
                                    <h5>${upgrade.name}</h5>
                                    ${upgrade.purchased ? '<div class="purchased-badge">✅ Owned</div>' : ''}
                                </div>
                                
                                <div class="upgrade-description">
                                    <p>${upgrade.description}</p>
                                </div>
                                
                                <div class="upgrade-cost">
                                    <span class="cost-label">Cost:</span>
                                    <span class="cost-amount ${canAfford ? 'affordable' : 'expensive'}">
                                        🏆 ${upgrade.cost}
                                    </span>
                                </div>
                                
                                <div class="upgrade-actions">
                                    <button class="btn btn-primary upgrade-btn" 
                                            data-upgrade="${upgradeId}"
                                            ${upgrade.purchased || !canAfford ? 'disabled' : ''}>
                                        ${upgrade.purchased ? '✅ Purchased' : 
                                          canAfford ? '💰 Purchase' : '❌ Need More Points'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add upgrade button events
        content.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeId = e.target.dataset.upgrade;
                this.purchaseUpgrade(upgradeId);
            });
        });
    }

    renderClasses() {
        const content = document.getElementById('classes-tab');
        if (!content) return;

        content.innerHTML = `
            <div class="classes-container">
                <div class="classes-header">
                    <h3>🎭 Hero Classes</h3>
                    <p>Unlock new hero types and learn about their abilities</p>
                </div>

                <div class="classes-grid">
                    ${Object.entries(this.gameState.classes).map(([classId, heroClass]) => {
                        const unlocked = heroClass.unlocked;
                        const canUnlock = !unlocked && this.gameState.player.achievementPoints >= heroClass.cost;
                        
                        return `
                            <div class="class-details-card ${!unlocked ? 'locked' : ''}">
                                <div class="class-header">
                                    <div class="class-icon" style="color: ${heroClass.color}">${heroClass.icon}</div>
                                    <div class="class-info">
                                        <h4 style="color: ${heroClass.color}">${heroClass.name}</h4>
                                        <p>${heroClass.description}</p>
                                    </div>
                                    <div class="class-status">
                                        ${unlocked ? '✅ Unlocked' : '🔒 Locked'}
                                    </div>
                                </div>
                                
                                <div class="class-detailed-stats">
                                    <h5>Base Stats</h5>
                                    <div class="stats-visualization">
                                        ${Object.entries(heroClass.stats).map(([statName, value]) => `
                                            <div class="stat-bar">
                                                <span class="stat-name">${statName.toUpperCase()}</span>
                                                <div class="stat-track">
                                                    <div class="stat-fill" style="width: ${(value / 10) * 100}%; background: ${heroClass.color}"></div>
                                                </div>
                                                <span class="stat-number">${value}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                ${!unlocked ? `
                                    <div class="unlock-section">
                                        <div class="unlock-cost">
                                            <span class="cost-label">Unlock Cost:</span>
                                            <span class="cost-amount ${canUnlock ? 'affordable' : 'expensive'}">
                                                🏆 ${heroClass.cost}
                                            </span>
                                        </div>
                                        <button class="btn btn-primary unlock-btn" 
                                                data-class="${classId}"
                                                ${!canUnlock ? 'disabled' : ''}>
                                            ${canUnlock ? '🔓 Unlock Class' : '❌ Need More Points'}
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add unlock button events
        content.querySelectorAll('.unlock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = e.target.dataset.class;
                this.unlockClass(classId);
            });
        });
    }

    // Game Actions
    forgeHero(classId) {
        const heroClass = this.gameState.classes[classId];
        if (!heroClass.unlocked || this.gameState.player.achievementPoints < heroClass.cost) return;

        // Check hero slots
        const currentHeroes = Object.keys(this.gameState.heroes.collection).length;
        if (currentHeroes >= this.gameState.heroes.slots) {
            window.SharedComponents.showNotification({
                type: 'warning',
                title: 'No Space',
                message: 'You need to dismiss a hero or upgrade your slots first!'
            });
            return;
        }

        // Show forging animation
        const forgeProcess = document.getElementById('forgeProcess');
        if (forgeProcess) {
            forgeProcess.style.display = 'block';
            
            let progress = 0;
            const forgeInterval = setInterval(() => {
                progress += 2;
                const progressBar = document.getElementById('forgeProgress');
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
                
                if (progress >= 100) {
                    clearInterval(forgeInterval);
                    this.completeHeroForging(classId);
                    forgeProcess.style.display = 'none';
                }
            }, 30);
        } else {
            this.completeHeroForging(classId);
        }
    }

    completeHeroForging(classId) {
        const heroClass = this.gameState.classes[classId];
        
        // Deduct cost
        this.gameState.player.achievementPoints -= heroClass.cost;
        
        // Generate hero
        const hero = this.generateHero(classId);
        this.gameState.heroes.collection[hero.id] = hero;
        this.gameState.stats.heroesCreated++;
        
        window.SharedComponents.showNotification({
            type: 'achievement',
            title: 'Hero Forged!',
            message: `${hero.name} the ${heroClass.name} has joined your collection!`,
            duration: 6000
        });
        
        this.updateStats();
        this.renderForge();
        this.renderCollection();
    }

    generateHero(classId) {
        const heroClass = this.gameState.classes[classId];
        const names = [
            'Aiden', 'Aria', 'Bram', 'Cora', 'Dex', 'Emi', 'Finn', 'Gwen',
            'Hal', 'Ivy', 'Jax', 'Kira', 'Leo', 'Maya', 'Nyx', 'Orion',
            'Pike', 'Quinn', 'Raven', 'Sage', 'Titus', 'Uma', 'Vex', 'Wren',
            'Xara', 'Yuki', 'Zara'
        ];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        // Apply upgrade modifiers
        const baseStats = { ...heroClass.stats };
        Object.entries(this.gameState.upgrades).forEach(([upgradeId, upgrade]) => {
            if (upgrade.purchased) {
                switch (upgrade.effect) {
                    case 'attack_boost':
                        baseStats.attack = Math.floor(baseStats.attack * upgrade.value);
                        break;
                    case 'defense_boost':
                        baseStats.defense = Math.floor(baseStats.defense * upgrade.value);
                        break;
                    case 'speed_boost':
                        baseStats.speed = Math.floor(baseStats.speed * upgrade.value);
                        break;
                    case 'magic_boost':
                        baseStats.magic = Math.floor(baseStats.magic * upgrade.value);
                        break;
                }
            }
        });
        
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: randomName,
            class: classId,
            stats: baseStats,
            level: 1,
            experience: 0,
            createdAt: Date.now()
        };
    }

    unlockClass(classId) {
        const heroClass = this.gameState.classes[classId];
        if (heroClass.unlocked || this.gameState.player.achievementPoints < heroClass.cost) return;

        this.gameState.player.achievementPoints -= heroClass.cost;
        heroClass.unlocked = true;

        window.SharedComponents.showNotification({
            type: 'success',
            title: 'Class Unlocked!',
            message: `${heroClass.name} class is now available for hero creation!`
        });

        this.updateStats();
        this.renderClasses();
        this.renderForge();
    }

    purchaseUpgrade(upgradeId) {
        const upgrade = this.gameState.upgrades[upgradeId];
        if (upgrade.purchased || this.gameState.player.achievementPoints < upgrade.cost) return;

        this.gameState.player.achievementPoints -= upgrade.cost;
        upgrade.purchased = true;

        // Apply effect if it's slots increase
        if (upgrade.effect === 'slots_increase') {
            this.gameState.heroes.slots += upgrade.value;
        }

        window.SharedComponents.showNotification({
            type: 'success',
            title: 'Upgrade Purchased!',
            message: `${upgrade.name} has been applied to all your heroes!`
        });

        this.updateStats();
        this.renderUpgrades();
        this.renderCollection();
    }

    activateHero(heroId) {
        this.gameState.heroes.active = heroId;
        this.renderCollection();
        this.updateStats();
    }

    deactivateHero(heroId) {
        if (this.gameState.heroes.active === heroId) {
            this.gameState.heroes.active = null;
        }
        this.renderCollection();
        this.updateStats();
    }

    dismissHero(heroId) {
        if (confirm('Are you sure you want to dismiss this hero? This cannot be undone.')) {
            delete this.gameState.heroes.collection[heroId];
            if (this.gameState.heroes.active === heroId) {
                this.gameState.heroes.active = null;
            }
            this.renderCollection();
            this.updateStats();
        }
    }

    dismissAllHeroes() {
        if (confirm('Are you sure you want to dismiss ALL heroes? This cannot be undone.')) {
            this.gameState.heroes.collection = {};
            this.gameState.heroes.active = null;
            this.renderCollection();
            this.updateStats();
        }
    }

    canStartMission(mission) {
        const totalPower = this.calculateTotalPower();
        const meetsBasicReqs = totalPower >= mission.requirements.totalPower;
        
        if (mission.requirements.hasClass) {
            const hasRequiredClass = Object.values(this.gameState.heroes.collection).some(hero => 
                hero.class === mission.requirements.hasClass
            );
            return meetsBasicReqs && hasRequiredClass;
        }
        
        return meetsBasicReqs;
    }

    startMission(missionId) {
        const mission = this.gameState.missions.available.find(m => m.id === missionId);
        if (!mission || !this.canStartMission(mission)) return;

        const activeHero = Object.values(this.gameState.heroes.collection).find(hero => 
            hero.id === this.gameState.heroes.active
        );
        
        if (!activeHero) {
            window.SharedComponents.showNotification({
                type: 'warning',
                title: 'No Active Hero',
                message: 'You need to activate a hero before starting missions!'
            });
            return;
        }

        const activeMission = {
            ...mission,
            heroId: activeHero.id,
            heroName: activeHero.name,
            timeRemaining: mission.duration * 1000, // Convert to milliseconds
            startedAt: Date.now()
        };

        this.gameState.missions.active.push(activeMission);
        
        window.SharedComponents.showNotification({
            type: 'info',
            title: 'Mission Started!',
            message: `${activeHero.name} has embarked on: ${mission.name}`
        });

        this.renderMissions();
    }

    // Helper Methods
    calculateHeroPower(hero) {
        return hero.stats.attack + hero.stats.defense + hero.stats.speed + hero.stats.magic;
    }

    calculateTotalPower() {
        return Object.values(this.gameState.heroes.collection)
            .reduce((total, hero) => total + this.calculateHeroPower(hero), 0);
    }

    updateStats() {
        this.gameState.stats.totalPower = this.calculateTotalPower();
        
        // Update header stats
        const headerStats = {
            points: { icon: '🏆', value: this.gameState.player.achievementPoints },
            level: { icon: '⭐', value: this.gameState.player.level },
            heroes: { icon: '🦸', value: Object.keys(this.gameState.heroes.collection).length }
        };

        // Update stat displays
        Object.entries(headerStats).forEach(([key, stat]) => {
            const element = document.getElementById(`${key}Stat`);
            if (element) {
                element.textContent = stat.value;
            }
        });
    }

    // Game Loop
    startGameLoop() {
        this.updateInterval = setInterval(() => {
            this.updateMissions();
            this.updateStats();
        }, 1000);

        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, 10000);
    }

    updateMissions() {
        this.gameState.missions.active = this.gameState.missions.active.filter(mission => {
            mission.timeRemaining -= 1000;
            
            if (mission.timeRemaining <= 0) {
                this.completeMission(mission);
                return false;
            }
            return true;
        });
    }

    completeMission(mission) {
        // Calculate rewards
        let pointsReward = mission.rewards.points;
        let experienceReward = mission.rewards.experience;
        
        // Check for class bonus
        const hero = this.gameState.heroes.collection[mission.heroId];
        if (hero && mission.preferredClasses.includes(hero.class)) {
            pointsReward = Math.floor(pointsReward * 1.5);
            experienceReward = Math.floor(experienceReward * 1.5);
        }
        
        // Award rewards
        this.gameState.player.achievementPoints += pointsReward;
        this.gameState.player.experience += experienceReward;
        this.gameState.stats.missionsCompleted++;
        
        // Add to completed missions
        this.gameState.missions.completed.push({
            ...mission,
            completedAt: Date.now(),
            pointsEarned: pointsReward,
            experienceEarned: experienceReward
        });
        
        window.SharedComponents.showNotification({
            type: 'achievement',
            title: 'Mission Complete!',
            message: `${mission.heroName} returned from ${mission.name}! Earned ${pointsReward} points!`,
            duration: 6000
        });
    }

    renderAll() {
        this.renderForge();
        this.updateStats();
    }

    addCenterWelcomeText() {
        const gameMain = document.querySelector('.hero-crafting-container') || document.body;
        
        // Remove any existing welcome text
        const existingWelcome = gameMain.querySelector('.center-welcome-text');
        if (existingWelcome) existingWelcome.remove();
        
        // Create center welcome text
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'center-welcome-text';
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 400px;
            z-index: 1000;
        `;
        welcomeDiv.innerHTML = `
            <h2>🦸 HERO FORGE 🦸</h2>
            <p>Transform achievements into legendary heroes!</p>
            <small>Click anywhere to start forging...</small>
        `;
        
        // Add click handler to remove welcome text
        welcomeDiv.addEventListener('click', () => welcomeDiv.remove());
        
        gameMain.appendChild(welcomeDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (welcomeDiv.parentNode) welcomeDiv.remove();
        }, 5000);
    }

    // Save/Load System
    saveGame() {
        this.gameState.lastSave = Date.now();
        if (window.gameManager) {
            window.gameManager.userSystem.saveGameData('heroCrafting', this.gameState);
        }
    }

    loadGameState(savedState) {
        if (savedState) {
            this.gameState = { ...this.gameState, ...savedState };
            this.loadAchievementPoints(); // Refresh achievement points
            this.renderAll();
        }
    }

    getGameState() {
        return this.gameState;
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    }
}

// Additional CSS for Hero Crafting Game
const heroCraftingCSS = `
.hero-forge-container {
    padding: 1rem;
}

.forge-header {
    text-align: center;
    margin-bottom: 2rem;
}

.achievement-points {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    margin-top: 1rem;
}

.class-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.class-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
    transition: all 0.2s ease;
}

.class-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.class-card.locked {
    opacity: 0.6;
    background: #f9fafb;
}

.class-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    position: relative;
}

.class-icon {
    font-size: 2.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    padding: 0.75rem;
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.class-info h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 700;
}

.class-info p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
}

.locked-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: #6b7280;
    color: white;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.class-stats {
    margin: 1rem 0;
}

.stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
}

.class-cost {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f1f5f9;
    border-radius: 8px;
}

.cost-amount.affordable {
    color: #059669;
}

.cost-amount.expensive {
    color: #dc2626;
}

.forge-process {
    text-align: center;
    padding: 2rem;
    background: #f8fafc;
    border-radius: 12px;
    margin-top: 2rem;
}

.forge-animation {
    font-size: 3rem;
    margin: 1rem 0;
}

.progress-bar {
    width: 100%;
    height: 12px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    margin-top: 1rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #d97706);
    border-radius: 6px;
    transition: width 0.3s ease;
}

.hero-collection {
    padding: 1rem;
}

.collection-header {
    text-align: center;
    margin-bottom: 2rem;
}

.collection-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-top: 1rem;
    font-weight: 600;
}

.heroes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.empty-collection {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.hero-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
    transition: all 0.2s ease;
}

.hero-card.active {
    border-color: #f59e0b;
    box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
}

.hero-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.hero-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    position: relative;
}

.hero-icon {
    font-size: 2.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    padding: 0.75rem;
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
}

.hero-class-indicator {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid;
}

.active-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: #f59e0b;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.hero-stats {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.hero-power {
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    color: #7c3aed;
}

.hero-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.missions-container {
    padding: 1rem;
}

.missions-header {
    text-align: center;
    margin-bottom: 2rem;
}

.missions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.mission-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
}

.mission-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.mission-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.mission-difficulty {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
}

.difficulty-easy {
    background: #d1fae5;
    color: #065f46;
}

.difficulty-medium {
    background: #fef3c7;
    color: #92400e;
}

.difficulty-hard {
    background: #fee2e2;
    color: #991b1b;
}

.mission-requirements ul {
    margin: 0.5rem 0;
    padding-left: 1rem;
}

.mission-rewards {
    margin: 1rem 0;
}

.reward-list {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
}

.reward-item {
    padding: 0.25rem 0.5rem;
    background: #f0fdf4;
    color: #166534;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
}

.preferred-classes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
}

.class-tag {
    padding: 0.25rem 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
}

.bonus-indicator {
    margin-top: 0.5rem;
    color: #f59e0b;
    font-weight: 600;
    font-size: 0.9rem;
}

.active-mission-card {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    margin-bottom: 1rem;
}

.mission-info {
    margin-bottom: 1rem;
}

.mission-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.upgrades-container {
    padding: 1rem;
}

.upgrades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.upgrade-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
    transition: all 0.2s ease;
}

.upgrade-card.purchased {
    border-color: #10b981;
    background: #f0fdf4;
}

.upgrade-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.upgrade-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.purchased-badge {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.classes-container {
    padding: 1rem;
}

.class-details-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
    transition: all 0.2s ease;
    margin-bottom: 1.5rem;
}

.class-details-card.locked {
    opacity: 0.7;
    background: #f9fafb;
}

.class-status {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
}

.class-detailed-stats {
    margin: 1.5rem 0;
}

.stats-visualization {
    margin-top: 1rem;
}

.stat-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.stat-name {
    min-width: 60px;
    font-weight: 600;
    font-size: 0.8rem;
}

.stat-track {
    flex: 1;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.stat-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.stat-number {
    min-width: 30px;
    text-align: right;
    font-weight: 600;
}

.unlock-section {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    text-align: center;
}

.unlock-cost {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .class-grid,
    .heroes-grid,
    .missions-grid,
    .upgrades-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .collection-stats {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .hero-actions {
        flex-direction: column;
    }
    
    .mission-progress {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .stat-grid {
        grid-template-columns: 1fr;
    }
    
    .reward-list {
        flex-direction: column;
        gap: 0.5rem;
    }
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    body:not(.light-theme) .class-card,
    body:not(.light-theme) .hero-card,
    body:not(.light-theme) .mission-card,
    body:not(.light-theme) .upgrade-card,
    body:not(.light-theme) .class-details-card,
    body:not(.light-theme) .active-mission-card {
        background: #1f2937;
        border-color: rgba(255, 255, 255, 0.1);
        color: #f9fafb;
    }
    
    body:not(.light-theme) .class-card.locked,
    body:not(.light-theme) .class-details-card.locked {
        background: #374151;
    }
    
    body:not(.light-theme) .hero-info h4,
    body:not(.light-theme) .class-info h5 {
        color: #f9fafb;
    }
    
    body:not(.light-theme) .hero-stats,
    body:not(.light-theme) .class-cost,
    body:not(.light-theme) .unlock-section {
        background: rgba(17, 24, 39, 0.8);
    }
    
    body:not(.light-theme) .stat-item {
        background: rgba(17, 24, 39, 0.6);
        color: #f9fafb;
    }
}

body.dark-theme .class-card,
body.dark-theme .hero-card,
body.dark-theme .mission-card,
body.dark-theme .upgrade-card,
body.dark-theme .class-details-card,
body.dark-theme .active-mission-card {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
}

body.dark-theme .class-card.locked,
body.dark-theme .class-details-card.locked {
    background: #374151;
}

body.dark-theme .hero-info h4,
body.dark-theme .class-info h5 {
    color: #f9fafb;
}

body.dark-theme .hero-stats,
body.dark-theme .class-cost,
body.dark-theme .unlock-section {
    background: rgba(17, 24, 39, 0.8);
}

body.dark-theme .stat-item {
    background: rgba(17, 24, 39, 0.6);
    color: #f9fafb;
}
`;

// Inject the CSS
const heroStyleSheet = document.createElement('style');
heroStyleSheet.textContent = heroCraftingCSS;
document.head.appendChild(heroStyleSheet);

// Global access
window.HeroCraftingGame = HeroCraftingGame;
window.heroGame = null; // Will be set when game is launched