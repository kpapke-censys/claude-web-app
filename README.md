# claude-web-app

A Progressive Web App (PWA) built with vanilla JavaScript that works offline and can be installed on mobile devices.

## 🚀 Live App

**Launch the app:** [https://kpapke-censys.github.io/claude-web-app/](https://kpapke-censys.github.io/claude-web-app/)

## 📱 Install as PWA

### On Mobile (iOS/Android):
1. Open the app link above in your mobile browser
2. Tap "Add to Home Screen" when prompted (or use browser menu)
3. The app will install like a native app on your home screen

### On Desktop (Chrome/Edge):
1. Visit the app and look for the install icon in the address bar
2. Or use browser menu → "Install claude-web-app"

### PWA Features:
- 🔄 **Works offline** - Full functionality without internet
- 📲 **Native app feel** - Runs in standalone mode
- ⚡ **Fast loading** - Cached resources load instantly
- 🔄 **Auto-updates** - App updates automatically in background

## 🏗️ Development

This is a vanilla JavaScript PWA with no build process required. See [PWA-SETUP.md](PWA-SETUP.md) for detailed setup information.

### Local Development:
```bash
# Serve locally (PWAs require HTTP/HTTPS, not file://)
python -m http.server 8000
# Then visit http://localhost:8000
```

### PWA Requirements:
- Requires HTTPS in production (GitHub Pages provides this automatically)
- All required PWA files are already implemented
- Icons need to be added to `/icons/` directory for full PWA compliance