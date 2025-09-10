/**
 * Sudoku Game - Main JavaScript Module
 * Handles game logic, API communication, and core functionality
 */

class SudokuGame {
    constructor() {
        // Game state
        this.currentGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalPuzzle = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.gameId = null;
        this.difficulty = 'medium';
        this.moveCount = 0;
        this.startTime = null;
        this.gameTime = 0;
        this.timer = null;
        this.isPaused = false;
        this.isCompleted = false;
        this.solveAnimation = null;
        this.undoStack = [];
        this.redoStack = [];
        
        // API base URL
        this.apiUrl = '/api';
        
        // Initialize the game
        this.init();
    }
    
    async init() {
        this.createGameBoard();
        this.attachEventListeners();
        this.loadTheme();
        await this.loadStats();
        
        // Auto-generate an easy puzzle to start
        await this.generatePuzzle('easy');
    }
    
    createGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.tabIndex = 0;
                
                // Add visual separators for 3x3 boxes
                if (col === 2 || col === 5) {
                    cell.style.borderRight = '3px solid var(--primary-color)';
                }
                if (row === 2 || row === 5) {
                    cell.style.borderBottom = '3px solid var(--primary-color)';
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    attachEventListeners() {
        const gameBoard = document.getElementById('gameBoard');
        
        // Cell selection and input
        gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.selectCell(e.target);
            }
        });
        
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.handleKeyInput(e);
        });
        
        // Difficulty buttons
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                await this.generatePuzzle(difficulty);
            });
        });
        
        // Control buttons
        document.getElementById('solveBtn').addEventListener('click', () => {
            this.showAutoSolveModal();
        });
        
        document.getElementById('hintBtn').addEventListener('click', async () => {
            await this.getHint();
        });
        
        document.getElementById('validateBtn').addEventListener('click', async () => {
            await this.validatePuzzle();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetPuzzle();
        });
        
        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.currentTarget.dataset.number);
                this.inputNumber(number);
            });
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Modal controls
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.modal;
                this.hideModal(modalId);
            });
        });
        
        // Statistics button
        document.getElementById('statsBtn').addEventListener('click', async () => {
            await this.showStats();
        });
        
        // Help button
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showModal('helpModal');
        });
        
        // Auto-solve modal
        document.getElementById('solveInstant').addEventListener('click', async () => {
            this.hideModal('autoSolveModal');
            await this.solvePuzzle(false);
        });
        
        document.getElementById('solveAnimated').addEventListener('click', () => {
            document.getElementById('solveControls').style.display = 'block';
        });
        
        document.getElementById('startSolving').addEventListener('click', async () => {
            this.hideModal('autoSolveModal');
            await this.solvePuzzle(true);
        });
        
        // Success modal
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.hideModal('successModal');
            this.generatePuzzle(this.difficulty);
        });
        
        document.getElementById('closeSuccessBtn').addEventListener('click', () => {
            this.hideModal('successModal');
        });
        
        // Speed control
        document.getElementById('solveSpeed').addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = e.target.value + 'ms';
        });
    }
    
    selectCell(cellElement) {
        // Remove previous selection
        document.querySelectorAll('.cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Clear highlights
        this.clearHighlights();
        
        // Don't select given cells
        if (cellElement.classList.contains('given')) {
            this.selectedCell = null;
            return;
        }
        
        // Select new cell
        cellElement.classList.add('selected');
        this.selectedCell = cellElement;
        
        // Highlight related cells
        this.highlightRelatedCells(cellElement);
        
        // Animate selection
        cellElement.style.animation = 'cell-select 0.2s ease-out';
        setTimeout(() => {
            cellElement.style.animation = '';
        }, 200);
    }
    
    highlightRelatedCells(selectedCell) {
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        const boxRow = Math.floor(row / 3);
        const boxCol = Math.floor(col / 3);
        
        document.querySelectorAll('.cell').forEach(cell => {
            const cellRow = parseInt(cell.dataset.row);
            const cellCol = parseInt(cell.dataset.col);
            const cellBoxRow = Math.floor(cellRow / 3);
            const cellBoxCol = Math.floor(cellCol / 3);
            
            if (cellRow === row) {
                cell.classList.add('highlighted-row');
            }
            if (cellCol === col) {
                cell.classList.add('highlighted-col');
            }
            if (cellBoxRow === boxRow && cellBoxCol === boxCol) {
                cell.classList.add('highlighted-box');
            }
        });
    }
    
    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlighted-row', 'highlighted-col', 'highlighted-box', 'error', 'hint');
        });
    }
    
    handleKeyInput(e) {
        if (!this.selectedCell) return;
        
        const key = e.key;
        
        // Numbers 1-9
        if (key >= '1' && key <= '9') {
            e.preventDefault();
            this.inputNumber(parseInt(key));
        }
        // Clear cell
        else if (key === 'Backspace' || key === 'Delete' || key === '0') {
            e.preventDefault();
            this.inputNumber(0);
        }
        // Navigation
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.navigateCell(key);
        }
        // Hint
        else if (key === ' ') {
            e.preventDefault();
            this.getHint();
        }
        // Deselect
        else if (key === 'Escape') {
            e.preventDefault();
            this.selectedCell.classList.remove('selected');
            this.selectedCell = null;
            this.clearHighlights();
        }
    }
    
    navigateCell(direction) {
        if (!this.selectedCell) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        let newRow = row;
        let newCol = col;
        
        switch (direction) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                break;
        }
        
        const newCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (newCell) {
            this.selectCell(newCell);
        }
    }
    
    inputNumber(number) {
        if (!this.selectedCell || this.selectedCell.classList.contains('given')) {
            return;
        }
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        // Save state for undo
        this.saveUndoState();
        
        // Update grid
        this.currentGrid[row][col] = number;
        
        // Update display
        this.selectedCell.textContent = number === 0 ? '' : number;
        
        // Animate input
        if (number !== 0) {
            this.selectedCell.style.animation = 'cell-complete 0.3s ease-out';
            setTimeout(() => {
                this.selectedCell.style.animation = '';
            }, 300);
        }
        
        // Update move counter
        this.moveCount++;
        document.getElementById('moveCounter').textContent = this.moveCount;
        
        // Auto-advance to next empty cell
        if (number !== 0) {
            this.autoAdvance();
        }
        
        // Check for completion
        if (this.isPuzzleComplete()) {
            this.completePuzzle();
        }
        
        // Auto-save
        this.autoSave();
    }
    
    autoAdvance() {
        const cells = document.querySelectorAll('.cell:not(.given)');
        let nextCell = null;
        
        // Find next empty cell
        for (let cell of cells) {
            if (cell.textContent === '') {
                nextCell = cell;
                break;
            }
        }
        
        if (nextCell) {
            setTimeout(() => {
                this.selectCell(nextCell);
            }, 100);
        }
    }
    
    saveUndoState() {
        this.undoStack.push({
            grid: this.currentGrid.map(row => [...row]),
            moveCount: this.moveCount
        });
        
        // Limit undo stack size
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        
        // Clear redo stack
        this.redoStack = [];
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        // Save current state to redo stack
        this.redoStack.push({
            grid: this.currentGrid.map(row => [...row]),
            moveCount: this.moveCount
        });
        
        // Restore previous state
        const previousState = this.undoStack.pop();
        this.currentGrid = previousState.grid;
        this.moveCount = previousState.moveCount;
        
        // Update display
        this.updateDisplay();
        document.getElementById('moveCounter').textContent = this.moveCount;
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        // Save current state to undo stack
        this.saveUndoState();
        
        // Restore next state
        const nextState = this.redoStack.pop();
        this.currentGrid = nextState.grid;
        this.moveCount = nextState.moveCount;
        
        // Update display
        this.updateDisplay();
        document.getElementById('moveCounter').textContent = this.moveCount;
    }
    
    updateDisplay() {
        document.querySelectorAll('.cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.currentGrid[row][col];
            
            if (!cell.classList.contains('given')) {
                cell.textContent = value === 0 ? '' : value;
            }
        });
    }
    
    async generatePuzzle(difficulty = 'medium') {
        this.showLoading('Generating puzzle...');
        
        try {
            const response = await fetch(`${this.apiUrl}/generate/${difficulty}`);
            const data = await response.json();
            
            if (data.success) {
                this.gameId = data.game_id;
                this.difficulty = difficulty;
                this.originalPuzzle = data.puzzle;
                this.currentGrid = data.puzzle.map(row => [...row]);
                this.isCompleted = false;
                this.moveCount = 0;
                this.resetTimer();
                this.startTimer();
                
                // Update UI
                document.getElementById('currentDifficulty').textContent = 
                    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
                document.getElementById('moveCounter').textContent = '0';
                
                this.renderPuzzle();
                this.clearHighlights();
                
                // Clear undo/redo stacks
                this.undoStack = [];
                this.redoStack = [];
                
                this.hideLoading();
                this.showNotification(`New ${difficulty} puzzle generated!`, 'success');
            } else {
                throw new Error(data.error || 'Failed to generate puzzle');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('Failed to generate puzzle: ' + error.message, 'error');
        }
    }
    
    renderPuzzle() {
        document.querySelectorAll('.cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.currentGrid[row][col];
            
            cell.textContent = value === 0 ? '' : value;
            cell.classList.remove('given', 'error', 'hint', 'solving');
            
            if (this.originalPuzzle[row][col] !== 0) {
                cell.classList.add('given');
            }
        });
    }
    
    async solvePuzzle(animated = false) {
        if (this.isCompleted) return;
        
        this.showLoading('Solving puzzle...');
        
        try {
            const response = await fetch(`${this.apiUrl}/solve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grid: this.currentGrid,
                    show_steps: animated
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (animated && data.steps) {
                    this.hideLoading();
                    await this.animateSolution(data.steps);
                } else {
                    this.currentGrid = data.solution;
                    this.updateDisplay();
                    this.hideLoading();
                    this.showNotification('Puzzle solved!', 'success');
                }
            } else {
                throw new Error(data.error || 'Failed to solve puzzle');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('Failed to solve puzzle: ' + error.message, 'error');
        }
    }
    
    async animateSolution(steps) {
        const speed = parseInt(document.getElementById('solveSpeed').value);
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            if (step.technique !== 'backtrack_undo') {
                const cell = document.querySelector(`[data-row="${step.row}"][data-col="${step.col}"]`);
                
                if (cell && !cell.classList.contains('given')) {
                    // Highlight current cell
                    this.clearHighlights();
                    cell.classList.add('solving');
                    
                    // Update value
                    this.currentGrid[step.row][step.col] = step.value;
                    cell.textContent = step.value === 0 ? '' : step.value;
                    
                    // Wait for next step
                    await new Promise(resolve => setTimeout(resolve, speed));
                    
                    cell.classList.remove('solving');
                }
            }
        }
        
        this.showNotification('Puzzle solved with animation!', 'success');
    }
    
    async getHint() {
        if (this.isCompleted) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grid: this.currentGrid
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.hint) {
                const hint = data.hint;
                const cell = document.querySelector(`[data-row="${hint.row}"][data-col="${hint.col}"]`);
                
                if (cell) {
                    // Clear previous hints
                    this.clearHighlights();
                    
                    // Highlight hint cell
                    cell.classList.add('hint');
                    this.selectCell(cell);
                    
                    // Show hint message
                    this.showNotification(hint.explanation, 'info');
                    
                    // Auto-fill if it's a naked single
                    if (hint.technique === 'naked_single') {
                        setTimeout(() => {
                            this.inputNumber(hint.value);
                        }, 1000);
                    }
                }
            } else {
                this.showNotification(data.message || 'No hints available', 'warning');
            }
        } catch (error) {
            this.showNotification('Failed to get hint: ' + error.message, 'error');
        }
    }
    
    async validatePuzzle() {
        try {
            const response = await fetch(`${this.apiUrl}/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grid: this.currentGrid
                })
            });
            
            const data = await response.json();
            
            // Clear previous error highlights
            this.clearHighlights();
            
            if (data.errors && data.errors.length > 0) {
                // Highlight errors
                data.errors.forEach(error => {
                    const cell = document.querySelector(`[data-row="${error.row}"][data-col="${error.col}"]`);
                    if (cell) {
                        cell.classList.add('error');
                    }
                });
                
                this.showNotification(`Found ${data.errors.length} error(s)`, 'error');
            } else if (data.is_complete) {
                this.completePuzzle();
            } else {
                this.showNotification('No errors found. Keep going!', 'success');
            }
        } catch (error) {
            this.showNotification('Failed to validate puzzle: ' + error.message, 'error');
        }
    }
    
    isPuzzleComplete() {
        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.currentGrid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // TODO: Add validation check here
        return true;
    }
    
    async completePuzzle() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        this.stopTimer();
        
        // Animate completion
        document.querySelectorAll('.cell').forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('completed');
            }, index * 20);
        });
        
        // Save completion data
        if (this.gameId) {
            try {
                await fetch(`${this.apiUrl}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        game_id: this.gameId,
                        time_spent: this.gameTime,
                        moves: this.moveCount
                    })
                });
            } catch (error) {
                console.error('Failed to save completion data:', error);
            }
        }
        
        // Show success modal
        setTimeout(() => {
            this.showSuccessModal();
        }, 1000);
    }
    
    showSuccessModal() {
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        document.getElementById('finalMoves').textContent = this.moveCount;
        document.getElementById('finalDifficulty').textContent = 
            this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        
        this.showModal('successModal');
        
        // Play success animation
        this.playSuccessAnimation();
    }
    
    playSuccessAnimation() {
        // Create confetti effect
        const confetti = document.querySelector('.confetti');
        confetti.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animation = 'confetti-fall 3s ease-out infinite';
            confetti.appendChild(particle);
        }
    }
    
    resetPuzzle() {
        if (confirm('Are you sure you want to reset the puzzle?')) {
            this.currentGrid = this.originalPuzzle.map(row => [...row]);
            this.moveCount = 0;
            this.isCompleted = false;
            this.resetTimer();
            this.startTimer();
            
            // Update UI
            document.getElementById('moveCounter').textContent = '0';
            this.renderPuzzle();
            this.clearHighlights();
            
            // Clear undo/redo stacks
            this.undoStack = [];
            this.redoStack = [];
            
            this.showNotification('Puzzle reset!', 'info');
        }
    }
    
    togglePause() {
        const pauseBtn = document.getElementById('pauseBtn');
        const icon = pauseBtn.querySelector('i');
        
        if (this.isPaused) {
            this.startTimer();
            icon.className = 'fas fa-pause';
            pauseBtn.querySelector('span').textContent = 'Pause';
            document.querySelector('.game-board').style.filter = 'none';
        } else {
            this.stopTimer();
            icon.className = 'fas fa-play';
            pauseBtn.querySelector('span').textContent = 'Resume';
            document.querySelector('.game-board').style.filter = 'blur(4px)';
        }
        
        this.isPaused = !this.isPaused;
    }
    
    startTimer() {
        if (this.timer) return;
        
        this.startTime = Date.now() - this.gameTime * 1000;
        this.timer = setInterval(() => {
            this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('gameTimer').textContent = this.formatTime(this.gameTime);
        }, 1000);
        
        this.isPaused = false;
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    resetTimer() {
        this.stopTimer();
        this.gameTime = 0;
        document.getElementById('gameTimer').textContent = '00:00';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    async autoSave() {
        if (!this.gameId) return;
        
        try {
            await fetch(`${this.apiUrl}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: this.gameId,
                    current_state: this.currentGrid,
                    moves: this.moveCount,
                    time_spent: this.gameTime
                })
            });
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch(`${this.apiUrl}/stats`);
            const data = await response.json();
            
            this.stats = data;
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.stats = {
                games_completed: 0,
                total_time: 0,
                best_times: {
                    easy: null,
                    medium: null,
                    hard: null,
                    expert: null
                }
            };
        }
    }
    
    async showStats() {
        await this.loadStats();
        
        document.getElementById('totalGames').textContent = this.stats.games_completed;
        document.getElementById('totalTime').textContent = this.formatTime(this.stats.total_time);
        
        document.getElementById('bestTimeEasy').textContent = 
            this.stats.best_times.easy ? this.formatTime(this.stats.best_times.easy) : '--:--';
        document.getElementById('bestTimeMedium').textContent = 
            this.stats.best_times.medium ? this.formatTime(this.stats.best_times.medium) : '--:--';
        document.getElementById('bestTimeHard').textContent = 
            this.stats.best_times.hard ? this.formatTime(this.stats.best_times.hard) : '--:--';
        document.getElementById('bestTimeExpert').textContent = 
            this.stats.best_times.expert ? this.formatTime(this.stats.best_times.expert) : '--:--';
        
        this.showModal('statsModal');
    }
    
    showAutoSolveModal() {
        // Reset controls
        document.getElementById('solveControls').style.display = 'none';
        this.showModal('autoSolveModal');
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        
        // Focus trap
        const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }
    
    showLoading(text = 'Loading...') {
        document.getElementById('loadingText').textContent = text;
        document.getElementById('loadingOverlay').classList.add('show');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sudoku-theme', newTheme);
        
        // Update icon
        const icon = document.getElementById('themeToggle').querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('sudoku-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update icon
        const icon = document.getElementById('themeToggle').querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sudokuGame = new SudokuGame();
});

// Handle page visibility for timer pause/resume
document.addEventListener('visibilitychange', () => {
    if (window.sudokuGame) {
        if (document.hidden && !window.sudokuGame.isPaused) {
            window.sudokuGame.togglePause();
        }
    }
});
