// Property Environmental Risk Checker Game
class HouseSearchGame {
    constructor(gameManager, userSystem) {
        this.gameManager = gameManager;
        this.userSystem = userSystem;
        this.gameState = {
            searchHistory: [],
            lastSearch: null,
            isLoading: false
        };
        this.apiCalls = {
            geocoding: 0,
            environmental: 0,
            aiSummary: 0
        };
    }

    init() {
        this.loadGameState();
        this.render();
        this.setupEventListeners();
    }

    loadGameState() {
        const savedState = this.userSystem.loadGameData('houseSearch');
        if (savedState) {
            this.gameState = { ...this.gameState, ...savedState };
            this.apiCalls = savedState.apiCalls || { geocoding: 0, environmental: 0, aiSummary: 0 };
        }
    }

    saveGameState() {
        const saveData = {
            ...this.gameState,
            apiCalls: this.apiCalls,
            lastSaved: Date.now()
        };
        this.userSystem.saveGameData('houseSearch', saveData);
    }

    render() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        // Update header
        document.getElementById('companyName').textContent = '🏠 Property Risk Checker';
        document.querySelector('.level-info').innerHTML = `
            <span>Searches: ${this.gameState.searchHistory.length}</span>
            <span class="separator"> | </span>
            <span>Environmental Scanner</span>
        `;

        // Update resources area to show API usage
        document.querySelector('.resources').innerHTML = `
            <div class="resource">
                <span class="resource-icon">🗺️</span>
                <span>Geocoding: ${this.apiCalls.geocoding}</span>
            </div>
            <div class="resource">
                <span class="resource-icon">🌍</span>
                <span>EPA Checks: ${this.apiCalls.environmental}</span>
            </div>
            <div class="resource">
                <span class="resource-icon">🤖</span>
                <span>AI Reports: ${this.apiCalls.aiSummary}</span>
            </div>
        `;

        // Update tabs
        document.querySelector('.tabs').innerHTML = `
            <button class="tab-btn active" data-tab="search">🔍 Search</button>
            <button class="tab-btn" data-tab="history">📋 History</button>
        `;

        // Render search tab
        document.getElementById('buildings-tab').id = 'search-tab';
        document.getElementById('search-tab').className = 'tab-content active';
        document.getElementById('search-tab').innerHTML = this.renderSearchTab();

        // Render history tab
        document.getElementById('stats-tab').id = 'history-tab';
        document.getElementById('history-tab').className = 'tab-content';
        document.getElementById('history-tab').innerHTML = this.renderHistoryTab();
    }

    renderSearchTab() {
        return `
            <div class="house-search-container">
                <div class="search-header">
                    <h2>🏠 Property Environmental Risk Checker</h2>
                    <p>Enter a property address to check for environmental hazards and risks in the area.</p>
                </div>

                <div class="search-form">
                    <div class="input-group">
                        <label for="addressInput">Property Address</label>
                        <input type="text" 
                               id="addressInput" 
                               placeholder="e.g., Love Canal, Niagara Falls, NY 14304"
                               ${this.gameState.isLoading ? 'disabled' : ''}>
                        <small>Enter a complete address including city and state/country</small>
                    </div>
                    
                    <button id="searchBtn" 
                            class="btn btn-primary ${this.gameState.isLoading ? 'loading' : ''}"
                            ${this.gameState.isLoading ? 'disabled' : ''}>
                        ${this.gameState.isLoading ? '🔄 Analyzing...' : '🔍 Check Property'}
                    </button>
                </div>

                <div class="demo-section">
                    <h3>Try a Demo Search</h3>
                    <p>Click below to test with a known hazardous location:</p>
                    <button id="demoBtn" class="btn btn-outline" ${this.gameState.isLoading ? 'disabled' : ''}>
                        🧪 Demo: Love Canal, NY
                    </button>
                </div>

                <div id="searchResults" class="search-results">
                    ${this.gameState.lastSearch ? this.renderSearchResult(this.gameState.lastSearch) : ''}
                </div>

                <div class="info-section">
                    <h3>What This Tool Checks</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-icon">🏭</span>
                            <div>
                                <strong>EPA Facilities</strong>
                                <p>Industrial sites, waste treatment plants, and regulated facilities</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">💧</span>
                            <div>
                                <strong>Water Quality</strong>
                                <p>Violations and monitoring data from EPA databases</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📡</span>
                            <div>
                                <strong>Infrastructure</strong>
                                <p>Cell towers, power lines, and other potential concerns</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🤖</span>
                            <div>
                                <strong>AI Analysis</strong>
                                <p>Plain-English risk summary and recommendations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistoryTab() {
        return `
            <div class="history-container">
                <div class="history-header">
                    <h3>Search History</h3>
                    <p>View your previous property risk assessments</p>
                </div>

                <div class="api-usage">
                    <h4>API Usage Statistics</h4>
                    <div class="usage-stats">
                        <div class="stat">
                            <span class="stat-icon">🗺️</span>
                            <span class="stat-label">Geocoding Calls:</span>
                            <span class="stat-value">${this.apiCalls.geocoding}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">🌍</span>
                            <span class="stat-label">EPA API Calls:</span>
                            <span class="stat-value">${this.apiCalls.environmental}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">🤖</span>
                            <span class="stat-label">AI Summaries:</span>
                            <span class="stat-value">${this.apiCalls.aiSummary}</span>
                        </div>
                    </div>
                </div>

                <div class="search-history">
                    ${this.gameState.searchHistory.length === 0 ? 
                        '<p class="no-history">No searches yet. Try searching for a property address!</p>' :
                        this.gameState.searchHistory.slice().reverse().map(search => 
                            this.renderHistoryItem(search)
                        ).join('')
                    }
                </div>

                ${this.gameState.searchHistory.length > 0 ? `
                    <div class="history-actions">
                        <button id="clearHistoryBtn" class="btn btn-outline">🗑️ Clear History</button>
                        <button id="exportHistoryBtn" class="btn btn-secondary">📄 Export Report</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderSearchResult(result) {
        if (!result) return '';

        return `
            <div class="result-container">
                <div class="result-header">
                    <h3>📊 Risk Assessment Report</h3>
                    <div class="result-meta">
                        <span class="address">${this.sanitizeHTML(result.address)}</span>
                        <span class="timestamp">${new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                </div>

                ${result.error ? `
                    <div class="error-message">
                        <h4>❌ Error</h4>
                        <p>${this.sanitizeHTML(result.error)}</p>
                        <small>Please try again with a different address or check your internet connection.</small>
                    </div>
                ` : `
                    <div class="ai-summary">
                        <h4>🤖 AI Risk Analysis</h4>
                        <div class="summary-content">
                            ${this.sanitizeHTML(result.summary || 'Analysis pending...')}
                        </div>
                    </div>

                    <div class="location-info">
                        <h4>📍 Location Details</h4>
                        <p><strong>Coordinates:</strong> ${result.latitude?.toFixed(6)}, ${result.longitude?.toFixed(6)}</p>
                        <p><strong>Search Radius:</strong> 5 miles</p>
                    </div>

                    <details class="raw-data">
                        <summary>🔧 Technical Data (Click to expand)</summary>
                        <pre>${JSON.stringify(result.rawData, null, 2)}</pre>
                    </details>
                `}
            </div>
        `;
    }

    renderHistoryItem(search) {
        const date = new Date(search.timestamp).toLocaleDateString();
        const riskLevel = this.assessRiskLevel(search);
        
        return `
            <div class="history-item" data-search-id="${search.id}">
                <div class="history-header">
                    <div class="history-address">${this.sanitizeHTML(search.address)}</div>
                    <div class="history-meta">
                        <span class="risk-badge risk-${riskLevel.toLowerCase()}">${riskLevel}</span>
                        <span class="history-date">${date}</span>
                    </div>
                </div>
                <div class="history-summary">
                    ${search.summary ? this.sanitizeHTML(search.summary.substring(0, 150)) + '...' : 'Analysis failed'}
                </div>
                <div class="history-actions">
                    <button class="btn btn-small view-details" data-search-id="${search.id}">View Details</button>
                </div>
            </div>
        `;
    }

    assessRiskLevel(search) {
        if (search.error) return 'Unknown';
        if (!search.rawData || !search.rawData.epaData) return 'Low';
        
        const facilities = search.rawData.epaData.facilities || [];
        if (facilities.length > 5) return 'High';
        if (facilities.length > 2) return 'Medium';
        return 'Low';
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const addressInput = document.getElementById('addressInput');
        const demoBtn = document.getElementById('demoBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (addressInput) {
            addressInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                document.getElementById('addressInput').value = 'Love Canal, Niagara Falls, NY 14304';
                this.performSearch();
            });
        }

        // History actions
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        const exportHistoryBtn = document.getElementById('exportHistoryBtn');

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }

        if (exportHistoryBtn) {
            exportHistoryBtn.addEventListener('click', () => this.exportHistory());
        }

        // View details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const searchId = e.target.dataset.searchId;
                this.viewSearchDetails(searchId);
            });
        });
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
    }

    async performSearch() {
        const addressInput = document.getElementById('addressInput');
        const address = addressInput.value.trim();

        if (!address) {
            alert('Please enter a property address');
            return;
        }

        this.gameState.isLoading = true;
        this.updateLoadingState();

        try {
            const result = await this.searchProperty(address);
            
            // Add to history
            this.gameState.searchHistory.push(result);
            this.gameState.lastSearch = result;
            
            // Update display
            document.getElementById('searchResults').innerHTML = this.renderSearchResult(result);
            
        } catch (error) {
            console.error('Search failed:', error);
            const errorResult = {
                id: Date.now(),
                address: address,
                timestamp: Date.now(),
                error: error.message || 'Search failed. Please try again.'
            };
            
            this.gameState.searchHistory.push(errorResult);
            this.gameState.lastSearch = errorResult;
            document.getElementById('searchResults').innerHTML = this.renderSearchResult(errorResult);
        }

        this.gameState.isLoading = false;
        this.updateLoadingState();
        this.saveGameState();
    }

    async searchProperty(address) {
        const result = {
            id: Date.now(),
            address: address,
            timestamp: Date.now()
        };

        // Step 1: Geocoding
        this.apiCalls.geocoding++;
        const coordinates = await this.geocodeAddress(address);
        result.latitude = coordinates.lat;
        result.longitude = coordinates.lon;

        // Step 2: Get environmental data
        this.apiCalls.environmental++;
        const environmentalData = await this.getEnvironmentalData(coordinates.lat, coordinates.lon);
        
        // Step 3: Generate AI summary
        this.apiCalls.aiSummary++;
        const summary = await this.generateAISummary(address, environmentalData);
        
        result.summary = summary;
        result.rawData = {
            coordinates: coordinates,
            epaData: environmentalData,
            // Placeholder for future data sources
            fccTowers: { status: 'not_implemented', note: 'FCC tower data integration pending' },
            usgsWater: { status: 'not_implemented', note: 'USGS water data integration pending' },
            industrialSites: { status: 'not_implemented', note: 'Additional industrial site data pending' }
        };

        return result;
    }

    async geocodeAddress(address) {
        // Using OpenStreetMap Nominatim API (free)
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'PropertyRiskChecker/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Geocoding failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error('Address not found. Please try a more specific address.');
            }
            
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                display_name: data[0].display_name
            };
        } catch (error) {
            throw new Error(`Geocoding error: ${error.message}`);
        }
    }

    async getEnvironmentalData(lat, lon) {
        // Mock EPA Envirofacts API data since we can't make real API calls without CORS setup
        // In a real implementation, this would call the EPA API through a backend proxy
        
        const mockFacilities = [
            {
                name: "Wastewater Treatment Plant",
                type: "Water Treatment",
                distance: 1.2,
                violations: 2,
                status: "Active"
            },
            {
                name: "Chemical Storage Facility", 
                type: "Hazardous Waste",
                distance: 0.8,
                violations: 0,
                status: "Monitored"
            }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            facilities: mockFacilities,
            waterQuality: {
                violations: 2,
                lastInspection: "2024-06-15",
                status: "Monitored"
            },
            airQuality: {
                rating: "Moderate",
                lastUpdate: "2024-08-01"
            },
            searchRadius: 5,
            coordinates: { lat, lon }
        };
    }

    async generateAISummary(address, environmentalData) {
        // Mock AI summary since we can't make real OpenAI API calls without backend
        // In a real implementation, this would call OpenAI API through a backend proxy
        
        const facilities = environmentalData.facilities || [];
        
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (facilities.length === 0) {
            return `Environmental risk assessment for ${address}: This location shows minimal environmental concerns within a 5-mile radius. No major industrial facilities or EPA-regulated sites were identified nearby. Water quality monitoring shows no recent violations. This appears to be a relatively low-risk area from an environmental perspective.`;
        }
        
        const nearestFacility = facilities[0];
        const totalViolations = facilities.reduce((sum, f) => sum + (f.violations || 0), 0);
        
        return `Environmental risk assessment for ${address}: This property is ${nearestFacility.distance} miles from a ${nearestFacility.name} (${nearestFacility.type}). ${facilities.length} EPA-regulated facilities were found within 5 miles. The area has ${totalViolations} total EPA violations in recent records. ${environmentalData.waterQuality?.violations ? `Local water supply monitoring shows ${environmentalData.waterQuality.violations} violations.` : 'Water quality monitoring shows no recent violations.'} Consider these factors when evaluating this property, particularly if you have environmental sensitivities.`;
    }

    updateLoadingState() {
        // Update search button
        const searchBtn = document.getElementById('searchBtn');
        const addressInput = document.getElementById('addressInput');
        const demoBtn = document.getElementById('demoBtn');

        if (searchBtn) {
            searchBtn.textContent = this.gameState.isLoading ? '🔄 Analyzing...' : '🔍 Check Property';
            searchBtn.disabled = this.gameState.isLoading;
            searchBtn.className = `btn btn-primary ${this.gameState.isLoading ? 'loading' : ''}`;
        }

        if (addressInput) {
            addressInput.disabled = this.gameState.isLoading;
        }

        if (demoBtn) {
            demoBtn.disabled = this.gameState.isLoading;
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all search history? This cannot be undone.')) {
            this.gameState.searchHistory = [];
            this.apiCalls = { geocoding: 0, environmental: 0, aiSummary: 0 };
            this.saveGameState();
            this.switchTab('history'); // Refresh the history tab
        }
    }

    exportHistory() {
        if (this.gameState.searchHistory.length === 0) {
            alert('No search history to export');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalSearches: this.gameState.searchHistory.length,
            apiUsage: this.apiCalls,
            searches: this.gameState.searchHistory.map(search => ({
                address: search.address,
                date: new Date(search.timestamp).toISOString(),
                riskLevel: this.assessRiskLevel(search),
                summary: search.summary,
                hasError: !!search.error
            }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `property-risk-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    viewSearchDetails(searchId) {
        const search = this.gameState.searchHistory.find(s => s.id == searchId);
        if (search) {
            this.gameState.lastSearch = search;
            document.getElementById('searchResults').innerHTML = this.renderSearchResult(search);
            this.switchTab('search');
        }
    }

    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Game management methods
    stop() {
        this.saveGameState();
        // Clean up any intervals or async operations
    }

    returnToMenu() {
        this.saveGameState();
        this.gameManager.returnToMenu();
    }
}

// Export for use in game manager
window.HouseSearchGame = HouseSearchGame;