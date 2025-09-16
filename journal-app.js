// Journal App - Life journaling with tags and filtering
class JournalApp {
    constructor(sharedSystems = null) {
        this.sharedSystems = sharedSystems;
        this.gameState = {
            entries: [],
            tags: new Set(),
            filteredEntries: [],
            currentFilter: {
                tags: [],
                searchTerm: '',
                dateRange: null
            },
            settings: {
                entriesPerPage: 10,
                sortOrder: 'newest',
                autoSave: true
            },
            lastSave: Date.now()
        };
        
        this.currentPage = 0;
        this.editingEntryId = null;
        this.components = window.SharedComponents;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        this.loadGameState();
        this.setupUI();
        this.refreshDisplay();
        this.isInitialized = true;
        
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.gameState.settings.autoSave) {
                this.saveGame();
            }
        }, 30000);
    }

    setupUI() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        // Clear existing content
        gameContainer.innerHTML = '';

        // Create header
        const header = this.components.createGameHeader({
            gameType: 'journal',
            icon: '📖',
            title: 'Life Journal',
            subtitle: 'Document your daily life with tags and insights',
            stats: {
                entries: { icon: '📝', value: this.gameState.entries.length },
                tags: { icon: '🏷️', value: this.gameState.tags.size }
            }
        });

        // Create main content with tabs
        const tabs = [
            { id: 'write', name: 'Write Entry', icon: '✍️', description: 'Create a new journal entry' },
            { id: 'browse', name: 'Browse', icon: '📚', description: 'View and filter your entries' },
            { id: 'analytics', name: 'Insights', icon: '📊', description: 'Analyze your journaling patterns' }
        ];

        const tabNavigation = this.components.createTabNavigation(tabs);

        // Create tab content
        this.setupTabContent();

        // Assemble UI
        gameContainer.appendChild(header);
        gameContainer.appendChild(tabNavigation);

        // Setup tab switching
        tabNavigation.addEventListener('tabChanged', (e) => {
            this.handleTabChange(e.detail.tabId);
        });

        gameContainer.style.display = 'block';
    }

    setupTabContent() {
        const writeTab = document.getElementById('write-tab');
        const browseTab = document.getElementById('browse-tab');
        const analyticsTab = document.getElementById('analytics-tab');

        // Write Entry Tab
        writeTab.innerHTML = `
            <div class="journal-write-container">
                <div class="entry-form">
                    <div class="entry-header">
                        <input type="text" id="entryTitle" placeholder="Entry title (optional)" 
                               class="entry-title-input" maxlength="100">
                        <div class="entry-date">
                            <input type="date" id="entryDate" class="entry-date-input">
                            <span class="date-today-btn" onclick="this.previousElementSibling.value = new Date().toISOString().split('T')[0]">Today</span>
                        </div>
                    </div>
                    
                    <div class="tags-section">
                        <label for="entryTags">Tags (separate with commas):</label>
                        <input type="text" id="entryTags" placeholder="work, friends, travel, health..." 
                               class="tags-input">
                        <div class="suggested-tags" id="suggestedTags"></div>
                    </div>
                    
                    <div class="content-section">
                        <label for="entryContent">Your thoughts:</label>
                        <textarea id="entryContent" placeholder="What happened today? How are you feeling? What are you grateful for?"
                                  class="entry-content" rows="10"></textarea>
                        <div class="content-stats">
                            <span id="wordCount">0 words</span>
                            <span id="charCount">0 characters</span>
                        </div>
                    </div>
                    
                    <div class="entry-actions">
                        <button id="saveEntryBtn" class="btn btn-primary">💾 Save Entry</button>
                        <button id="cancelEditBtn" class="btn btn-secondary" style="display: none;">❌ Cancel</button>
                        <button id="clearFormBtn" class="btn btn-outline">🗑️ Clear</button>
                    </div>
                </div>
            </div>
        `;

        // Browse Entries Tab
        browseTab.innerHTML = `
            <div class="journal-browse-container">
                <div class="browse-controls">
                    <div class="search-section">
                        <input type="text" id="searchInput" placeholder="Search entries..." class="search-input">
                        <button id="searchBtn" class="btn btn-outline">🔍</button>
                    </div>
                    
                    <div class="filter-section">
                        <select id="sortOrder" class="sort-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title">By Title</option>
                        </select>
                        
                        <div class="tag-filters" id="tagFilters">
                            <span class="filter-label">Filter by tags:</span>
                            <div class="tag-filter-buttons" id="tagFilterButtons"></div>
                            <button id="clearFiltersBtn" class="btn btn-outline btn-sm">Clear Filters</button>
                        </div>
                    </div>
                </div>
                
                <div class="entries-list" id="entriesList">
                    <!-- Entries will be populated here -->
                </div>
                
                <div class="pagination" id="pagination">
                    <!-- Pagination will be populated here -->
                </div>
            </div>
        `;

        // Analytics Tab
        analyticsTab.innerHTML = `
            <div class="journal-analytics-container">
                <div class="analytics-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalEntries">0</div>
                            <div class="stat-label">Total Entries</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-content">
                            <div class="stat-value" id="streakDays">0</div>
                            <div class="stat-label">Day Streak</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value" id="avgWordsPerEntry">0</div>
                            <div class="stat-label">Avg Words/Entry</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏷️</div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalUniqueTags">0</div>
                            <div class="stat-label">Unique Tags</div>
                        </div>
                    </div>
                </div>
                
                <div class="tag-cloud-section">
                    <h3>Tag Cloud</h3>
                    <div class="tag-cloud" id="tagCloud"></div>
                </div>
                
                <div class="recent-activity">
                    <h3>Recent Activity</h3>
                    <div class="activity-timeline" id="activityTimeline"></div>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Write tab events
        const entryContent = document.getElementById('entryContent');
        const entryTags = document.getElementById('entryTags');
        const entryDate = document.getElementById('entryDate');
        
        if (entryContent) {
            entryContent.addEventListener('input', () => this.updateWordCount());
            // Set today's date by default
            if (entryDate) {
                entryDate.value = new Date().toISOString().split('T')[0];
            }
        }

        if (entryTags) {
            entryTags.addEventListener('input', () => this.updateSuggestedTags());
        }

        // Form actions
        document.getElementById('saveEntryBtn')?.addEventListener('click', () => this.saveEntry());
        document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('clearFormBtn')?.addEventListener('click', () => this.clearForm());

        // Browse tab events
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.gameState.currentFilter.searchTerm = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sortOrder')?.addEventListener('change', (e) => {
            this.gameState.settings.sortOrder = e.target.value;
            this.applyFilters();
        });

        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());
    }

    handleTabChange(tabId) {
        switch (tabId) {
            case 'write':
                this.refreshSuggestedTags();
                break;
            case 'browse':
                this.refreshBrowseTab();
                break;
            case 'analytics':
                this.refreshAnalytics();
                break;
        }
    }

    // Entry Management
    saveEntry() {
        const title = document.getElementById('entryTitle').value.trim();
        const content = document.getElementById('entryContent').value.trim();
        const tagsInput = document.getElementById('entryTags').value.trim();
        const date = document.getElementById('entryDate').value;

        if (!content) {
            this.showNotification('Please write some content for your entry.', 'warning');
            return;
        }

        // Parse tags
        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

        const entry = {
            id: this.editingEntryId || this.generateEntryId(),
            title: title || this.generateAutoTitle(content),
            content: content,
            tags: tags,
            date: date || new Date().toISOString().split('T')[0],
            createdAt: this.editingEntryId ? 
                this.gameState.entries.find(e => e.id === this.editingEntryId)?.createdAt || Date.now() : 
                Date.now(),
            updatedAt: Date.now(),
            wordCount: this.countWords(content)
        };

        if (this.editingEntryId) {
            // Update existing entry
            const index = this.gameState.entries.findIndex(e => e.id === this.editingEntryId);
            this.gameState.entries[index] = entry;
            this.showNotification('Entry updated successfully!', 'success');
        } else {
            // Add new entry
            this.gameState.entries.push(entry);
            this.showNotification('Entry saved successfully!', 'success');
        }

        // Update tags set
        tags.forEach(tag => this.gameState.tags.add(tag));

        this.clearForm();
        this.saveGame();
        this.refreshDisplay();
    }

    generateEntryId() {
        return 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAutoTitle(content) {
        const words = content.split(' ').slice(0, 8);
        return words.join(' ') + (content.split(' ').length > 8 ? '...' : '');
    }

    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    clearForm() {
        document.getElementById('entryTitle').value = '';
        document.getElementById('entryContent').value = '';
        document.getElementById('entryTags').value = '';
        document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
        
        this.editingEntryId = null;
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('saveEntryBtn').textContent = '💾 Save Entry';
        
        this.updateWordCount();
    }

    cancelEdit() {
        this.clearForm();
        this.showNotification('Edit cancelled', 'info');
    }

    editEntry(entryId) {
        const entry = this.gameState.entries.find(e => e.id === entryId);
        if (!entry) return;

        // Switch to write tab
        const writeTab = document.querySelector('[data-tab="write"]');
        if (writeTab) writeTab.click();

        // Populate form
        document.getElementById('entryTitle').value = entry.title;
        document.getElementById('entryContent').value = entry.content;
        document.getElementById('entryTags').value = entry.tags.join(', ');
        document.getElementById('entryDate').value = entry.date;

        this.editingEntryId = entryId;
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        document.getElementById('saveEntryBtn').textContent = '💾 Update Entry';

        this.updateWordCount();
        this.showNotification('Entry loaded for editing', 'info');
    }

    deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
            return;
        }

        this.gameState.entries = this.gameState.entries.filter(e => e.id !== entryId);
        this.saveGame();
        this.refreshDisplay();
        this.refreshBrowseTab();
        this.showNotification('Entry deleted', 'success');
    }

    // UI Updates
    updateWordCount() {
        const content = document.getElementById('entryContent')?.value || '';
        const wordCount = this.countWords(content);
        const charCount = content.length;

        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');

        if (wordCountEl) wordCountEl.textContent = `${wordCount} words`;
        if (charCountEl) charCountEl.textContent = `${charCount} characters`;
    }

    updateSuggestedTags() {
        const input = document.getElementById('entryTags')?.value || '';
        const currentTags = input.split(',').map(tag => tag.trim().toLowerCase());
        const lastTag = currentTags[currentTags.length - 1];

        if (lastTag.length < 2) {
            document.getElementById('suggestedTags').innerHTML = '';
            return;
        }

        const suggestions = Array.from(this.gameState.tags)
            .filter(tag => tag.includes(lastTag) && !currentTags.slice(0, -1).includes(tag))
            .slice(0, 5);

        const suggestionsHtml = suggestions.map(tag => 
            `<span class="suggested-tag" onclick="journalApp.addSuggestedTag('${tag}')">${tag}</span>`
        ).join('');

        document.getElementById('suggestedTags').innerHTML = suggestionsHtml;
    }

    addSuggestedTag(tag) {
        const input = document.getElementById('entryTags');
        const currentTags = input.value.split(',').map(t => t.trim());
        currentTags[currentTags.length - 1] = tag;
        input.value = currentTags.join(', ') + ', ';
        input.focus();
        this.updateSuggestedTags();
    }

    refreshSuggestedTags() {
        const commonTags = this.getTopTags(10);
        const suggestedTagsHtml = commonTags.map(([tag, count]) => 
            `<span class="common-tag" onclick="journalApp.addSuggestedTag('${tag}')">${tag} (${count})</span>`
        ).join('');
        
        document.getElementById('suggestedTags').innerHTML = suggestedTagsHtml;
    }

    // Browse and Filter
    refreshBrowseTab() {
        this.applyFilters();
        this.updateTagFilters();
    }

    applyFilters() {
        let filtered = [...this.gameState.entries];

        // Apply search filter
        if (this.gameState.currentFilter.searchTerm) {
            const term = this.gameState.currentFilter.searchTerm.toLowerCase();
            filtered = filtered.filter(entry => 
                entry.title.toLowerCase().includes(term) ||
                entry.content.toLowerCase().includes(term) ||
                entry.tags.some(tag => tag.includes(term))
            );
        }

        // Apply tag filters
        if (this.gameState.currentFilter.tags.length > 0) {
            filtered = filtered.filter(entry => 
                this.gameState.currentFilter.tags.every(tag => entry.tags.includes(tag))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.gameState.settings.sortOrder) {
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'newest':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        this.gameState.filteredEntries = filtered;
        this.renderEntries();
    }

    renderEntries() {
        const entriesList = document.getElementById('entriesList');
        if (!entriesList) return;

        const startIndex = this.currentPage * this.gameState.settings.entriesPerPage;
        const endIndex = startIndex + this.gameState.settings.entriesPerPage;
        const pageEntries = this.gameState.filteredEntries.slice(startIndex, endIndex);

        if (pageEntries.length === 0) {
            entriesList.innerHTML = `
                <div class="no-entries">
                    <p>📝 No entries found matching your criteria.</p>
                    <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\"write\"]').click()">
                        Write Your First Entry
                    </button>
                </div>
            `;
            return;
        }

        const entriesHtml = pageEntries.map(entry => this.renderEntryCard(entry)).join('');
        entriesList.innerHTML = entriesHtml;
        this.renderPagination();
    }

    renderEntryCard(entry) {
        const date = new Date(entry.date).toLocaleDateString();
        const tagsHtml = entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('');
        const excerpt = entry.content.length > 150 ? 
            entry.content.substring(0, 150) + '...' : 
            entry.content;

        return `
            <div class="entry-card">
                <div class="entry-header">
                    <h4 class="entry-title">${this.escapeHtml(entry.title)}</h4>
                    <div class="entry-meta">
                        <span class="entry-date">📅 ${date}</span>
                        <span class="entry-words">📝 ${entry.wordCount} words</span>
                    </div>
                </div>
                
                <div class="entry-content-preview">
                    ${this.escapeHtml(excerpt)}
                </div>
                
                <div class="entry-tags">
                    ${tagsHtml}
                </div>
                
                <div class="entry-actions">
                    <button class="btn btn-outline btn-sm" onclick="journalApp.editEntry('${entry.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="journalApp.deleteEntry('${entry.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.gameState.filteredEntries.length / this.gameState.settings.entriesPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHtml = '<div class="pagination-controls">';
        
        if (this.currentPage > 0) {
            paginationHtml += `<button class="btn btn-outline btn-sm" onclick="journalApp.changePage(${this.currentPage - 1})">← Previous</button>`;
        }
        
        paginationHtml += `<span class="page-info">Page ${this.currentPage + 1} of ${totalPages}</span>`;
        
        if (this.currentPage < totalPages - 1) {
            paginationHtml += `<button class="btn btn-outline btn-sm" onclick="journalApp.changePage(${this.currentPage + 1})">Next →</button>`;
        }
        
        paginationHtml += '</div>';
        pagination.innerHTML = paginationHtml;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderEntries();
    }

    updateTagFilters() {
        const tagFilterButtons = document.getElementById('tagFilterButtons');
        if (!tagFilterButtons) return;

        const allTags = Array.from(this.gameState.tags).sort();
        const buttonsHtml = allTags.map(tag => {
            const isActive = this.gameState.currentFilter.tags.includes(tag);
            return `
                <button class="tag-filter-btn ${isActive ? 'active' : ''}" 
                        onclick="journalApp.toggleTagFilter('${tag}')">
                    ${tag}
                </button>
            `;
        }).join('');
        
        tagFilterButtons.innerHTML = buttonsHtml;
    }

    toggleTagFilter(tag) {
        const index = this.gameState.currentFilter.tags.indexOf(tag);
        if (index === -1) {
            this.gameState.currentFilter.tags.push(tag);
        } else {
            this.gameState.currentFilter.tags.splice(index, 1);
        }
        
        this.updateTagFilters();
        this.applyFilters();
    }

    clearFilters() {
        this.gameState.currentFilter.tags = [];
        this.gameState.currentFilter.searchTerm = '';
        document.getElementById('searchInput').value = '';
        this.updateTagFilters();
        this.applyFilters();
    }

    // Analytics
    refreshAnalytics() {
        this.updateAnalyticsStats();
        this.renderTagCloud();
        this.renderActivityTimeline();
    }

    updateAnalyticsStats() {
        document.getElementById('totalEntries').textContent = this.gameState.entries.length;
        document.getElementById('totalUniqueTags').textContent = this.gameState.tags.size;

        // Calculate streak
        const streak = this.calculateStreak();
        document.getElementById('streakDays').textContent = streak;

        // Calculate average words per entry
        const totalWords = this.gameState.entries.reduce((sum, entry) => sum + entry.wordCount, 0);
        const avgWords = this.gameState.entries.length > 0 ? Math.round(totalWords / this.gameState.entries.length) : 0;
        document.getElementById('avgWordsPerEntry').textContent = avgWords;
    }

    calculateStreak() {
        if (this.gameState.entries.length === 0) return 0;

        const sortedDates = this.gameState.entries
            .map(entry => entry.date)
            .sort((a, b) => new Date(b) - new Date(a));

        const uniqueDates = [...new Set(sortedDates)];
        const today = new Date().toISOString().split('T')[0];

        let streak = 0;
        let currentDate = new Date(today);

        for (const dateStr of uniqueDates) {
            const entryDate = new Date(dateStr);
            const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
                currentDate = new Date(entryDate);
            } else if (diffDays > streak) {
                break;
            }
        }

        return streak;
    }

    renderTagCloud() {
        const tagCloud = document.getElementById('tagCloud');
        if (!tagCloud) return;

        const tagCounts = this.getTopTags(20);
        const maxCount = Math.max(...tagCounts.map(([, count]) => count));

        const cloudHtml = tagCounts.map(([tag, count]) => {
            const size = Math.max(0.8, (count / maxCount) * 2);
            return `
                <span class="tag-cloud-item" 
                      style="font-size: ${size}em; opacity: ${0.5 + (count / maxCount) * 0.5}"
                      onclick="journalApp.filterByTag('${tag}')">
                    ${tag} (${count})
                </span>
            `;
        }).join('');

        tagCloud.innerHTML = cloudHtml;
    }

    filterByTag(tag) {
        // Switch to browse tab and filter by tag
        document.querySelector('[data-tab="browse"]').click();
        setTimeout(() => {
            this.gameState.currentFilter.tags = [tag];
            this.updateTagFilters();
            this.applyFilters();
        }, 100);
    }

    getTopTags(limit = 10) {
        const tagCounts = {};
        this.gameState.entries.forEach(entry => {
            entry.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);
    }

    renderActivityTimeline() {
        const timeline = document.getElementById('activityTimeline');
        if (!timeline) return;

        const recentEntries = this.gameState.entries
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10);

        if (recentEntries.length === 0) {
            timeline.innerHTML = '<p>No recent activity</p>';
            return;
        }

        const timelineHtml = recentEntries.map(entry => {
            const date = new Date(entry.createdAt).toLocaleDateString();
            const time = new Date(entry.createdAt).toLocaleTimeString();
            return `
                <div class="timeline-item">
                    <div class="timeline-date">${date} at ${time}</div>
                    <div class="timeline-content">
                        <strong>${this.escapeHtml(entry.title)}</strong>
                        <div class="timeline-tags">
                            ${entry.tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        timeline.innerHTML = timelineHtml;
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        if (this.components && this.components.showNotification) {
            this.components.showNotification({
                message: message,
                type: type,
                duration: 3000
            });
        } else {
            // Fallback notification
            alert(message);
        }
    }

    refreshDisplay() {
        // Update header stats
        const entriesStatEl = document.getElementById('entriesStat');
        const tagsStatEl = document.getElementById('tagsStat');
        
        if (entriesStatEl) entriesStatEl.textContent = this.gameState.entries.length;
        if (tagsStatEl) tagsStatEl.textContent = this.gameState.tags.size;
    }

    // Save/Load System
    saveGame() {
        this.gameState.lastSave = Date.now();
        localStorage.setItem('journalAppSave', JSON.stringify({
            ...this.gameState,
            tags: Array.from(this.gameState.tags) // Convert Set to Array for JSON
        }));
    }

    loadGameState() {
        const saved = localStorage.getItem('journalAppSave');
        if (saved) {
            try {
                const loadedState = JSON.parse(saved);
                this.gameState = {
                    ...this.gameState,
                    ...loadedState,
                    tags: new Set(loadedState.tags || []) // Convert Array back to Set
                };
            } catch (error) {
                console.error('Failed to load journal app save:', error);
            }
        }
    }

    getGameState() {
        return {
            ...this.gameState,
            tags: Array.from(this.gameState.tags)
        };
    }

    cleanup() {
        // Clean up any intervals or event listeners
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Global reference for easy access
window.JournalApp = JournalApp;