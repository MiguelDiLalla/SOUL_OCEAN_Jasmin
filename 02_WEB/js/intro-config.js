/**
 * Intro Aesthetics Configuration Loader
 * Applies config.json intro_aesthetics settings as CSS custom properties
 * Following Miguel's coding standards: comprehensive documentation and error handling
 */

/**
 * Maps config.json intro_aesthetics to CSS custom properties
 * @param {Object} config - The loaded configuration object
 */
function applyIntroAesthetics(config) {
    if (!config?.theme?.intro_aesthetics) {
        console.warn('⚠️ No intro_aesthetics found in config - using CSS defaults');
        return;
    }

    const aesthetics = config.theme.intro_aesthetics;
    const root = document.documentElement;

    try {
        // ===== GLASS PANEL PROPERTIES =====
        if (aesthetics.glass_panel) {
            const glass = aesthetics.glass_panel;
            root.style.setProperty('--intro-glass-bg-opacity', glass.background_opacity || 0.08);
            root.style.setProperty('--intro-border-opacity', glass.border_opacity || 0.15);
            root.style.setProperty('--intro-backdrop-blur', glass.backdrop_blur || '10px');
            root.style.setProperty('--intro-shadow-blur', glass.shadow_blur || '30px');
            root.style.setProperty('--intro-shadow-opacity', glass.shadow_opacity || 0.4);
            root.style.setProperty('--intro-padding-min', glass.padding_min || '16px');
            root.style.setProperty('--intro-padding-scale', glass.padding_scale || '2.5vw');
            root.style.setProperty('--intro-padding-max', glass.padding_max || '28px');
        }

        // ===== ACCENT GLOW PROPERTIES =====
        if (aesthetics.accent_glow) {
            const glow = aesthetics.accent_glow;
            
            // Position and size
            root.style.setProperty('--intro-glow-x', glow.position_x || '-35%');
            root.style.setProperty('--intro-glow-y', glow.position_y || '25%');
            root.style.setProperty('--intro-glow-width', glow.size_width || '160%');
            root.style.setProperty('--intro-glow-height', glow.size_height || '160%');
            
            // Core color (use accent color as base)
            const accentColor = config.theme?.colors?.accent || '#F2B738';
            root.style.setProperty('--intro-glow-color', glow.color?.replace('var(--accent-color, #F2B738)', accentColor) || accentColor);
            
            // Gradient stops with dynamic color generation
            if (glow.gradient_stops) {
                const stops = glow.gradient_stops;
                const hexToRgba = (hex, opacity) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                };
                
                // Extract RGB from accent color for gradient
                root.style.setProperty('--intro-glow-core-pos', stops.core?.position || '0%');
                root.style.setProperty('--intro-glow-mid-pos', stops.mid?.position || '25%');
                root.style.setProperty('--intro-glow-fade-pos', stops.fade?.position || '45%');
                root.style.setProperty('--intro-glow-transparent-pos', stops.transparent?.position || '65%');
                
                // Generate RGBA colors from accent
                root.style.setProperty('--intro-glow-mid-color', hexToRgba(accentColor, stops.mid?.opacity || 0.25));
                root.style.setProperty('--intro-glow-fade-color', hexToRgba(accentColor, stops.fade?.opacity || 0.10));
            }
            
            // Blur and opacity
            root.style.setProperty('--intro-glow-blur', glow.blur_amount || '14px');
            root.style.setProperty('--intro-glow-opacity', glow.overall_opacity || 0.6);
            
            // Animation properties
            if (glow.animation) {
                const anim = glow.animation;
                root.style.setProperty('--intro-pulse-duration', anim.duration || '7s');
                root.style.setProperty('--intro-pulse-timing', anim.timing || 'ease-in-out');
                root.style.setProperty('--intro-pulse-scale-min', anim.scale_min || 0.98);
                root.style.setProperty('--intro-pulse-scale-max', anim.scale_max || 1.04);
                root.style.setProperty('--intro-pulse-opacity-min', anim.opacity_min || 0.70);
                root.style.setProperty('--intro-pulse-opacity-max', anim.opacity_max || 0.82);
            }
        }

        // ===== TEXTURE OVERLAY PROPERTIES =====
        if (aesthetics.texture_overlay) {
            const texture = aesthetics.texture_overlay;
            
            // Pattern properties
            if (texture.patterns) {
                const patterns = texture.patterns;
                const overlayColor = texture.overlay_color || 'rgba(255,255,255,%opacity%)';
                
                if (patterns.horizontal) {
                    const hColor = overlayColor.replace('%opacity%', patterns.horizontal.opacity || 0.08);
                    root.style.setProperty('--intro-texture-h-color', hColor);
                    root.style.setProperty('--intro-texture-h-spacing', patterns.horizontal.spacing || '3px');
                }
                
                if (patterns.vertical) {
                    const vColor = overlayColor.replace('%opacity%', patterns.vertical.opacity || 0.05);
                    root.style.setProperty('--intro-texture-v-color', vColor);
                    root.style.setProperty('--intro-texture-v-spacing', patterns.vertical.spacing || '4px');
                }
                
                if (patterns.diagonal) {
                    const dColor = overlayColor.replace('%opacity%', patterns.diagonal.opacity || 0.03);
                    root.style.setProperty('--intro-texture-d-color', dColor);
                    root.style.setProperty('--intro-texture-d-spacing', patterns.diagonal.spacing || '3px');
                }
            }
            
            root.style.setProperty('--intro-texture-blend', texture.blend_mode || 'overlay');
            root.style.setProperty('--intro-texture-opacity', texture.overall_opacity || 0.4);
        }

        // ===== TYPOGRAPHY PROPERTIES =====
        if (aesthetics.typography) {
            const typo = aesthetics.typography;
            
            if (typo.title) {
                const title = typo.title;
                root.style.setProperty('--intro-title-size-min', title.font_size_min || '1.5rem');
                root.style.setProperty('--intro-title-size-scale', title.font_size_scale || '4vw');
                root.style.setProperty('--intro-title-size-max', title.font_size_max || '2rem');
                root.style.setProperty('--intro-title-line-height', title.line_height || 1.2);
                root.style.setProperty('--intro-title-weight', title.font_weight || 700);
            }
            
            if (typo.chevron) {
                const chevron = typo.chevron;
                root.style.setProperty('--intro-chevron-size', chevron.font_size || '1.25rem');
                root.style.setProperty('--intro-chevron-opacity', chevron.opacity_initial || 0.7);
                root.style.setProperty('--intro-chevron-opacity-active', chevron.opacity_active || 1.0);
                root.style.setProperty('--intro-chevron-transition', chevron.transition_duration || '0.25s');
            }
        }

        // ===== ANIMATION PROPERTIES =====
        if (aesthetics.animations) {
            const anims = aesthetics.animations;
            
            if (anims.collapse_expand) {
                const collapse = anims.collapse_expand;
                root.style.setProperty('--intro-max-height-transition', collapse.max_height_transition || '0.5s');
                root.style.setProperty('--intro-opacity-transition', collapse.opacity_transition || '0.3s');
                root.style.setProperty('--intro-transform-transition', collapse.transform_transition || '0.3s');
                root.style.setProperty('--intro-transition-timing', collapse.timing || 'ease');
                root.style.setProperty('--intro-max-height-expanded', collapse.max_height_expanded || '1200px');
                root.style.setProperty('--intro-transform-collapsed', collapse.transform_collapsed || 'translateY(-2px)');
                root.style.setProperty('--intro-transform-expanded', collapse.transform_expanded || 'translateY(0)');
            }
            
            if (anims.cta_links) {
                const cta = anims.cta_links;
                root.style.setProperty('--intro-cta-opacity', cta.opacity_initial || 0.85);
                root.style.setProperty('--intro-cta-opacity-hover', cta.opacity_hover || 1.0);
                root.style.setProperty('--intro-cta-transition', cta.transition_duration || '0.2s');
                
                // Handle accent color reference
                const hoverColor = cta.hover_accent_color || 'var(--accent-color, #F2B738)';
                const accentColor = config.theme?.colors?.accent || '#F2B738';
                root.style.setProperty('--intro-cta-hover-color', hoverColor.replace('var(--accent-color, #F2B738)', accentColor));
            }
        }

        console.log('✅ Intro aesthetics applied successfully from config.json');

    } catch (error) {
        console.error('❌ Error applying intro aesthetics:', error);
        console.warn('🔄 Falling back to CSS default values');
    }
}

/**
 * Load configuration and apply intro aesthetics
 * Called automatically when the module loads
 */
async function loadAndApplyIntroConfig() {
    try {
        const response = await fetch('/content/config.json');
        if (!response.ok) {
            throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
        }
        
        const config = await response.json();
        applyIntroAesthetics(config);
        
    } catch (error) {
        console.error('❌ Failed to load intro configuration:', error);
        console.warn('🔄 Using default CSS values for intro aesthetics');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndApplyIntroConfig);
} else {
    loadAndApplyIntroConfig();
}

// Export for manual usage if needed
export { applyIntroAesthetics, loadAndApplyIntroConfig };
