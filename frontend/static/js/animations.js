/**
 * Sudoku Game - Advanced Animations Module
 * Handles all visual effects, transitions, and animations
 */

class SudokuAnimations {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.particleSystem = null;
        
        this.init();
    }
    
    init() {
        this.createParticleSystem();
        this.addAnimationStyles();
        this.setupIntersectionObserver();
    }
    
    createParticleSystem() {
        // Create canvas for particle effects
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.opacity = '0.8';
        
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Notification Styles */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                color: var(--text-primary);
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-xl);
                border-left: 4px solid var(--primary-color);
                transform: translateX(100%);
                transition: all var(--transition-normal);
                z-index: 10000;
                max-width: 400px;
                backdrop-filter: var(--blur-sm);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left-color: var(--success-color);
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
            }
            
            .notification-error {
                border-left-color: var(--error-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            }
            
            .notification-warning {
                border-left-color: var(--warning-color);
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
            }
            
            .notification-info {
                border-left-color: var(--primary-color);
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-content i {
                font-size: 1.25rem;
            }
            
            .notification-success i {
                color: var(--success-color);
            }
            
            .notification-error i {
                color: var(--error-color);
            }
            
            .notification-warning i {
                color: var(--warning-color);
            }
            
            .notification-info i {
                color: var(--primary-color);
            }
            
            /* Ripple Effect */
            .ripple {
                position: relative;
                overflow: hidden;
            }
            
            .ripple::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            
            .ripple:active::before {
                width: 300px;
                height: 300px;
            }
            
            /* Pulse Animation */
            .pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.05);
                    opacity: 0.7;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            /* Glow Effect */
            .glow {
                animation: glow 1.5s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
                from {
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
                }
                to {
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
                }
            }
            
            /* Bounce Animation */
            .bounce {
                animation: bounce 0.6s ease-out;
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0, 0, 0);
                }
                40%, 43% {
                    transform: translate3d(0, -10px, 0);
                }
                70% {
                    transform: translate3d(0, -5px, 0);
                }
                90% {
                    transform: translate3d(0, -2px, 0);
                }
            }
            
            /* Slide Animations */
            .slide-in-left {
                animation: slideInLeft 0.3s ease-out;
            }
            
            .slide-in-right {
                animation: slideInRight 0.3s ease-out;
            }
            
            .slide-in-up {
                animation: slideInUp 0.3s ease-out;
            }
            
            .slide-in-down {
                animation: slideInDown 0.3s ease-out;
            }
            
            @keyframes slideInLeft {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideInDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            /* Fade Animations */
            .fade-in {
                animation: fadeIn 0.3s ease-out;
            }
            
            .fade-out {
                animation: fadeOut 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            /* Scale Animations */
            .scale-in {
                animation: scaleIn 0.3s ease-out;
            }
            
            .scale-out {
                animation: scaleOut 0.3s ease-out;
            }
            
            @keyframes scaleIn {
                from {
                    transform: scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes scaleOut {
                from {
                    transform: scale(1);
                    opacity: 1;
                }
                to {
                    transform: scale(0.8);
                    opacity: 0;
                }
            }
            
            /* Wobble Animation */
            .wobble {
                animation: wobble 0.8s ease-in-out;
            }
            
            @keyframes wobble {
                0% { transform: translate3d(0, 0, 0); }
                15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); }
                30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); }
                45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); }
                60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); }
                75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); }
                100% { transform: translate3d(0, 0, 0); }
            }
            
            /* Typing Animation */
            .typing {
                animation: typing 1s steps(40, end);
                white-space: nowrap;
                overflow: hidden;
            }
            
            @keyframes typing {
                from { width: 0; }
                to { width: 100%; }
            }
            
            /* Floating Animation */
            .floating {
                animation: floating 3s ease-in-out infinite;
            }
            
            @keyframes floating {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            /* Shimmer Effect */
            .shimmer {
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupIntersectionObserver() {
        // Animate elements when they come into view
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Observe elements that should animate on scroll
        document.querySelectorAll('.control-panel, .game-board').forEach(el => {
            this.observer.observe(el);
        });
    }
    
    // Cell animation effects
    animateCellInput(cell, number) {
        // Remove any existing animations
        cell.style.animation = '';
        
        // Apply input animation
        cell.style.animation = 'bounce 0.6s ease-out';
        
        // Add number with typing effect
        if (number !== 0) {
            cell.textContent = '';
            setTimeout(() => {
                cell.textContent = number;
                cell.classList.add('bounce');
            }, 100);
            
            setTimeout(() => {
                cell.classList.remove('bounce');
                cell.style.animation = '';
            }, 600);
        }
    }
    
    animateCellError(cell) {
        cell.classList.add('error');
        cell.style.animation = 'shake 0.5s ease-in-out, wobble 0.8s ease-in-out 0.5s';
        
        setTimeout(() => {
            cell.style.animation = '';
        }, 1300);
    }
    
    animateCellHint(cell) {
        cell.classList.add('hint', 'glow');
        
        setTimeout(() => {
            cell.classList.remove('glow');
        }, 2000);
    }
    
    animateCellSolving(cell, delay = 0) {
        setTimeout(() => {
            cell.classList.add('solving', 'pulse');
            
            setTimeout(() => {
                cell.classList.remove('solving', 'pulse');
            }, 600);
        }, delay);
    }
    
    // Grid animations
    animateGridReveal() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const delay = (Math.floor(index / 9) + (index % 9)) * 50;
            
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                cell.style.transition = 'all 0.3s ease-out';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            }, delay);
        });
    }
    
    animateGridSolved() {
        const cells = document.querySelectorAll('.cell');
        
        // Wave animation across the grid
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const delay = (row + col) * 100;
            
            setTimeout(() => {
                cell.style.animation = 'cell-complete 0.8s ease-out';
                cell.classList.add('completed', 'glow');
            }, delay);
        });
        
        // Create victory particles
        setTimeout(() => {
            this.createVictoryParticles();
        }, 500);
    }
    
    // Particle effects
    createVictoryParticles() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                this.createParticle({
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 2 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 4 + 2,
                    life: 1,
                    decay: 0.02
                });
            }, i * 20);
        }
        
        this.startParticleAnimation();
    }
    
    createHintParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const velocity = 2;
            
            this.createParticle({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: '#f59e0b',
                size: 3,
                life: 1,
                decay: 0.05
            });
        }
        
        this.startParticleAnimation();
    }
    
    createErrorParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            this.createParticle({
                x: centerX + (Math.random() - 0.5) * 20,
                y: centerY + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2,
                color: '#ef4444',
                size: Math.random() * 3 + 1,
                life: 1,
                decay: 0.04
            });
        }
        
        this.startParticleAnimation();
    }
    
    createParticle(particle) {
        this.particles.push(particle);
    }
    
    startParticleAnimation() {
        if (this.particleAnimation) return;
        
        this.particleAnimation = requestAnimationFrame(() => this.updateParticles());
    }
    
    updateParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            
            // Update life
            particle.life -= particle.decay;
            
            // Draw particle
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            // Remove dead particles
            if (particle.life <= 0 || particle.y > this.canvas.height) {
                this.particles.splice(i, 1);
            }
        }
        
        // Continue animation if particles exist
        if (this.particles.length > 0) {
            this.particleAnimation = requestAnimationFrame(() => this.updateParticles());
        } else {
            this.particleAnimation = null;
        }
    }
    
    // UI animations
    animateButton(button) {
        button.classList.add('ripple');
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 600ms linear';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    animateModal(modal, show) {
        if (show) {
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
            
            const content = modal.querySelector('.modal-content');
            content.classList.add('scale-in');
        } else {
            modal.classList.add('fade-out');
            
            const content = modal.querySelector('.modal-content');
            content.classList.add('scale-out');
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('fade-in', 'fade-out');
                content.classList.remove('scale-in', 'scale-out');
            }, 300);
        }
    }
    
    animateNotification(notification) {
        notification.classList.add('slide-in-right');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('slide-in-right');
            notification.classList.add('slide-out-right');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Loading animations
    animateLoading(element, show) {
        if (show) {
            element.classList.add('fade-in');
            
            // Animate spinner
            const spinner = element.querySelector('.spinner');
            if (spinner) {
                spinner.style.animation = 'spin 1s linear infinite';
            }
        } else {
            element.classList.add('fade-out');
            
            setTimeout(() => {
                element.classList.remove('fade-in', 'fade-out');
            }, 300);
        }
    }
    
    // Progress animations
    animateProgress(element, progress) {
        const bar = element.querySelector('.progress-bar');
        if (bar) {
            bar.style.width = progress + '%';
            bar.style.transition = 'width 0.3s ease-out';
        }
    }
    
    // Text animations
    animateCounter(element, from, to, duration = 1000) {
        const start = Date.now();
        const range = to - from;
        
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const eased = 1 - Math.pow(1 - progress, 4);
            
            const current = Math.floor(from + range * eased);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = to;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    typeText(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }
    
    // Utility functions
    addRippleEffect(elements) {
        elements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.animateButton(element);
            });
        });
    }
    
    addHoverEffects(elements) {
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
                element.style.transition = 'transform 0.2s ease-out';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
            });
        });
    }
    
    cleanup() {
        // Clean up particles
        this.particles = [];
        if (this.particleAnimation) {
            cancelAnimationFrame(this.particleAnimation);
            this.particleAnimation = null;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sudokuAnimations = new SudokuAnimations();
    
    // Add ripple effects to buttons
    const buttons = document.querySelectorAll('.btn');
    window.sudokuAnimations.addRippleEffect(buttons);
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.cell, .number-btn, .btn');
    window.sudokuAnimations.addHoverEffects(interactiveElements);
});

// Expose animation functions globally for use in other modules
window.animateElement = (element, animation) => {
    element.classList.add(animation);
    
    element.addEventListener('animationend', () => {
        element.classList.remove(animation);
    }, { once: true });
};

window.createParticles = (type, element) => {
    if (window.sudokuAnimations) {
        switch (type) {
            case 'victory':
                window.sudokuAnimations.createVictoryParticles();
                break;
            case 'hint':
                window.sudokuAnimations.createHintParticles(element);
                break;
            case 'error':
                window.sudokuAnimations.createErrorParticles(element);
                break;
        }
    }
};
