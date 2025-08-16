/**
 * Catalog Mystical Image Overlay System
 * Handles the toggle between mystical image overlays and product information
 */

class CatalogMystical {
    constructor() {
        this.productItems = document.querySelectorAll('.product-item');
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('Catalog Mystical System initialized');
    }

    bindEvents() {
        this.productItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleProductClick(e, item));
            
            // Add subtle entrance animation on load
            this.addEntranceAnimation(item);
        });
    }

    handleProductClick(event, productItem) {
        event.preventDefault();
        event.stopPropagation();
        
        const overlay = productItem.querySelector('.product-overlay');
        const isRevealed = productItem.classList.contains('revealed');
        
        if (isRevealed) {
            // Hide product info, show mystical image
            this.hideProduct(productItem, overlay);
        } else {
            // Hide mystical image, show product info
            this.revealProduct(productItem, overlay);
        }
    }

    revealProduct(productItem, overlay) {
        // Add revealed class for content visibility
        productItem.classList.add('revealed');
        
        // Hide the mystical overlay with animation
        overlay.classList.add('hidden');
        
        // Clear any existing style overrides on overlay
        overlay.style.transform = '';
        overlay.style.opacity = '';
        overlay.style.transition = '';
        
        // Show and animate content entrance
        const content = productItem.querySelector('.product-content');
        if (content) {
            content.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }

        console.log(`Product revealed: ${productItem.dataset.product}`);
    }

    hideProduct(productItem, overlay) {
        // Remove revealed class
        productItem.classList.remove('revealed');
        
        // Show the mystical overlay with animation
        overlay.classList.remove('hidden');
        
        // Clear any existing style overrides and reset overlay
        overlay.style.transform = '';
        overlay.style.opacity = '';
        overlay.style.transition = '';
        
        // Hide content immediately
        const content = productItem.querySelector('.product-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = '';
        }

        console.log(`Product mystified: ${productItem.dataset.product}`);
    }

    addEntranceAnimation(item) {
        // Initial state for entrance animation
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        // Trigger entrance animation with delay based on index
        const index = Array.from(this.productItems).indexOf(item);
        const delay = index * 150; // Stagger the animations
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, delay + 300); // Base delay + stagger
    }

    // Method to reveal all products (for external triggers like quiz results)
    revealAllProducts() {
        this.productItems.forEach(item => {
            const overlay = item.querySelector('.product-overlay');
            if (!item.classList.contains('revealed')) {
                this.revealProduct(item, overlay);
            }
        });
    }

    // Method to hide all products (reset to mystical state)
    hideAllProducts() {
        this.productItems.forEach(item => {
            const overlay = item.querySelector('.product-overlay');
            if (item.classList.contains('revealed')) {
                this.hideProduct(item, overlay);
            }
        });
    }

    // Method to highlight specific products (for quiz recommendations)
    highlightProduct(productId) {
        const targetProduct = document.querySelector(`[data-product="${productId}"]`);
        if (targetProduct) {
            targetProduct.classList.add('is-recommended');
            
            // Auto-reveal recommended product after a brief delay
            setTimeout(() => {
                const overlay = targetProduct.querySelector('.product-overlay');
                this.revealProduct(targetProduct, overlay);
            }, 500);
        }
    }

    // Remove highlights from all products
    clearHighlights() {
        this.productItems.forEach(item => {
            item.classList.remove('is-recommended');
        });
    }
}

// Initialize the catalog mystical system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main initialization to complete
    setTimeout(() => {
        window.catalogMystical = new CatalogMystical();
    }, 100);
});

// Export for external access if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CatalogMystical;
}
