// Shared UI Component Library for All Games
class SharedComponents {
    constructor() {
        this.themes = {
            auto: { icon: '🌓', name: 'Auto' },
            light: { icon: '☀️', name: 'Light' },
            dark: { icon: '🌙', name: 'Dark' }
        };
    }

    // Create a consistent game header with navigation
    createGameHeader(config) {
        const header = document.createElement('header');
        header.className = `${config.gameType || 'game'}-header shared-game-header`;
        
        header.innerHTML = `
            <div class="game-header-content">
                <div class="game-title-section">
                    <div class="game-icon">${config.icon || '🎮'}</div>
                    <div class="game-title-info">
                        <h1>${config.title || 'Game'}</h1>
                        <p class="game-subtitle">${config.subtitle || ''}</p>
                    </div>
                </div>
                
                <div class="game-controls">
                    <div class="game-stats">
                        ${this.renderGameStats(config.stats || {})}
                    </div>
                    
                    <div class="game-actions">
                        <button id="mobileNavToggle" class="mobile-nav-toggle" title="Open menu">
                            <span class="hamburger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupHeaderEvents(header);
        return header;
    }

    // Create a consistent tab navigation system
    createTabNavigation(tabs) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'shared-tabs';
        
        tabContainer.innerHTML = `
            <div class="tab-nav">
                ${tabs.map((tab, index) => `
                    <button class="tab-btn ${index === 0 ? 'active' : ''}" 
                            data-tab="${tab.id}" 
                            title="${tab.description || tab.name}">
                        ${tab.icon} ${tab.name}
                    </button>
                `).join('')}
            </div>
            <div class="tab-content-container">
                ${tabs.map((tab, index) => `
                    <div class="tab-content ${index === 0 ? 'active' : ''}" 
                         id="${tab.id}-tab">
                        <!-- Content will be populated by individual games -->
                    </div>
                `).join('')}
            </div>
        `;

        this.setupTabEvents(tabContainer);
        return tabContainer;
    }

    // Create a consistent resource display
    createResourceDisplay(resources) {
        const resourceDisplay = document.createElement('div');
        resourceDisplay.className = 'shared-resource-display';
        
        resourceDisplay.innerHTML = `
            <div class="resource-grid">
                ${Object.entries(resources).map(([key, resource]) => `
                    <div class="resource-item" data-resource="${key}">
                        <div class="resource-icon" title="${resource.name}">${resource.icon}</div>
                        <div class="resource-info">
                            <div class="resource-amount" id="${key}Amount">${resource.amount || 0}</div>
                            <div class="resource-label">${resource.name}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        return resourceDisplay;
    }

    // Create a consistent card component
    createCard(config) {
        const card = document.createElement('div');
        card.className = `shared-card ${config.type || 'default'}-card ${config.extraClasses || ''}`;
        
        const header = config.owned > 0 ? `<div class="card-owned-badge">${config.owned}</div>` : '';
        const actions = config.actions ? this.renderCardActions(config.actions) : '';
        const cost = config.cost ? this.renderCost(config.cost) : '';
        const stats = config.stats ? this.renderStats(config.stats) : '';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">${config.icon}</div>
                <div class="card-info">
                    <h3 class="card-title">${config.title}</h3>
                    <p class="card-description">${config.description}</p>
                </div>
                ${header}
            </div>
            ${stats}
            ${cost}
            ${actions}
        `;

        if (config.onClick) {
            card.addEventListener('click', config.onClick);
        }

        return card;
    }

    // Create a progress bar component
    createProgressBar(config) {
        const progressBar = document.createElement('div');
        progressBar.className = 'shared-progress-bar';
        
        progressBar.innerHTML = `
            <div class="progress-info">
                <span class="progress-label">${config.label || 'Progress'}</span>
                <span class="progress-value">${config.current || 0}/${config.max || 100}</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" 
                     style="width: ${((config.current || 0) / (config.max || 100)) * 100}%">
                </div>
            </div>
        `;

        return progressBar;
    }

    // Create a notification system
    showNotification(config) {
        const notification = document.createElement('div');
        notification.className = `shared-notification notification-${config.type || 'info'}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(config.type)}
                </div>
                <div class="notification-text">
                    <div class="notification-title">${config.title || ''}</div>
                    <div class="notification-message">${config.message}</div>
                </div>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Auto-remove after duration
        const duration = config.duration || 4000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        return notification;
    }

    // Create hero class color coding system
    createHeroClassIndicator(heroClass) {
        const colorMap = {
            warrior: { color: '#dc2626', icon: '⚔️', name: 'Warrior' },
            mage: { color: '#7c3aed', icon: '🔮', name: 'Mage' },
            archer: { color: '#059669', icon: '🏹', name: 'Archer' },
            healer: { color: '#0891b2', icon: '💚', name: 'Healer' },
            rogue: { color: '#7c2d12', icon: '🗡️', name: 'Rogue' },
            tank: { color: '#374151', icon: '🛡️', name: 'Tank' }
        };

        const classData = colorMap[heroClass] || { color: '#6b7280', icon: '❓', name: 'Unknown' };
        
        const indicator = document.createElement('div');
        indicator.className = 'hero-class-indicator';
        indicator.style.cssText = `
            background: ${classData.color}15;
            border: 2px solid ${classData.color};
            color: ${classData.color};
            padding: 0.25rem 0.5rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        `;
        
        indicator.innerHTML = `${classData.icon} ${classData.name}`;
        return indicator;
    }

    // Helper methods
    renderGameStats(stats) {
        return Object.entries(stats).map(([key, stat]) => `
            <div class="game-stat">
                <span class="stat-icon">${stat.icon}</span>
                <span class="stat-value" id="${key}Stat">${stat.value}</span>
            </div>
        `).join('');
    }

    renderCardActions(actions) {
        return `
            <div class="card-actions">
                ${actions.map(action => `
                    <button class="btn btn-${action.type || 'primary'} ${action.class || ''}" 
                            ${action.disabled ? 'disabled' : ''}
                            onclick="${action.onclick || ''}"
                            title="${action.title || ''}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderCost(cost) {
        return `
            <div class="card-cost">
                <h6>Cost:</h6>
                <div class="cost-list">
                    ${Object.entries(cost).map(([resource, amount]) => `
                        <span class="cost-item">
                            ${this.getResourceIcon(resource)} ${amount}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderStats(stats) {
        return `
            <div class="card-stats">
                ${Object.entries(stats).map(([key, value]) => `
                    <div class="stat-row">
                        <span class="stat-label">${key}:</span>
                        <span class="stat-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getResourceIcon(resource) {
        const icons = {
            energy: '⚡',
            minerals: '⛰️',
            alloy: '🔩',
            intel: '🧠',
            money: '💰',
            wood: '🪵',
            stone: '🪨',
            metal: '🔩',
            food: '🍎',
            water: '💧',
            oxygen: '🫁',
            crystal: '💎'
        };
        return icons[resource] || '❓';
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            achievement: '🏆'
        };
        return icons[type] || 'ℹ️';
    }

    // Create mobile-friendly navigation menu
    createMobileNavMenu() {
        // Remove existing menu if any
        const existingMenu = document.querySelector('.mobile-nav-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'mobile-nav-menu';
        menu.innerHTML = `
            <div class="mobile-nav-overlay"></div>
            <div class="mobile-nav-content">
                <div class="mobile-nav-header">
                    <h3>Game Menu</h3>
                    <button class="mobile-nav-close" aria-label="Close menu">×</button>
                </div>
                <div class="mobile-nav-items">
                    <button class="mobile-nav-item" data-action="dashboard">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text">Back Home</span>
                        <span class="nav-arrow">→</span>
                    </button>
                    <button class="mobile-nav-item" data-action="settings">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-text">Settings</span>
                        <span class="nav-arrow">→</span>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.mobile-nav-item')?.dataset.action;
            if (action) {
                this.handleMobileNavAction(action);
            }
            
            // Close menu when clicking overlay or close button
            if (e.target.classList.contains('mobile-nav-overlay') || 
                e.target.classList.contains('mobile-nav-close')) {
                this.hideMobileNavMenu();
            }
        });

        document.body.appendChild(menu);
        return menu;
    }

    showMobileNavMenu() {
        let menu = document.querySelector('.mobile-nav-menu');
        if (!menu) {
            menu = this.createMobileNavMenu();
        }
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
        
        // Small delay for smooth animation
        requestAnimationFrame(() => {
            menu.classList.add('show');
        });
    }

    hideMobileNavMenu() {
        const menu = document.querySelector('.mobile-nav-menu');
        if (menu) {
            menu.classList.remove('show');
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    toggleMobileNavMenu() {
        const menu = document.querySelector('.mobile-nav-menu');
        if (menu?.classList.contains('show')) {
            this.hideMobileNavMenu();
        } else {
            this.showMobileNavMenu();
        }
    }

    handleMobileNavAction(action) {
        this.hideMobileNavMenu();
        
        switch (action) {
            case 'dashboard':
                if (window.gameManager) {
                    window.gameManager.returnToMenu();
                }
                break;
            case 'settings':
                // TODO: Implement settings modal
                alert('Settings coming soon!');
                break;
            default:
                console.log('Unknown nav menu action:', action);
        }
    }

    // Event handlers
    setupHeaderEvents(header) {
        const mobileNavToggle = header.querySelector('#mobileNavToggle');

        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileNavMenu();
            });
        }
    }

    setupTabEvents(tabContainer) {
        const tabButtons = tabContainer.querySelectorAll('.tab-btn');
        const tabContents = tabContainer.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                const targetContent = tabContainer.querySelector(`#${tabId}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Trigger custom event for game-specific handling
                const event = new CustomEvent('tabChanged', { 
                    detail: { tabId, button, content: targetContent } 
                });
                tabContainer.dispatchEvent(event);
            });
        });
    }

    // Theme management
    toggleTheme() {
        const body = document.body;
        const themes = ['auto', 'light', 'dark'];
        let currentTheme = 'auto';
        
        if (body.classList.contains('light-theme')) {
            currentTheme = 'light';
        } else if (body.classList.contains('dark-theme')) {
            currentTheme = 'dark';
        }
        
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        // Remove all theme classes
        body.classList.remove('light-theme', 'dark-theme');
        
        // Apply new theme
        if (nextTheme === 'light') {
            body.classList.add('light-theme');
        } else if (nextTheme === 'dark') {
            body.classList.add('dark-theme');
        }
        
        // Update button
        const themeButton = document.querySelector('#themeToggle');
        if (themeButton) {
            themeButton.textContent = this.themes[nextTheme].icon;
            themeButton.title = `Theme: ${this.themes[nextTheme].name}`;
        }
        
        // Save preference
        localStorage.setItem('gameTheme', nextTheme);
    }

    // Initialize theme from saved preference
    initializeTheme() {
        const savedTheme = localStorage.getItem('gameTheme') || 'auto';
        const body = document.body;
        
        body.classList.remove('light-theme', 'dark-theme');
        
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
        } else if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
        }
        
        // Update button if it exists
        const themeButton = document.querySelector('#themeToggle');
        if (themeButton) {
            themeButton.textContent = this.themes[savedTheme].icon;
            themeButton.title = `Theme: ${this.themes[savedTheme].name}`;
        }
    }
}

// CSS for shared components (injected into page)
const sharedComponentsCSS = `
/* Shared Components CSS */
.shared-game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.game-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
}

.game-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.game-title-section .game-icon {
    font-size: 2.5rem;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 12px;
    padding: 0.5rem;
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.game-title-info h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.game-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
}

.game-controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.game-stats {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.game-stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(37, 99, 235, 0.1);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
}

.game-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.game-theme-btn {
    padding: 0.5rem 0.75rem;
    font-size: 1.1rem;
    border-radius: 8px;
}

.shared-tabs {
    margin: 1rem 0;
}

.tab-nav {
    display: flex;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 0.25rem;
    gap: 0.25rem;
    overflow-x: auto;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.tab-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 0;
    color: #4b5563;
}

.tab-btn.active {
    background: #2563eb;
    color: white;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.tab-btn:not(.active):hover {
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.shared-resource-display {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.resource-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.resource-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(37, 99, 235, 0.1);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    min-width: 100px;
}

.resource-icon {
    font-size: 1.25rem;
}

.resource-amount {
    font-weight: 700;
    font-size: 1.1rem;
    color: #1f2937;
}

.resource-label {
    font-size: 0.8rem;
    color: #6b7280;
}

.shared-card {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.shared-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.card-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 10px;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
}

.card-description {
    font-size: 0.85rem;
    color: #4b5563;
    line-height: 1.3;
    margin: 0;
}

.card-owned-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: #10b981;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.card-stats {
    margin: 0.75rem 0;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
}

.stat-row:last-child {
    margin-bottom: 0;
}

.card-cost {
    margin: 0.75rem 0;
}

.card-cost h6 {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #374151;
}

.cost-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.cost-item {
    padding: 0.25rem 0.5rem;
    background: #f3f4f6;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #e5e7eb;
}

.card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.shared-progress-bar {
    margin: 0.5rem 0;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.progress-track {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.shared-notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 1100;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-left: 4px solid #3b82f6;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.shared-notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
}

.notification-icon {
    font-size: 1.5rem;
}

.notification-text {
    flex: 1;
}

.notification-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #1f2937;
}

.notification-message {
    color: #4b5563;
    font-size: 0.9rem;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-close:hover {
    color: #374151;
}

.notification-success {
    border-left-color: #10b981;
}

.notification-error {
    border-left-color: #ef4444;
}

.notification-warning {
    border-left-color: #f59e0b;
}

.notification-achievement {
    border-left-color: #8b5cf6;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
}

.notification-achievement .notification-title,
.notification-achievement .notification-message {
    color: white;
}

.hero-class-indicator {
    /* Styles are applied inline for dynamic colors */
}

/* Mobile optimizations for shared components */
@media (max-width: 768px) {
    .shared-game-header {
        padding: 0.75rem 1rem;
    }
    
    .game-header-content {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .game-title-section .game-icon {
        font-size: 2rem;
        width: 3rem;
        height: 3rem;
    }
    
    .game-title-info h1 {
        font-size: 1.25rem;
    }
    
    .game-controls {
        width: 100%;
        justify-content: space-between;
    }
    
    .game-stats {
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .resource-grid {
        gap: 0.5rem;
    }
    
    .resource-item {
        min-width: 80px;
        padding: 0.5rem;
    }
    
    .shared-notification {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
}

/* Dark mode styles for shared components */
@media (prefers-color-scheme: dark) {
    body:not(.light-theme) .shared-game-header {
        background: rgba(17, 24, 39, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    body:not(.light-theme) .game-title-info h1 {
        color: #f9fafb;
    }
    
    body:not(.light-theme) .tab-nav {
        background: rgba(17, 24, 39, 0.9);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    body:not(.light-theme) .tab-btn {
        color: #d1d5db;
    }
    
    body:not(.light-theme) .shared-resource-display,
    body:not(.light-theme) .shared-card {
        background: #1f2937;
        border-color: rgba(255, 255, 255, 0.1);
        color: #f9fafb;
    }
    
    body:not(.light-theme) .card-title {
        color: #f9fafb;
    }
    
    body:not(.light-theme) .card-description {
        color: #d1d5db;
    }
    
    body:not(.light-theme) .card-stats {
        background: rgba(17, 24, 39, 0.8);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    body:not(.light-theme) .shared-notification {
        background: #1f2937;
        color: #f9fafb;
    }
    
    body:not(.light-theme) .notification-title {
        color: #f9fafb;
    }
    
    body:not(.light-theme) .notification-message {
        color: #d1d5db;
    }
}

body.dark-theme .shared-game-header {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
}

body.dark-theme .game-title-info h1 {
    color: #f9fafb;
}

body.dark-theme .tab-nav {
    background: rgba(17, 24, 39, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
}

body.dark-theme .tab-btn {
    color: #d1d5db;
}

body.dark-theme .shared-resource-display,
body.dark-theme .shared-card {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
}

body.dark-theme .card-title {
    color: #f9fafb;
}

body.dark-theme .card-description {
    color: #d1d5db;
}

body.dark-theme .card-stats {
    background: rgba(17, 24, 39, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
}

body.dark-theme .shared-notification {
    background: #1f2937;
    color: #f9fafb;
}

body.dark-theme .notification-title {
    color: #f9fafb;
}

body.dark-theme .notification-message {
    color: #d1d5db;
}
`;

// Inject the CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = sharedComponentsCSS;
document.head.appendChild(styleSheet);

// Initialize global instance
window.SharedComponents = new SharedComponents();

// Auto-initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    window.SharedComponents.initializeTheme();
});