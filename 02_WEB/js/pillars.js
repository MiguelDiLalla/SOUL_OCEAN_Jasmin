/**
 * Pillars Interactive Functionality
 * Handles the expand/collapse behavior of pillar panels
 * Following Miguel's coding standards with comprehensive documentation
 */

/**
 * Initialize the pillars interactive functionality
 * Sets up click event listeners for each pillar panel
 */
function initializePillars() {
    console.log('Initializing pillars interactive functionality...');
    
    // Get all pillar panels
    const pillarPanels = document.querySelectorAll('.pillar-panel');
    
    if (pillarPanels.length === 0) {
        console.warn('No pillar panels found');
        return;
    }
    
    // Add click event listener to each panel
    pillarPanels.forEach((panel, index) => {
        panel.addEventListener('click', (event) => {
            handlePillarClick(panel, event);
        });
        
        // Add keyboard accessibility
        panel.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handlePillarClick(panel, event);
            }
        });
        
        // Make panels focusable for keyboard navigation
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('role', 'button');
        panel.setAttribute('aria-expanded', 'false');
        
        console.log(`Pillar panel ${index + 1} initialized`);
    });
    
    console.log(`Successfully initialized ${pillarPanels.length} pillar panels`);
}

/**
 * Handle click events on pillar panels
 * Toggles between collapsed and expanded states
 * 
 * @param {HTMLElement} panel - The clicked pillar panel
 * @param {Event} event - The click/keyboard event
 */
function handlePillarClick(panel, event) {
    try {
        // Get current state
        const currentState = panel.getAttribute('data-state') || 'collapsed';
        const pillarType = panel.getAttribute('data-pillar');
        
        console.log(`Pillar ${pillarType} clicked - current state: ${currentState}`);
        
        // Toggle state
        const newState = currentState === 'collapsed' ? 'expanded' : 'collapsed';
        
        // Update panel state
        panel.setAttribute('data-state', newState);
        panel.setAttribute('aria-expanded', newState === 'expanded');
        
        // Log the state change
        console.log(`Pillar ${pillarType} state changed to: ${newState}`);
        
        // Add visual feedback for the interaction
        addClickFeedback(panel);
        
        // Optional: Close other panels when one is opened (uncomment if desired)
        // if (newState === 'expanded') {
        //     closeOtherPillars(panel);
        // }
        
    } catch (error) {
        console.error('Error handling pillar click:', error);
    }
}

/**
 * Add visual feedback when a pillar is clicked
 * Provides subtle animation to confirm user interaction
 * 
 * @param {HTMLElement} panel - The clicked panel
 */
function addClickFeedback(panel) {
    // Add a temporary class for click feedback
    panel.classList.add('pillar-clicked');
    
    // Remove the class after animation completes
    setTimeout(() => {
        panel.classList.remove('pillar-clicked');
    }, 200);
}

/**
 * Close all other pillar panels except the specified one
 * Useful if you want only one panel open at a time
 * 
 * @param {HTMLElement} exceptPanel - The panel to keep open
 */
function closeOtherPillars(exceptPanel) {
    const allPanels = document.querySelectorAll('.pillar-panel');
    
    allPanels.forEach(panel => {
        if (panel !== exceptPanel && panel.getAttribute('data-state') === 'expanded') {
            panel.setAttribute('data-state', 'collapsed');
            panel.setAttribute('aria-expanded', 'false');
            
            const pillarType = panel.getAttribute('data-pillar');
            console.log(`Closed pillar ${pillarType}`);
        }
    });
}

/**
 * Reset all pillars to collapsed state
 * Utility function for programmatic control
 */
function resetAllPillars() {
    console.log('Resetting all pillars to collapsed state...');
    
    const allPanels = document.querySelectorAll('.pillar-panel');
    
    allPanels.forEach(panel => {
        panel.setAttribute('data-state', 'collapsed');
        panel.setAttribute('aria-expanded', 'false');
    });
    
    console.log(`Reset ${allPanels.length} pillars`);
}

/**
 * Expand a specific pillar by its data-pillar attribute
 * 
 * @param {string} pillarType - The pillar type (stress, limits, rutine, self)
 */
function expandPillar(pillarType) {
    const panel = document.querySelector(`[data-pillar="${pillarType}"]`);
    
    if (panel) {
        panel.setAttribute('data-state', 'expanded');
        panel.setAttribute('aria-expanded', 'true');
        console.log(`Expanded pillar: ${pillarType}`);
    } else {
        console.warn(`Pillar not found: ${pillarType}`);
    }
}

/**
 * Get the current state of all pillars
 * Useful for debugging or analytics
 * 
 * @returns {Object} Object with pillar states
 */
function getPillarsState() {
    const state = {};
    const panels = document.querySelectorAll('.pillar-panel');
    
    panels.forEach(panel => {
        const pillarType = panel.getAttribute('data-pillar');
        const pillarState = panel.getAttribute('data-state');
        state[pillarType] = pillarState;
    });
    
    return state;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePillars);
} else {
    // DOM is already ready
    initializePillars();
}

// Export functions for potential external use
window.PillarsModule = {
    initializePillars,
    resetAllPillars,
    expandPillar,
    getPillarsState,
    handlePillarClick
};

console.log('Pillars module loaded successfully');
