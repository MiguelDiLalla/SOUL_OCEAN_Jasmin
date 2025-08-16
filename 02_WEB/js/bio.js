/**
 * Bio Section Interactive Features
 * Handles image exchange effects and panel interactions
 */

class BioSection {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.startImageRotation();
    }

    initializeElements() {
        this.bioPanel = document.querySelector('.bio-panel');
        this.colorImage = document.getElementById('bio-img-color');
        this.bwImage = document.getElementById('bio-img-bw');
        this.imageWrapper = document.querySelector('.bio-image-wrapper');
        
        // State management
        this.currentImage = 'color'; // 'color' or 'bw'
        this.rotationInterval = null;
        this.isHovered = false;
        this.rotationDuration = 4000; // 4 seconds
    }

    setupEventListeners() {
        if (!this.imageWrapper) return;

        // Mouse events for manual control
        this.imageWrapper.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.stopImageRotation();
        });

        this.imageWrapper.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.startImageRotation();
        });

        // Click event for immediate toggle
        this.imageWrapper.addEventListener('click', () => {
            this.toggleImages();
        });

        // Touch events for mobile
        this.imageWrapper.addEventListener('touchstart', () => {
            this.isHovered = true;
            this.stopImageRotation();
        });

        this.imageWrapper.addEventListener('touchend', () => {
            setTimeout(() => {
                this.isHovered = false;
                this.startImageRotation();
            }, 1000); // Brief delay before resuming rotation
        });

        // Intersection Observer for entrance animation
        this.setupIntersectionObserver();
    }

    toggleImages() {
        if (this.currentImage === 'color') {
            this.showBWImage();
        } else {
            this.showColorImage();
        }
    }

    showColorImage() {
        if (this.currentImage === 'color') return;
        
        this.currentImage = 'color';
        this.colorImage.classList.add('active');
        this.bwImage.classList.remove('active');
        this.bioPanel.classList.remove('bw-active');
        
        // Trigger background change
        this.updatePanelBackground('color');
    }

    showBWImage() {
        if (this.currentImage === 'bw') return;
        
        this.currentImage = 'bw';
        this.bwImage.classList.add('active');
        this.colorImage.classList.remove('active');
        this.bioPanel.classList.add('bw-active');
        
        // Trigger background change
        this.updatePanelBackground('bw');
    }

    updatePanelBackground(imageType) {
        // The CSS ::before pseudo-element handles the background change
        // based on the 'bw-active' class on the panel
    }

    startImageRotation() {
        if (this.isHovered || this.rotationInterval) return;
        
        this.rotationInterval = setInterval(() => {
            if (!this.isHovered) {
                this.toggleImages();
            }
        }, this.rotationDuration);
    }

    stopImageRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.bioPanel.style.animationPlayState = 'running';
                    // Start rotation when section becomes visible
                    setTimeout(() => {
                        if (!this.isHovered) {
                            this.startImageRotation();
                        }
                    }, 1500); // Wait for entrance animation
                } else {
                    this.stopImageRotation();
                }
            });
        }, options);

        if (this.bioPanel) {
            observer.observe(this.bioPanel);
        }
    }

    // Public methods for external control
    pause() {
        this.isHovered = true;
        this.stopImageRotation();
    }

    resume() {
        this.isHovered = false;
        this.startImageRotation();
    }

    destroy() {
        this.stopImageRotation();
        // Remove event listeners if needed for cleanup
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if bio section exists before initializing
    if (document.querySelector('#bio')) {
        window.bioSection = new BioSection();
    }
});

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (window.bioSection) {
        if (document.hidden) {
            window.bioSection.pause();
        } else {
            // Resume after a short delay when tab becomes visible
            setTimeout(() => {
                window.bioSection.resume();
            }, 500);
        }
    }
});
