// Claude Web App - PWA functionality
class ClaudeWebApp {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineStatus();
        this.checkIfInstalled();
        this.setupEventListeners();
    }

    // Register service worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Update found
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Setup install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Before install prompt fired');
            e.preventDefault(); // Prevent the mini-infobar from appearing
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle install button click
        const installBtn = document.getElementById('installBtn');
        installBtn.addEventListener('click', () => {
            this.installApp();
        });
    }

    // Show install button
    showInstallButton() {
        const installBtn = document.getElementById('installBtn');
        const installStatus = document.getElementById('installStatus');
        
        if (!this.isInstalled) {
            installBtn.style.display = 'block';
            installStatus.textContent = '📲 Ready to install';
        }
    }

    // Install app
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.hideInstallButton();
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
        }
    }

    // Hide install button
    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        const installStatus = document.getElementById('installStatus');
        
        installBtn.style.display = 'none';
        installStatus.textContent = '✅ App installed';
        this.isInstalled = true;
    }

    // Check if app is already installed
    checkIfInstalled() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });
    }

    // Setup online/offline status
    setupOnlineStatus() {
        const onlineStatus = document.getElementById('onlineStatus');
        
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                onlineStatus.textContent = '🟢 Online';
                onlineStatus.style.color = '#10b981';
            } else {
                onlineStatus.textContent = '🔴 Offline';
                onlineStatus.style.color = '#ef4444';
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Initial check
    }

    // Show update available notification
    showUpdateAvailable() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <p>🔄 A new version is available!</p>
                <button id="updateBtn" class="update-btn">Update Now</button>
                <button id="dismissBtn" class="dismiss-btn">Later</button>
            </div>
        `;
        
        updateNotification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2563eb;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); }
                to { transform: translateX(-50%) translateY(0); }
            }
            .update-content { text-align: center; }
            .update-btn, .dismiss-btn {
                background: white;
                color: #2563eb;
                border: none;
                padding: 0.5rem 1rem;
                margin: 0.5rem 0.25rem 0;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
            }
            .dismiss-btn {
                background: transparent;
                color: white;
                border: 1px solid white;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(updateNotification);

        // Handle update button
        document.getElementById('updateBtn').addEventListener('click', () => {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        });

        // Handle dismiss button
        document.getElementById('dismissBtn').addEventListener('click', () => {
            updateNotification.remove();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (updateNotification.parentNode) {
                updateNotification.remove();
            }
        }, 10000);
    }

    // Setup additional event listeners
    setupEventListeners() {
        // Handle visibility change for PWA lifecycle
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('App became visible');
                // Sync data or refresh content
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                console.log('Orientation changed');
                // Adjust layout if needed
            }, 100);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Claude Web App initializing...');
    new ClaudeWebApp();
});

// Additional PWA utilities
const PWAUtils = {
    // Check if device supports PWA features
    checkPWASupport() {
        const features = {
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            installPrompt: 'BeforeInstallPromptEvent' in window,
            appBanner: 'onbeforeinstallprompt' in window
        };
        
        console.log('PWA Support:', features);
        return features;
    },

    // Get PWA display mode
    getPWADisplayMode() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
        const isBrowser = !isStandalone && !isMinimalUI;
        
        return {
            standalone: isStandalone,
            minimalUI: isMinimalUI,
            browser: isBrowser
        };
    },

    // Share API support
    async shareContent(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                console.log('Content shared successfully');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            console.log('Web Share API not supported');
            // Fallback to copy to clipboard or other sharing method
        }
    }
};

// Initialize PWA utilities
PWAUtils.checkPWASupport();