// Hearthstone Battlegrounds Game Implementation
class HearthstoneBattlegrounds {
    constructor() {
        this.tribes = {
            beast: { name: 'Beast', icon: '🐺', color: '#2d7a2d' },
            demon: { name: 'Demon', icon: '👹', color: '#8b0000' },
            dragon: { name: 'Dragon', icon: '🐉', color: '#4169e1' },
            elemental: { name: 'Elemental', icon: '🔥', color: '#ff4500' },
            mech: { name: 'Mech', icon: '🤖', color: '#708090' },
            murloc: { name: 'Murloc', icon: '🐟', color: '#20b2aa' },
            naga: { name: 'Naga', icon: '🐍', color: '#9932cc' },
            pirate: { name: 'Pirate', icon: '🏴‍☠️', color: '#8b4513' },
            quillboar: { name: 'Quillboar', icon: '🐗', color: '#daa520' },
            undead: { name: 'Undead', icon: '💀', color: '#2f4f4f' }
        };

        this.heroes = [
            { name: 'A. F. Kay', winrate: 42.5, description: 'Get two minions from a higher Tavern Tier' },
            { name: 'Al\'Akir the Windlord', winrate: 48.2, description: 'Windfury minions' },
            { name: 'Aranna Starseeker', winrate: 52.1, description: 'First Reborn minion each turn' },
            { name: 'Chenvaala', winrate: 46.8, description: 'Elemental synergies' },
            { name: 'Cookie the Cook', winrate: 51.3, description: 'Murloc synergies' },
            { name: 'Curator', winrate: 49.7, description: 'Triple rewards' },
            { name: 'Dancin\' Deryl', winrate: 47.9, description: 'Attack/Health bonuses from selling' },
            { name: 'Deathwing', winrate: 44.6, description: 'ALL minions have +3 Attack' },
            { name: 'Edwin VanCleef', winrate: 50.8, description: 'Minion cost reduction' },
            { name: 'Elise Starseeker', winrate: 48.9, description: 'Recruit phase bonuses' },
            { name: 'Flurgl', winrate: 45.2, description: 'Murloc synergies' },
            { name: 'Fungalmancer Flurgl', winrate: 47.1, description: 'Murloc transformation' },
            { name: 'Galakrond', winrate: 46.3, description: 'Minion replacement' },
            { name: 'George the Fallen', winrate: 43.8, description: 'Divine Shield synergies' },
            { name: 'Guff Runetotem', winrate: 49.5, description: 'Elemental synergies' },
            { name: 'Illidan Stormrage', winrate: 48.4, description: 'Left and Rightmost minion bonuses' },
            { name: 'Jandice Barov', winrate: 50.2, description: 'Minion swapping' },
            { name: 'Kael\'thas Sunstrider', winrate: 47.6, description: 'Every third minion is Golden' },
            { name: 'King Mukla', winrate: 45.9, description: 'Banana synergies' },
            { name: 'Lich Baz\'hial', winrate: 48.7, description: 'Take damage for rewards' },
            { name: 'Lord Barov', winrate: 49.1, description: 'Combat damage bonuses' },
            { name: 'Millhouse Manastorm', winrate: 44.1, description: 'Reduced minion costs' },
            { name: 'Millificent Manastorm', winrate: 51.7, description: 'Mech synergies' },
            { name: 'Mutanus the Devourer', winrate: 48.3, description: 'Deathrattle synergies' },
            { name: 'N\'Zoth', winrate: 46.4, description: 'Deathrattle bonuses' },
            { name: 'Omu', winrate: 50.6, description: 'Extra gold generation' },
            { name: 'Patches the Pirate', winrate: 47.8, description: 'Pirate synergies' },
            { name: 'Pyramad', winrate: 44.7, description: 'Health bonuses' },
            { name: 'Queen Wagtoggle', winrate: 48.6, description: 'Discovers and golden minions' },
            { name: 'Ragnaros the Firelord', winrate: 49.3, description: 'Kill minions for sulfuras' },
            { name: 'Rakanishu', winrate: 46.1, description: 'Overload synergies' },
            { name: 'Reno Jackson', winrate: 52.8, description: 'Make minions Golden' },
            { name: 'Rokara', winrate: 48.8, description: 'Gain health when minions attack' },
            { name: 'Silas Darkmoon', winrate: 47.3, description: 'Highest Attack minion gets bonus' },
            { name: 'Sir Finley Mrrgglton', winrate: 50.4, description: 'Choose from different Hero Powers' },
            { name: 'Skycap\'n Kragg', winrate: 46.9, description: 'Pirate cost reduction' },
            { name: 'Tamsin Roame', winrate: 49.8, description: 'Damage synergies' },
            { name: 'Tess Greymane', winrate: 51.2, description: 'Get minions of different tribes' },
            { name: 'The Curator', winrate: 49.7, description: 'Amalgam synergies' },
            { name: 'The Great Akazamzarak', winrate: 45.5, description: 'Spell synergies' },
            { name: 'The Lich King', winrate: 48.1, description: 'Reborn synergies' },
            { name: 'The Rat King', winrate: 49.9, description: 'Rotating tribal bonuses' },
            { name: 'Tickatus', winrate: 47.4, description: 'Darkmoon Prizes' },
            { name: 'Trade Prince Gallywix', winrate: 50.9, description: 'Extra gold economy' },
            { name: 'Vanndar Stormpike', winrate: 48.5, description: 'Cost reduction synergies' },
            { name: 'Vol\'jin', winrate: 49.6, description: 'Minion swapping abilities' },
            { name: 'Y\'Shaarj', winrate: 52.3, description: 'End of turn recruit synergies' },
            { name: 'Yogg-Saron, Hope\'s End', winrate: 46.8, description: 'Random spells' },
            { name: 'Zephrys, the Great', winrate: 50.1, description: 'Wish for perfect cards' }
        ];

        this.selectedTribes = new Set();
        this.selectedHero = null;
        this.recommendations = null;
        this.isLoaded = false;
        
        this.init();
    }

    init() {
        this.createGameInterface();
        this.setupEventHandlers();
        this.isLoaded = true;
    }

    createGameInterface() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        gameContainer.innerHTML = `
            <header class="game-header">
                <div class="company-info">
                    <h1 id="companyName">🔥 Hearthstone Battlegrounds</h1>
                    <div class="level-info">
                        <span>Strategy Guide</span>
                        <span class="separator"> | </span>
                        <span id="companyType">Win Rate Optimizer</span>
                    </div>
                </div>
                <div class="resources">
                    <div class="resource">
                        <span class="resource-icon">🏆</span>
                        <span id="winRate">Select Hero & Tribes</span>
                    </div>
                    <div class="resource">
                        <span class="resource-icon">📊</span>
                        <span id="confidence">Get Recommendations</span>
                    </div>
                </div>
            </header>

            <main class="game-main">
                <div class="tabs">
                    <button class="tab-btn active" data-tab="tribes">🏴‍☠️ Tribes</button>
                    <button class="tab-btn" data-tab="heroes">🦸 Heroes</button>
                    <button class="tab-btn" data-tab="strategy">📋 Strategy</button>
                </div>

                <div class="tab-content active" id="tribes-tab">
                    <div class="section-header">
                        <h3>Select Active Tribes</h3>
                        <p>Choose the tribes available in this game. Typically 5-7 tribes are active.</p>
                    </div>
                    <div class="tribes-grid" id="tribesGrid">
                        ${this.renderTribes()}
                    </div>
                </div>

                <div class="tab-content" id="heroes-tab">
                    <div class="section-header">
                        <h3>Choose Your Hero</h3>
                        <p>Search and select your hero to get personalized recommendations.</p>
                    </div>
                    <div class="hero-search">
                        <input type="text" id="heroSearch" placeholder="Search heroes..." class="hero-search-input">
                        <div class="hero-filters">
                            <button class="filter-btn" data-sort="winrate">📈 Sort by Win Rate</button>
                            <button class="filter-btn" data-sort="name">🔤 Sort by Name</button>
                        </div>
                    </div>
                    <div class="heroes-grid" id="heroesGrid">
                        ${this.renderHeroes()}
                    </div>
                </div>

                <div class="tab-content" id="strategy-tab">
                    <div class="strategy-container" id="strategyContainer">
                        ${this.renderStrategy()}
                    </div>
                </div>
            </main>

            <footer class="game-footer">
                <div class="footer-content">
                    <div class="footer-left">
                        <button id="backToMenu" class="btn btn-outline">
                            🏠 Back to Dashboard
                        </button>
                    </div>
                    <div class="footer-right">
                        <span class="data-source">Data from HSReplay.net</span>
                    </div>
                </div>
            </footer>
        `;
    }

    renderTribes() {
        return Object.entries(this.tribes).map(([key, tribe]) => `
            <div class="tribe-card" data-tribe="${key}">
                <div class="tribe-icon" style="background-color: ${tribe.color}20; border: 2px solid ${tribe.color};">
                    ${tribe.icon}
                </div>
                <div class="tribe-name">${tribe.name}</div>
            </div>
        `).join('');
    }

    renderHeroes() {
        return this.heroes.map(hero => `
            <div class="hero-card" data-hero="${hero.name}">
                <div class="hero-header">
                    <h4 class="hero-name">${hero.name}</h4>
                    <div class="hero-winrate ${this.getWinrateClass(hero.winrate)}">${hero.winrate}%</div>
                </div>
                <div class="hero-description">${hero.description}</div>
                <div class="hero-meta">
                    <span class="winrate-indicator">🏆 ${this.getWinrateText(hero.winrate)}</span>
                </div>
            </div>
        `).join('');
    }

    getWinrateClass(winrate) {
        if (winrate >= 52) return 'winrate-high';
        if (winrate >= 48) return 'winrate-medium';
        return 'winrate-low';
    }

    getWinrateText(winrate) {
        if (winrate >= 52) return 'Strong';
        if (winrate >= 48) return 'Viable';
        return 'Weak';
    }

    renderStrategy() {
        if (!this.selectedHero || this.selectedTribes.size === 0) {
            return `
                <div class="strategy-placeholder">
                    <div class="placeholder-icon">🎯</div>
                    <h3>Ready for Strategy?</h3>
                    <p>Select your hero and active tribes to get personalized recommendations for maximizing your win rate.</p>
                    <div class="placeholder-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <span class="step-text">Choose 5-7 active tribes</span>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <span class="step-text">Select your hero</span>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <span class="step-text">Get win-rate optimized strategy</span>
                        </div>
                    </div>
                </div>
            `;
        }

        return this.generateStrategy();
    }

    generateStrategy() {
        const hero = this.heroes.find(h => h.name === this.selectedHero);
        const selectedTribesArray = Array.from(this.selectedTribes);
        
        // Simulate recommendations based on selected hero and tribes
        const bestTribes = this.getBestTribesForHero(hero, selectedTribesArray);
        const strategy = this.getHeroStrategy(hero);
        
        return `
            <div class="strategy-content">
                <div class="strategy-header">
                    <h3>Strategy for ${hero.name}</h3>
                    <div class="overall-rating ${this.getWinrateClass(hero.winrate)}">
                        ${hero.winrate}% Win Rate
                    </div>
                </div>

                <div class="strategy-section">
                    <h4>🎯 Recommended Tribes</h4>
                    <div class="recommended-tribes">
                        ${bestTribes.map(tribe => `
                            <div class="recommended-tribe">
                                <span class="tribe-icon">${this.tribes[tribe].icon}</span>
                                <span class="tribe-name">${this.tribes[tribe].name}</span>
                                <span class="tribe-strength">Strong</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="strategy-section">
                    <h4>📈 Turn-by-Turn Strategy</h4>
                    <div class="turn-strategy">
                        ${strategy.turns.map((turn, index) => `
                            <div class="turn-card">
                                <div class="turn-header">
                                    <span class="turn-number">Turn ${index + 1}</span>
                                    <span class="turn-tavern">Tavern ${Math.min(Math.floor(index / 2) + 1, 6)}</span>
                                </div>
                                <div class="turn-advice">${turn}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="strategy-section">
                    <h4>💡 Key Tips</h4>
                    <div class="strategy-tips">
                        ${strategy.tips.map(tip => `
                            <div class="tip-item">
                                <span class="tip-icon">💡</span>
                                <span class="tip-text">${tip}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="strategy-section">
                    <h4>⚠️ Avoid These Mistakes</h4>
                    <div class="strategy-warnings">
                        ${strategy.warnings.map(warning => `
                            <div class="warning-item">
                                <span class="warning-icon">⚠️</span>
                                <span class="warning-text">${warning}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getBestTribesForHero(hero, availableTribes) {
        // Simulate tribe recommendations based on hero synergies
        const heroTribeMap = {
            'Cookie the Cook': ['murloc', 'beast'],
            'Flurgl': ['murloc', 'beast'],
            'Fungalmancer Flurgl': ['murloc'],
            'Millificent Manastorm': ['mech'],
            'Skycap\'n Kragg': ['pirate'],
            'Patches the Pirate': ['pirate', 'beast'],
            'Chenvaala': ['elemental'],
            'Guff Runetotem': ['elemental', 'beast'],
            'N\'Zoth': ['undead'],
            'The Lich King': ['undead'],
            'George the Fallen': ['mech', 'undead']
        };

        const recommended = heroTribeMap[hero.name] || [];
        return recommended.filter(tribe => availableTribes.includes(tribe)).slice(0, 3)
            .concat(availableTribes.filter(tribe => !recommended.includes(tribe)).slice(0, 2));
    }

    getHeroStrategy(hero) {
        // Generate turn-by-turn strategy based on hero
        const baseStrategy = {
            turns: [
                "Focus on economy and hero power usage. Look for early game tempo plays.",
                "Start building your board with tier 1-2 minions. Use hero power when beneficial.",
                "Consider first upgrade to Tavern Tier 2. Look for pairs and synergies.",
                "Upgrade to Tavern Tier 3. Start looking for your core tribal synergies.",
                "Stabilize your board and health. Look for key tier 3 units.",
                "Push for Tavern Tier 4 if stable, or stay and build strong board.",
                "Mid-game power spike. Look for tier 4 carries and strong triples.",
                "Late game positioning. Focus on final comp and positioning."
            ],
            tips: [
                `Maximize ${hero.name}'s hero power potential`,
                "Prioritize health preservation in early-mid game",
                "Look for natural triples rather than forcing them",
                "Position minions based on opponent's likely attacks"
            ],
            warnings: [
                "Don't over-level too early without board strength",
                "Don't ignore positioning in late game",
                "Don't tunnel on one strategy if it's not appearing"
            ]
        };

        // Customize based on specific hero
        if (hero.name.includes('Cook') || hero.name.includes('Flurgl')) {
            baseStrategy.tips.unshift("Focus heavily on Murloc synergies");
            baseStrategy.tips.push("Poisonous Murlocs are your win condition");
        }
        
        if (hero.name.includes('Millificent')) {
            baseStrategy.tips.unshift("Magnetize effects are crucial for scaling");
            baseStrategy.tips.push("Look for Mech tribal units early");
        }

        return baseStrategy;
    }

    setupEventHandlers() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Tribe selection
        document.querySelectorAll('.tribe-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.toggleTribe(e.currentTarget.dataset.tribe);
            });
        });

        // Hero selection
        document.querySelectorAll('.hero-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectHero(e.currentTarget.dataset.hero);
            });
        });

        // Hero search
        const heroSearch = document.getElementById('heroSearch');
        if (heroSearch) {
            heroSearch.addEventListener('input', (e) => {
                this.filterHeroes(e.target.value);
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sortHeroes(e.target.dataset.sort);
            });
        });

        // Back to dashboard
        const backBtn = document.getElementById('backToMenu');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.gameMenu) {
                    window.gameMenu.returnToDashboard();
                }
            });
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Refresh strategy tab if needed
        if (tabName === 'strategy') {
            document.getElementById('strategyContainer').innerHTML = this.renderStrategy();
        }
    }

    toggleTribe(tribeKey) {
        const card = document.querySelector(`[data-tribe="${tribeKey}"]`);
        
        if (this.selectedTribes.has(tribeKey)) {
            this.selectedTribes.delete(tribeKey);
            card.classList.remove('selected');
        } else {
            this.selectedTribes.add(tribeKey);
            card.classList.add('selected');
        }

        this.updateHeader();
    }

    selectHero(heroName) {
        // Clear previous selection
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new hero
        this.selectedHero = heroName;
        document.querySelector(`[data-hero="${heroName}"]`).classList.add('selected');
        
        this.updateHeader();
    }

    updateHeader() {
        const winRateElement = document.getElementById('winRate');
        const confidenceElement = document.getElementById('confidence');

        if (this.selectedHero && this.selectedTribes.size > 0) {
            const hero = this.heroes.find(h => h.name === this.selectedHero);
            winRateElement.textContent = `${hero.winrate}% Win Rate`;
            confidenceElement.textContent = `${this.selectedTribes.size} Tribes Selected`;
        } else {
            winRateElement.textContent = 'Select Hero & Tribes';
            confidenceElement.textContent = 'Get Recommendations';
        }
    }

    filterHeroes(searchTerm) {
        const heroes = document.querySelectorAll('.hero-card');
        heroes.forEach(hero => {
            const heroName = hero.dataset.hero.toLowerCase();
            const isMatch = heroName.includes(searchTerm.toLowerCase());
            hero.style.display = isMatch ? 'block' : 'none';
        });
    }

    sortHeroes(sortBy) {
        const heroesGrid = document.getElementById('heroesGrid');
        let sortedHeroes = [...this.heroes];

        if (sortBy === 'winrate') {
            sortedHeroes.sort((a, b) => b.winrate - a.winrate);
        } else if (sortBy === 'name') {
            sortedHeroes.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.heroes = sortedHeroes;
        heroesGrid.innerHTML = this.renderHeroes();
        
        // Re-attach hero selection events
        document.querySelectorAll('.hero-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectHero(e.currentTarget.dataset.hero);
            });
        });

        // Re-select current hero if any
        if (this.selectedHero) {
            document.querySelector(`[data-hero="${this.selectedHero}"]`)?.classList.add('selected');
        }
    }

    // Game lifecycle methods
    start() {
        this.isLoaded = true;
    }

    stop() {
        this.isLoaded = false;
    }

    reset() {
        this.selectedTribes.clear();
        this.selectedHero = null;
        this.updateHeader();
        
        // Clear all selections visually
        document.querySelectorAll('.tribe-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelectorAll('.hero-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }
}

// Export for use in other modules
window.HearthstoneBattlegrounds = HearthstoneBattlegrounds;