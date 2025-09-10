/**
 * Sudoku Game - Enhanced UI Module
 * Handles advanced UI interactions, responsive design, and accessibility
 */

class SudokuUI {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.touchStartTime = 0;
        this.lastTouchEnd = 0;
        this.isNumberPadVisible = true;
        this.shortcuts = new Map();
        
        this.init();
    }
    
    init() {
        this.setupResponsiveDesign();
        this.setupAccessibility();
        this.setupKeyboardShortcuts();
        this.setupTouchHandling();
        this.setupNumberPad();
        this.setupContextMenu();
        this.setupTooltips();
        this.setupDragAndDrop();
        this.setupFullscreen();
        this.setupPWA();
    }
    
    setupResponsiveDesign() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Initial setup
        this.handleResize();
    }
    
    handleResize() {
        const wasMP = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMP !== this.isMobile) {
            this.toggleMobileLayout();
        }
        
        this.adjustGameBoardSize();
        this.adjustNumberPadPosition();
    }
    
    handleOrientationChange() {
        // Adjust layout for landscape/portrait
        const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        document.body.dataset.orientation = orientation;
        
        if (this.isMobile) {
            this.adjustMobileLayout(orientation);
        }
    }
    
    toggleMobileLayout() {
        const mainContent = document.querySelector('.main-content');
        
        if (this.isMobile) {
            mainContent.classList.add('mobile-layout');
            this.enableSwipeNavigation();
        } else {
            mainContent.classList.remove('mobile-layout');
            this.disableSwipeNavigation();
        }
    }
    
    adjustGameBoardSize() {
        const gameBoard = document.getElementById('gameBoard');
        const container = document.querySelector('.game-board-container');
        
        if (!gameBoard || !container) return;
        
        const containerRect = container.getBoundingClientRect();
        const maxSize = Math.min(containerRect.width - 40, containerRect.height - 100);
        
        gameBoard.style.width = maxSize + 'px';
        gameBoard.style.height = maxSize + 'px';
    }
    
    adjustNumberPadPosition() {
        const numberPad = document.getElementById('numberPad');
        
        if (this.isMobile && numberPad) {
            const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
            
            if (orientation === 'landscape') {
                numberPad.style.position = 'fixed';
                numberPad.style.right = '10px';
                numberPad.style.top = '50%';
                numberPad.style.transform = 'translateY(-50%)';
                numberPad.style.maxWidth = '200px';
            } else {
                numberPad.style.position = 'static';
                numberPad.style.transform = 'none';
                numberPad.style.maxWidth = '400px';
            }
        }
    }
    
    adjustMobileLayout(orientation) {
        const controlPanel = document.querySelector('.control-panel');
        const gameBoard = document.querySelector('.game-board-container');
        
        if (orientation === 'landscape') {
            // Side-by-side layout
            controlPanel.style.position = 'fixed';
            controlPanel.style.left = '10px';
            controlPanel.style.top = '10px';
            controlPanel.style.width = '250px';
            controlPanel.style.height = 'calc(100vh - 20px)';
            controlPanel.style.overflowY = 'auto';
            
            gameBoard.style.marginLeft = '270px';
        } else {
            // Stacked layout
            controlPanel.style.position = 'static';
            controlPanel.style.width = 'auto';
            controlPanel.style.height = 'auto';
            
            gameBoard.style.marginLeft = '0';
        }
    }
    
    setupAccessibility() {
        // Add ARIA labels
        this.addAriaLabels();
        
        // Setup screen reader announcements
        this.setupScreenReader();
        
        // Setup high contrast mode
        this.setupHighContrast();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Setup focus management
        this.setupFocusManagement();
    }
    
    addAriaLabels() {
        // Game board
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.setAttribute('role', 'grid');
            gameBoard.setAttribute('aria-label', 'Sudoku puzzle grid');
        }
        
        // Cells
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const row = Math.floor(index / 9) + 1;
            const col = (index % 9) + 1;
            
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', `Row ${row}, Column ${col}`);
            cell.setAttribute('tabindex', '-1');
        });
        
        // Buttons
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const text = btn.textContent.trim();
                btn.setAttribute('aria-label', text);
            }
        });
        
        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            const number = btn.dataset.number;
            if (number === '0') {
                btn.setAttribute('aria-label', 'Erase number');
            } else {
                btn.setAttribute('aria-label', `Enter number ${number}`);
            }
        });
    }
    
    setupScreenReader() {
        // Create live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.style.position = 'absolute';
        this.liveRegion.style.left = '-10000px';
        this.liveRegion.style.width = '1px';
        this.liveRegion.style.height = '1px';
        this.liveRegion.style.overflow = 'hidden';
        
        document.body.appendChild(this.liveRegion);
    }
    
    announce(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }
    
    setupHighContrast() {
        // Detect high contrast mode
        const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }
    
    setupKeyboardNavigation() {
        let currentCellIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            const cells = Array.from(document.querySelectorAll('.cell'));
            
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                currentCellIndex = Math.max(0, currentCellIndex - 1);
                this.focusCell(cells[currentCellIndex]);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                currentCellIndex = Math.min(cells.length - 1, currentCellIndex + 1);
                this.focusCell(cells[currentCellIndex]);
            }
        });
    }
    
    focusCell(cell) {
        document.querySelectorAll('.cell').forEach(c => c.setAttribute('tabindex', '-1'));
        cell.setAttribute('tabindex', '0');
        cell.focus();
        
        if (window.sudokuGame) {
            window.sudokuGame.selectCell(cell);
        }
    }
    
    setupFocusManagement() {
        // Focus trap for modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal(modal);
                }
                
                this.trapFocus(e, modal);
            });
        });
    }
    
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }
    
    setupKeyboardShortcuts() {
        // Register shortcuts
        this.shortcuts.set('ctrl+n', () => this.newGame());
        this.shortcuts.set('ctrl+s', () => this.saveGame());
        this.shortcuts.set('ctrl+z', () => this.undo());
        this.shortcuts.set('ctrl+y', () => this.redo());
        this.shortcuts.set('ctrl+h', () => this.getHint());
        this.shortcuts.set('ctrl+v', () => this.validatePuzzle());
        this.shortcuts.set('f11', () => this.toggleFullscreen());
        this.shortcuts.set('ctrl+/', () => this.showHelp());
        
        document.addEventListener('keydown', (e) => {
            const key = this.getShortcutKey(e);
            const action = this.shortcuts.get(key);
            
            if (action) {
                e.preventDefault();
                action();
            }
        });
    }
    
    getShortcutKey(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        if (e.metaKey) parts.push('meta');
        
        parts.push(e.key.toLowerCase());
        
        return parts.join('+');
    }
    
    setupTouchHandling() {
        if (!('ontouchstart' in window)) return;
        
        // Prevent double-tap zoom
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - this.lastTouchEnd <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, false);
        
        // Setup touch gestures
        this.setupSwipeGestures();
        this.setupPinchZoom();
        this.setupLongPress();
    }
    
    setupSwipeGestures() {
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipe(startX, startY, endX, endY);
        });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const diffX = startX - endX;
        const diffY = startY - endY;
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    this.onSwipeLeft();
                } else {
                    this.onSwipeRight();
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    this.onSwipeUp();
                } else {
                    this.onSwipeDown();
                }
            }
        }
    }
    
    onSwipeLeft() {
        // Navigate to next difficulty
        this.cycleDifficulty(1);
    }
    
    onSwipeRight() {
        // Navigate to previous difficulty
        this.cycleDifficulty(-1);
    }
    
    onSwipeUp() {
        // Hide number pad
        this.toggleNumberPad(false);
    }
    
    onSwipeDown() {
        // Show number pad
        this.toggleNumberPad(true);
    }
    
    cycleDifficulty(direction) {
        const difficulties = ['easy', 'medium', 'hard', 'expert'];
        const current = window.sudokuGame?.difficulty || 'medium';
        const currentIndex = difficulties.indexOf(current);
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = difficulties.length - 1;
        if (newIndex >= difficulties.length) newIndex = 0;
        
        const newDifficulty = difficulties[newIndex];
        
        if (window.sudokuGame) {
            window.sudokuGame.generatePuzzle(newDifficulty);
            this.announce(`New ${newDifficulty} puzzle generated`);
        }
    }
    
    setupPinchZoom() {
        let initialDistance = 0;
        let currentScale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                currentScale = Math.max(0.5, Math.min(2, scale));
                this.scaleGameBoard(currentScale);
            }
        });
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    scaleGameBoard(scale) {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.transform = `scale(${scale})`;
        }
    }
    
    setupLongPress() {
        let longPressTimer;
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('cell')) {
                longPressTimer = setTimeout(() => {
                    this.onLongPress(e.target);
                }, 500);
            }
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }
    
    onLongPress(cell) {
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Show context menu
        this.showCellContextMenu(cell);
    }
    
    setupNumberPad() {
        const toggleBtn = document.getElementById('toggleNumberPad');
        const numberPad = document.getElementById('numberPad');
        
        if (toggleBtn && numberPad) {
            toggleBtn.addEventListener('click', () => {
                this.toggleNumberPad();
            });
        }
        
        // Auto-hide on desktop
        if (!this.isMobile && numberPad) {
            numberPad.style.display = 'none';
            this.isNumberPadVisible = false;
        }
    }
    
    toggleNumberPad(show) {
        const numberPad = document.getElementById('numberPad');
        const toggleBtn = document.getElementById('toggleNumberPad');
        
        if (show !== undefined) {
            this.isNumberPadVisible = show;
        } else {
            this.isNumberPadVisible = !this.isNumberPadVisible;
        }
        
        if (numberPad) {
            if (this.isNumberPadVisible) {
                numberPad.style.display = 'block';
                numberPad.classList.add('slide-in-up');
                if (toggleBtn) {
                    toggleBtn.querySelector('i').className = 'fas fa-chevron-down';
                }
            } else {
                numberPad.classList.add('slide-out-down');
                if (toggleBtn) {
                    toggleBtn.querySelector('i').className = 'fas fa-chevron-up';
                }
                
                setTimeout(() => {
                    numberPad.style.display = 'none';
                    numberPad.classList.remove('slide-in-up', 'slide-out-down');
                }, 300);
            }
        }
    }
    
    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('cell')) {
                e.preventDefault();
                this.showCellContextMenu(e.target);
            }
        });
    }
    
    showCellContextMenu(cell) {
        // Remove existing context menu
        this.hideContextMenu();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="hint">
                <i class="fas fa-lightbulb"></i>
                Get Hint
            </div>
            <div class="context-menu-item" data-action="clear">
                <i class="fas fa-eraser"></i>
                Clear Cell
            </div>
            <div class="context-menu-item" data-action="notes">
                <i class="fas fa-edit"></i>
                Add Notes
            </div>
        `;
        
        // Position menu
        const rect = cell.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.left = rect.right + 'px';
        menu.style.top = rect.top + 'px';
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        // Handle menu actions
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            
            switch (action) {
                case 'hint':
                    if (window.sudokuGame) {
                        window.sudokuGame.selectCell(cell);
                        window.sudokuGame.getHint();
                    }
                    break;
                case 'clear':
                    if (window.sudokuGame) {
                        window.sudokuGame.selectCell(cell);
                        window.sudokuGame.inputNumber(0);
                    }
                    break;
                case 'notes':
                    this.showNotesDialog(cell);
                    break;
            }
            
            this.hideContextMenu();
        });
        
        // Hide menu on outside click
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu, { once: true });
        }, 10);
    }
    
    hideContextMenu() {
        const menu = document.querySelector('.context-menu');
        if (menu) {
            menu.remove();
        }
    }
    
    setupTooltips() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.zIndex = '10001';
        this.tooltip.style.display = 'none';
        
        document.body.appendChild(this.tooltip);
        
        // Add tooltip events
        document.querySelectorAll('[title]').forEach(element => {
            this.addTooltip(element);
        });
    }
    
    addTooltip(element) {
        const title = element.getAttribute('title');
        element.removeAttribute('title'); // Prevent default tooltip
        
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, title);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }
    
    showTooltip(element, text) {
        if (!this.tooltip) return;
        
        this.tooltip.textContent = text;
        this.tooltip.style.display = 'block';
        
        const rect = element.getBoundingClientRect();
        this.tooltip.style.left = rect.left + (rect.width / 2) - (this.tooltip.offsetWidth / 2) + 'px';
        this.tooltip.style.top = rect.bottom + 5 + 'px';
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }
    
    setupDragAndDrop() {
        // Enable drag and drop for numbers
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.draggable = true;
            
            btn.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', btn.dataset.number);
                btn.classList.add('dragging');
            });
            
            btn.addEventListener('dragend', () => {
                btn.classList.remove('dragging');
            });
        });
        
        // Make cells drop targets
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('dragover', (e) => {
                if (!cell.classList.contains('given')) {
                    e.preventDefault();
                    cell.classList.add('drop-target');
                }
            });
            
            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drop-target');
            });
            
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drop-target');
                
                if (!cell.classList.contains('given')) {
                    const number = parseInt(e.dataTransfer.getData('text/plain'));
                    
                    if (window.sudokuGame) {
                        window.sudokuGame.selectCell(cell);
                        window.sudokuGame.inputNumber(number);
                    }
                }
            });
        });
    }
    
    setupFullscreen() {
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'btn btn-icon fullscreen-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = 'Toggle Fullscreen';
        
        document.querySelector('.header-controls').appendChild(fullscreenBtn);
        
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            const icon = fullscreenBtn.querySelector('i');
            if (document.fullscreenElement) {
                icon.className = 'fas fa-compress';
            } else {
                icon.className = 'fas fa-expand';
            }
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    setupPWA() {
        // Check if app can be installed
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            this.showInstallButton();
        });
        
        // Handle app installed
        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            this.announce('App installed successfully');
        });
    }
    
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
        
        document.querySelector('.header-controls').appendChild(installBtn);
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                
                if (result.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                
                deferredPrompt = null;
                this.hideInstallButton();
            }
        });
    }
    
    hideInstallButton() {
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }
    
    // Utility methods that can be called from the main game
    newGame() {
        if (window.sudokuGame) {
            const currentDifficulty = window.sudokuGame.difficulty;
            window.sudokuGame.generatePuzzle(currentDifficulty);
        }
    }
    
    saveGame() {
        if (window.sudokuGame) {
            window.sudokuGame.autoSave();
            this.announce('Game saved');
        }
    }
    
    undo() {
        if (window.sudokuGame) {
            window.sudokuGame.undo();
            this.announce('Move undone');
        }
    }
    
    redo() {
        if (window.sudokuGame) {
            window.sudokuGame.redo();
            this.announce('Move redone');
        }
    }
    
    getHint() {
        if (window.sudokuGame) {
            window.sudokuGame.getHint();
        }
    }
    
    validatePuzzle() {
        if (window.sudokuGame) {
            window.sudokuGame.validatePuzzle();
        }
    }
    
    showHelp() {
        if (window.sudokuGame) {
            window.sudokuGame.showModal('helpModal');
        }
    }
    
    closeModal(modal) {
        modal.classList.remove('show');
    }
    
    showNotesDialog(cell) {
        // Create notes dialog
        const dialog = document.createElement('div');
        dialog.className = 'notes-dialog modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Notes</h3>
                    <button class="btn btn-icon close-notes">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notes-content">
                    <div class="notes-grid">
                        ${Array.from({length: 9}, (_, i) => 
                            `<button class="note-btn" data-note="${i + 1}">${i + 1}</button>`
                        ).join('')}
                    </div>
                    <div class="notes-actions">
                        <button class="btn btn-secondary clear-notes">Clear All</button>
                        <button class="btn btn-primary save-notes">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('show');
        
        // Handle note selection
        dialog.querySelectorAll('.note-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
            });
        });
        
        // Handle actions
        dialog.querySelector('.clear-notes').addEventListener('click', () => {
            dialog.querySelectorAll('.note-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        });
        
        dialog.querySelector('.save-notes').addEventListener('click', () => {
            const selectedNotes = Array.from(dialog.querySelectorAll('.note-btn.selected'))
                .map(btn => btn.dataset.note);
            
            this.saveNotesToCell(cell, selectedNotes);
            this.closeNotesDialog(dialog);
        });
        
        dialog.querySelector('.close-notes').addEventListener('click', () => {
            this.closeNotesDialog(dialog);
        });
    }
    
    closeNotesDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.remove();
        }, 300);
    }
    
    saveNotesToCell(cell, notes) {
        // Save notes to cell (this would integrate with the main game logic)
        cell.dataset.notes = notes.join(',');
        
        // Visual indication of notes
        if (notes.length > 0) {
            cell.classList.add('has-notes');
            const notesIndicator = cell.querySelector('.notes-indicator') || 
                document.createElement('div');
            notesIndicator.className = 'notes-indicator';
            notesIndicator.textContent = notes.join('');
            
            if (!cell.querySelector('.notes-indicator')) {
                cell.appendChild(notesIndicator);
            }
        } else {
            cell.classList.remove('has-notes');
            const indicator = cell.querySelector('.notes-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }
    
    enableSwipeNavigation() {
        document.body.classList.add('swipe-enabled');
    }
    
    disableSwipeNavigation() {
        document.body.classList.remove('swipe-enabled');
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sudokuUI = new SudokuUI();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
