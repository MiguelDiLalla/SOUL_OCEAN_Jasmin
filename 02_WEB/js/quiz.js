
/**
 * Fast Quiz Widget - Complex Interactive Component
 * Handles quiz flow, scoring, and result display with auto-scroll
 */

class FastQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.productScores = {
            'coaching': 0,
            'wildfit': 0,
            'foodfreedom': 0,
            'radiant': 0
        };
        
        this.productMapping = {
            'coaching': {
                id: 'coaching',
                image: 'assets/catalog/coaching.webp',
                dataProduct: 'coaching'
            },
            'wildfit': {
                id: 'wildfit',
                image: 'assets/catalog/wildfit.webp',
                dataProduct: 'wildfit'
            },
            'foodfreedom': {
                id: 'foodfreedom',
                image: 'assets/catalog/foodfreedom.webp',
                dataProduct: 'foodfreedom'
            },
            'radiant': {
                id: 'radiant',
                image: 'assets/catalog/radiant.webp',
                dataProduct: 'radiant'
            }
        };

        this.questions = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('Fast Quiz initialized');
    }

    setupEventListeners() {
        const startBtn = document.getElementById('quiz-start-btn');
        console.log('Quiz start button found:', !!startBtn);
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Quiz start button clicked');
                this.startQuiz();
            });
            console.log('Quiz start event listener added');
        } else {
            console.error('Quiz start button not found in DOM');
        }
    }

    async loadQuizData() {
        try {
            // Get current language from global variable
            const currentLang = window.currentLanguage || 'es';
            const translations = window.translations || {};
            
            console.log('Loading quiz data for language:', currentLang);
            console.log('Available translations:', Object.keys(translations));
            
            if (translations[currentLang] && translations[currentLang].catalog && translations[currentLang].catalog.quiz) {
                const quizData = translations[currentLang].catalog.quiz;
                console.log('Quiz data found:', !!quizData);
                console.log('Quiz questions available:', Object.keys(quizData).filter(key => key.startsWith('q')));
                
                this.questions = [
                    {
                        question: quizData.q1.question,
                        answers: quizData.q1.options
                    },
                    {
                        question: quizData.q2.question,
                        answers: quizData.q2.options
                    },
                    {
                        question: quizData.q3.question,
                        answers: quizData.q3.options
                    },
                    {
                        question: quizData.q4.question,
                        answers: quizData.q4.options
                    }
                ];
                
                console.log('Questions processed:', this.questions.length);
                return true;
            }
            
            console.error('Quiz data not found in translations structure');
            console.log('Translation structure:', translations[currentLang]);
            return false;
        } catch (error) {
            console.error('Error loading quiz data:', error);
            return false;
        }
    }

    async startQuiz() {
        console.log('Starting quiz...');
        console.log('Available translations:', Object.keys(window.translations || {}));
        console.log('Current language:', window.currentLanguage);
        
        // Load quiz data first
        const dataLoaded = await this.loadQuizData();
        console.log('Quiz data loaded:', dataLoaded);
        
        if (!dataLoaded) {
            console.error('Could not start quiz - data not loaded');
            alert('Error: No se pudieron cargar las preguntas del quiz. Por favor, recarga la página.');
            return;
        }

        console.log('Quiz questions loaded:', this.questions.length);

        // Reset quiz state
        this.currentQuestion = 0;
        this.answers = [];
        this.productScores = {
            'coaching': 0,
            'wildfit': 0,
            'foodfreedom': 0,
            'radiant': 0
        };

        // Hide start screen and show first question
        this.hideElement('quiz-start');
        this.showElement('quiz-question-container');
        
        this.displayQuestion();
        console.log('Quiz started successfully');
    }

    displayQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.finishQuiz();
            return;
        }

        const question = this.questions[this.currentQuestion];
        const questionText = document.getElementById('quiz-question-text');
        const answersContainer = document.getElementById('quiz-answers');
        const progressFill = document.getElementById('quiz-progress-fill');
        const progressText = document.getElementById('quiz-progress-text');

        // Update question text
        if (questionText) {
            questionText.textContent = question.question;
        }

        // Update progress
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = `Pregunta ${this.currentQuestion + 1} de ${this.questions.length}`;
        }

        // Clear and populate answers
        if (answersContainer) {
            answersContainer.innerHTML = '';
            
            question.answers.forEach((answer, index) => {
                const li = document.createElement('li');
                li.className = 'quiz-answer';
                li.textContent = this.cleanAnswerText(answer);
                li.dataset.answerIndex = index;
                li.dataset.originalAnswer = answer;
                
                li.addEventListener('click', () => this.selectAnswer(li, answer));
                answersContainer.appendChild(li);
            });
        }
    }

    cleanAnswerText(answer) {
        // Remove the product association in parentheses for display
        return answer.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }

    extractProductFromAnswer(answer) {
        // Extract product type from parentheses
        const match = answer.match(/\(([^)]+)\)/);
        if (match) {
            const productText = match[1].toLowerCase();
            if (productText.includes('coaching')) return 'coaching';
            if (productText.includes('wildfit')) return 'wildfit';
            if (productText.includes('food freedom')) return 'foodfreedom';
            if (productText.includes('radiant')) return 'radiant';
        }
        return 'coaching'; // Default fallback
    }

    selectAnswer(answerElement, originalAnswer) {
        // Clear previous selections
        const allAnswers = document.querySelectorAll('.quiz-answer');
        allAnswers.forEach(el => el.classList.remove('selected'));
        
        // Mark this answer as selected
        answerElement.classList.add('selected');
        
        // Store answer and update scores
        this.answers[this.currentQuestion] = originalAnswer;
        const product = this.extractProductFromAnswer(originalAnswer);
        this.productScores[product]++;
        
        // Auto-advance after a brief delay
        setTimeout(() => {
            this.nextQuestion();
        }, 800);
        
        console.log(`Answer selected: ${product}`, this.productScores);
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            // Animate to next question
            const container = document.getElementById('quiz-question-container');
            if (container) {
                container.style.opacity = '0';
                container.style.transform = 'translateX(-30px)';
                
                setTimeout(() => {
                    this.displayQuestion();
                    container.style.opacity = '1';
                    container.style.transform = 'translateX(0)';
                }, 300);
            }
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        // Hide question container and show loading
        this.hideElement('quiz-question-container');
        this.showElement('quiz-loading');
        
        // Show loading for 3 seconds
        setTimeout(() => {
            this.showResults();
        }, 3000);
    }

    showResults() {
        // Calculate winning product
        const winningProduct = this.calculateWinningProduct();
        
        // Hide loading and show results
        this.hideElement('quiz-loading');
        this.showElement('quiz-result');
        
        // Display result
        this.displayResult(winningProduct);
        
        // Auto-scroll to catalog after 3 seconds
        setTimeout(() => {
            this.scrollToCatalog();
        }, 3000);
        
        console.log('Quiz completed. Winning product:', winningProduct);
    }

    calculateWinningProduct() {
        const scores = this.productScores;
        let maxScore = Math.max(...Object.values(scores));
        
        // Find all products with max score
        const winners = Object.keys(scores).filter(product => scores[product] === maxScore);
        
        // If there's a tie, always fallback to coaching
        if (winners.length > 1 || maxScore === 0) {
            return 'coaching';
        }
        
        return winners[0];
    }

    async displayResult(winningProduct) {
        const mapping = this.productMapping[winningProduct];
        const resultImage = document.getElementById('quiz-result-image');
        const resultTitle = document.getElementById('quiz-result-title');
        const resultCta = document.getElementById('quiz-result-cta');
        
        // Set background image
        if (resultImage && mapping) {
            resultImage.style.backgroundImage = `url('${mapping.image}')`;
        }
        
        // Get product title from translations
        try {
            const currentLang = window.currentLanguage || 'es';
            const translations = window.translations || {};
            
            if (translations[currentLang] && translations[currentLang].catalog && translations[currentLang].catalog.products) {
                const products = translations[currentLang].catalog.products;
                const productIndex = this.getProductIndex(winningProduct);
                
                if (products[productIndex] && resultTitle) {
                    // Use the clean title without "(puerta de entrada)"
                    const title = products[productIndex].title.replace(/\s*\([^)]*\)\s*$/, '').trim();
                    resultTitle.textContent = title;
                }
            }
        } catch (error) {
            console.error('Error setting result title:', error);
            if (resultTitle) {
                resultTitle.textContent = this.getFallbackTitle(winningProduct);
            }
        }
        
        // Highlight the corresponding product in catalog
        if (window.catalogMystical) {
            // Clear any previous highlights
            window.catalogMystical.clearHighlights();
            // Highlight the winning product
            window.catalogMystical.highlightProduct(mapping.dataProduct);
        }
    }

    getProductIndex(product) {
        const mapping = {
            'coaching': 0,
            'wildfit': 1,
            'foodfreedom': 2,
            'radiant': 3
        };
        return mapping[product] || 0;
    }

    getFallbackTitle(product) {
        const fallbacks = {
            'coaching': 'Coaching 1:1 — Transformación Personalizada',
            'wildfit': 'WILDFIT® 90 Day Challenge',
            'foodfreedom': 'FOOD FREEDOM',
            'radiant': 'RADIANT Balance | Young SOULS'
        };
        return fallbacks[product] || fallbacks['coaching'];
    }

    scrollToCatalog() {
        const catalogSection = document.getElementById('catalog');
        if (catalogSection) {
            catalogSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            console.log('Auto-scrolled to catalog');
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }

    // Public method to reset quiz
    resetQuiz() {
        this.currentQuestion = 0;
        this.answers = [];
        this.productScores = {
            'coaching': 0,
            'wildfit': 0,
            'foodfreedom': 0,
            'radiant': 0
        };
        
        // Show start screen and hide others
        this.showElement('quiz-start');
        this.hideElement('quiz-question-container');
        this.hideElement('quiz-loading');
        this.hideElement('quiz-result');
        
        console.log('Quiz reset');
    }
}

// Initialize the quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main initialization and translations to load
    // Check if translations are already loaded
    const initQuizWhenReady = () => {
        if (window.translations && Object.keys(window.translations).length > 0) {
            window.fastQuiz = new FastQuiz();
            console.log('Fast Quiz initialized with translations');
        } else {
            // Wait a bit more and try again
            setTimeout(initQuizWhenReady, 500);
        }
    };
    
    // Start checking after a brief delay
    setTimeout(initQuizWhenReady, 300);
});

// Export for external access if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FastQuiz;
}
