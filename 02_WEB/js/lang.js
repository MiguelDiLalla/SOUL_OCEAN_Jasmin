/**
 * Language and configuration handling for Soul+Ocean.
 * Extracted from index.html for optimized loading and maintainability.
 */
// Global variables for configuration and language functionality
let currentLanguage = 'es';
let translations = {};
let config = {};

// Load configuration
async function loadConfig() {
    try {
        const response = await fetch('content/config.json');
        if (response.ok) {
            config = await response.json();
            console.log('Configuration loaded:', config);
            applyConfig();
        } else {
            console.error('Failed to load config.json');
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

// Apply configuration to page styles
function applyConfig() {
    if (!config.theme) return;

    const root = document.documentElement;
    const theme = config.theme;
    
    // Apply color variables
    if (theme.colors) {
        root.style.setProperty('--bg-color', theme.colors.background);
        root.style.setProperty('--text-color', theme.colors.text);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--accent-secondary', theme.colors.accent_secondary);
    }

    // Apply navbar configuration
    if (theme.navbar) {
        root.style.setProperty('--navbar-height', theme.navbar.height + 'px');
        root.style.setProperty('--navbar-height-mobile', theme.navbar.height_mobile + 'px');
        root.style.setProperty('--logo-size', theme.navbar.logo_size + 'px');
        root.style.setProperty('--logo-size-mobile', theme.navbar.logo_size_mobile + 'px');
        root.style.setProperty('--navbar-shadow', theme.navbar.shadow);
    }

    // Apply layout configuration
    if (theme.layout) {
        root.style.setProperty('--max-width', theme.layout.max_width);
        root.style.setProperty('--section-spacing', theme.layout.section_spacing);
        root.style.setProperty('--section-padding', theme.layout.section_padding);
        root.style.setProperty('--border-radius', theme.layout.border_radius);
        root.style.setProperty('--button-radius', theme.layout.button_radius);
    }

    // Update Calendly link if configured
    if (config.external_links && config.external_links.calendly) {
        document.querySelectorAll('.calendly-link').forEach(link => {
            link.href = config.external_links.calendly;
        });
    }
}

// Load translations
async function loadTranslations() {
    try {
        const languages = ['es', 'en', 'de'];
        const loadPromises = languages.map(async (lang) => {
            const response = await fetch(`locale/${lang}.json`);
            if (response.ok) {
                translations[lang] = await response.json();
            } else {
                console.warn(`Failed to load ${lang}.json`);
            }
        });
        await Promise.all(loadPromises);
        console.log('Translations loaded:', Object.keys(translations));
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Get nested object value using dot notation
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        if (current && typeof current === 'object' && key in current) {
            return current[key];
        }
        return undefined;
    }, obj);
}

// Update page content based on current language
function updateContent() {
    const langData = translations[currentLanguage];
    if (!langData) {
        console.error(`No translations found for language: ${currentLanguage}`);
        return;
    }

    // Update all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedValue(langData, key);
        
        if (translation !== undefined) {
            element.textContent = translation;
        } else {
            console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
        }
    });

    // Update document language attribute
    document.documentElement.lang = currentLanguage;

    // Update page title if translation exists
    if (langData.brand && langData.brand.name && langData.brand.tagline) {
        document.title = `${langData.brand.name} | ${langData.brand.tagline}`;
    }

    // Update hreflang links dynamically
    updateHreflangLinks();

    // Update Calendly links
    const calendlyUrl = config.external_links?.calendly || 'https://calendly.com/soul-ocean/30min';
    document.querySelectorAll('.calendly-link').forEach(link => {
        link.href = calendlyUrl;
    });
}

// Update hreflang links based on current language
function updateHreflangLinks() {
    // Remove existing hreflang links
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove());
    
    // Add updated hreflang links
    const baseUrl = window.location.origin + window.location.pathname;
    const hreflangs = [
        { lang: 'es', url: baseUrl },
        { lang: 'en', url: baseUrl + (currentLanguage === 'en' ? '' : 'en/') },
        { lang: 'de', url: baseUrl + (currentLanguage === 'de' ? '' : 'de/') },
        { lang: 'x-default', url: baseUrl }
    ];
    
    hreflangs.forEach(({ lang, url }) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = url;
        document.head.appendChild(link);
    });
}

// Language switcher functionality
function switchLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        
        // Update active button and aria states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        const activeButton = document.getElementById(`btn-${lang}`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-pressed', 'true');
        }
        
        // Update content
        updateContent();
        
        // Save preference to localStorage if enabled
        if (config.features?.language_persistence) {
            localStorage.setItem('preferredLanguage', lang);
            console.log(`Language preference saved: ${lang}`);
        }
        
        console.log(`Language switched to: ${lang}`);
    } else {
        console.error(`Language ${lang} not available`);
    }
}

// Detect browser language and return appropriate language code
function detectBrowserLanguage() {
    // Get browser language preferences (in order of preference)
    const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
    
    // Map of supported languages
    const supportedLanguages = ['es', 'en', 'de'];
    
    // First, check if URL contains language indication (e.g., /en/, /de/)
    const urlPath = window.location.pathname;
    const urlLangMatch = urlPath.match(/\/?(en|de|es)\/?/);
    if (urlLangMatch && supportedLanguages.includes(urlLangMatch[1])) {
        console.log(`URL language detected: ${urlLangMatch[1]}`);
        return urlLangMatch[1];
    }
    
    // Check each browser language preference
    for (const browserLang of browserLanguages) {
        // Extract language code (e.g., 'en-US' -> 'en', 'es-ES' -> 'es')
        const langCode = browserLang.toLowerCase().substring(0, 2);
        
        // Check if we support this language
        if (supportedLanguages.includes(langCode)) {
            console.log(`Browser language detected: ${browserLang} -> Using: ${langCode}`);
            return langCode;
        }
    }
    
    // Fallback to Spanish if no supported language found
    console.log(`No supported browser language found. Falling back to Spanish.`);
    return 'es';
}

// Initialize language system
async function initializeLanguage() {
    await loadTranslations();
    
    let selectedLanguage = 'es'; // Default fallback
    
    // Check for saved language preference if enabled (highest priority)
    if (config.features?.language_persistence) {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && translations[savedLang]) {
            selectedLanguage = savedLang;
            console.log(`Using saved language preference: ${selectedLanguage}`);
        } else {
            // No saved preference, detect browser language
            selectedLanguage = detectBrowserLanguage();
        }
    } else {
        // Language persistence disabled, always detect browser language
        selectedLanguage = detectBrowserLanguage();
    }
    
    // Ensure we have translations for the selected language
    if (!translations[selectedLanguage]) {
        console.warn(`No translations available for ${selectedLanguage}, falling back to Spanish`);
        selectedLanguage = 'es';
    }
    
    // Set the detected/selected language
    currentLanguage = selectedLanguage;
    
    // Set active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeButton = document.getElementById(`btn-${currentLanguage}`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }
    
    // Update other buttons aria-pressed state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn !== activeButton) {
            btn.setAttribute('aria-pressed', 'false');
        }
    });
    
    // Update content
    updateContent();
    
    console.log(`Language system initialized with: ${currentLanguage}`);
}

// Smooth scrolling for CTA buttons (excluding Calendly links)
function initializeSmoothScrolling() {
    if (!config.features?.smooth_scrolling) return;
    
    const ctaButtons = document.querySelectorAll('a[href^="#"]:not(.calendly-link)');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Quiz interaction functionality
function initializeQuiz() {
    // Quiz functionality removed - now handled by mystical catalog
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    await initializeLanguage();
    initializeSmoothScrolling();
});

// Expose switchLanguage function globally for onclick handlers
window.switchLanguage = switchLanguage;
