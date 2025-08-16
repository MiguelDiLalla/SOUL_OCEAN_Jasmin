# Copilot Instructions for Bahia FM PWA

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Progressive Web App (PWA) for Bahia FM, a streaming radio station. The app provides:
- Live audio streaming from `https://sonic2.sistemahost.es/8110/stream`
- Offline-capable PWA functionality
- Modern, responsive UI design
- Audio controls (play/pause, volume, mute)
- Service worker for caching and offline support

## Technical Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Web App Manifest, Service Worker
- **Audio**: HTML5 Audio API with streaming support
- **Caching**: Cache API with multiple strategies
- **Responsive**: Mobile-first design with CSS Grid/Flexbox

## Code Standards
- Use modern JavaScript (ES6+) features
- Follow semantic HTML5 structure
- Implement CSS custom properties for theming
- Use async/await for asynchronous operations
- Add comprehensive error handling
- Include TODO comments for future enhancements

## Key Features to Maintain
- **Audio Streaming**: Reliable playback with error handling
- **PWA Compliance**: Manifest, service worker, installability
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Efficient caching, lazy loading
- **Offline Support**: Core functionality works offline

## Development Guidelines
- Test audio playback across different browsers
- Ensure PWA installation works properly
- Verify service worker caching strategies
- Test offline functionality
- Validate responsive design on mobile devices
- Check accessibility compliance

## File Structure
```
├── index.html          # Main application page
├── style.css           # Global styles and responsive design
├── app.js              # Audio controls and PWA logic
├── manifest.json       # Web App Manifest
├── sw.js              # Service Worker
├── assets/            # Images and media assets
└── .github/           # GitHub configuration
```

## Common Tasks
- Adding new audio controls or features
- Implementing metadata display (now playing info)
- Enhancing offline capabilities
- Adding new caching strategies
- Improving accessibility
- Adding analytics or user preferences

## Testing Checklist
- [ ] Audio stream plays correctly
- [ ] PWA can be installed
- [ ] Service worker caches resources
- [ ] Responsive design works
- [ ] Keyboard shortcuts function
- [ ] Offline mode works
- [ ] Error handling is robust

## Future Enhancements (TODO)
- Add now playing metadata display
- Implement playlist/history features
- Add social sharing capabilities
- Include user preferences storage
- Add custom equalizer
- Implement sleep timer
- Add push notifications
- Include analytics tracking
