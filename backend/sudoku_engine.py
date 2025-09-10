import random
import copy
from typing import List, Tuple, Optional, Dict, Any
import time


class SudokuGenerator:
    """Advanced Sudoku puzzle generator with multiple difficulty levels."""
    
    def __init__(self):
        self.grid = [[0 for _ in range(9)] for _ in range(9)]
        self.solution = None
        
    def is_valid(self, grid: List[List[int]], row: int, col: int, num: int) -> bool:
        """Check if placing num at (row, col) is valid."""
        # Check row
        for x in range(9):
            if grid[row][x] == num:
                return False
        
        # Check column
        for x in range(9):
            if grid[x][col] == num:
                return False
        
        # Check 3x3 box
        start_row = row - row % 3
        start_col = col - col % 3
        for i in range(3):
            for j in range(3):
                if grid[i + start_row][j + start_col] == num:
                    return False
        
        return True
    
    def solve_grid(self, grid: List[List[int]]) -> bool:
        """Solve the grid using backtracking."""
        for i in range(9):
            for j in range(9):
                if grid[i][j] == 0:
                    for num in range(1, 10):
                        if self.is_valid(grid, i, j, num):
                            grid[i][j] = num
                            if self.solve_grid(grid):
                                return True
                            grid[i][j] = 0
                    return False
        return True
    
    def fill_grid(self, grid: List[List[int]]) -> bool:
        """Fill the grid with a valid complete solution."""
        for i in range(9):
            for j in range(9):
                if grid[i][j] == 0:
                    numbers = list(range(1, 10))
                    random.shuffle(numbers)
                    for num in numbers:
                        if self.is_valid(grid, i, j, num):
                            grid[i][j] = num
                            if self.fill_grid(grid):
                                return True
                            grid[i][j] = 0
                    return False
        return True
    
    def count_solutions(self, grid: List[List[int]], max_solutions: int = 2) -> int:
        """Count the number of solutions for a given grid."""
        solutions = [0]
        
        def solve_count(grid_copy):
            if solutions[0] >= max_solutions:
                return
            
            for i in range(9):
                for j in range(9):
                    if grid_copy[i][j] == 0:
                        for num in range(1, 10):
                            if self.is_valid(grid_copy, i, j, num):
                                grid_copy[i][j] = num
                                solve_count(grid_copy)
                                grid_copy[i][j] = 0
                        return
            solutions[0] += 1
        
        solve_count([row[:] for row in grid])
        return solutions[0]
    
    def remove_numbers(self, grid: List[List[int]], difficulty: str) -> List[List[int]]:
        """Remove numbers from a complete grid based on difficulty."""
        difficulty_settings = {
            'easy': {'attempts': 5, 'min_filled': 45},
            'medium': {'attempts': 10, 'min_filled': 35},
            'hard': {'attempts': 15, 'min_filled': 28},
            'expert': {'attempts': 25, 'min_filled': 22}
        }
        
        settings = difficulty_settings.get(difficulty, difficulty_settings['medium'])
        puzzle = [row[:] for row in grid]
        
        attempts = settings['attempts']
        min_filled = settings['min_filled']
        
        cells = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(cells)
        
        removed_count = 0
        max_remove = 81 - min_filled
        
        for row, col in cells:
            if removed_count >= max_remove:
                break
                
            backup = puzzle[row][col]
            puzzle[row][col] = 0
            
            # Check if puzzle still has unique solution
            if self.count_solutions(puzzle) == 1:
                removed_count += 1
            else:
                puzzle[row][col] = backup
        
        return puzzle
    
    def generate_puzzle(self, difficulty: str = 'medium') -> Dict[str, Any]:
        """Generate a complete Sudoku puzzle with solution."""
        # Create empty grid
        self.grid = [[0 for _ in range(9)] for _ in range(9)]
        
        # Fill the grid completely
        self.fill_grid(self.grid)
        self.solution = [row[:] for row in self.grid]
        
        # Remove numbers based on difficulty
        puzzle = self.remove_numbers(self.grid, difficulty)
        
        return {
            'puzzle': puzzle,
            'solution': self.solution,
            'difficulty': difficulty,
            'timestamp': time.time()
        }


class SudokuSolver:
    """Advanced Sudoku solver with step-by-step tracking."""
    
    def __init__(self):
        self.steps = []
        self.grid = None
    
    def is_valid(self, grid: List[List[int]], row: int, col: int, num: int) -> bool:
        """Check if placing num at (row, col) is valid."""
        # Check row
        for x in range(9):
            if grid[row][x] == num:
                return False
        
        # Check column
        for x in range(9):
            if grid[x][col] == num:
                return False
        
        # Check 3x3 box
        start_row = row - row % 3
        start_col = col - col % 3
        for i in range(3):
            for j in range(3):
                if grid[i + start_row][j + start_col] == num:
                    return False
        
        return True
    
    def get_candidates(self, grid: List[List[int]], row: int, col: int) -> List[int]:
        """Get possible candidates for a cell."""
        if grid[row][col] != 0:
            return []
        
        candidates = []
        for num in range(1, 10):
            if self.is_valid(grid, row, col, num):
                candidates.append(num)
        return candidates
    
    def find_naked_singles(self, grid: List[List[int]]) -> Optional[Tuple[int, int, int]]:
        """Find cells with only one possible candidate."""
        for row in range(9):
            for col in range(9):
                if grid[row][col] == 0:
                    candidates = self.get_candidates(grid, row, col)
                    if len(candidates) == 1:
                        return (row, col, candidates[0])
        return None
    
    def solve_with_steps(self, grid: List[List[int]]) -> Tuple[bool, List[Dict]]:
        """Solve with step-by-step tracking."""
        self.grid = [row[:] for row in grid]
        self.steps = []
        
        def solve_recursive():
            # Try naked singles first
            while True:
                naked_single = self.find_naked_singles(self.grid)
                if naked_single:
                    row, col, num = naked_single
                    self.grid[row][col] = num
                    self.steps.append({
                        'row': row,
                        'col': col,
                        'value': num,
                        'technique': 'naked_single',
                        'grid_state': [row[:] for row in self.grid]
                    })
                else:
                    break
            
            # Find empty cell with minimum candidates
            min_candidates = 10
            best_cell = None
            best_candidates = []
            
            for row in range(9):
                for col in range(9):
                    if self.grid[row][col] == 0:
                        candidates = self.get_candidates(self.grid, row, col)
                        if len(candidates) == 0:
                            return False
                        if len(candidates) < min_candidates:
                            min_candidates = len(candidates)
                            best_cell = (row, col)
                            best_candidates = candidates
            
            if best_cell is None:
                return True  # Solved
            
            row, col = best_cell
            for num in best_candidates:
                self.grid[row][col] = num
                self.steps.append({
                    'row': row,
                    'col': col,
                    'value': num,
                    'technique': 'backtrack',
                    'grid_state': [row[:] for row in self.grid]
                })
                
                if solve_recursive():
                    return True
                
                self.grid[row][col] = 0
                self.steps.append({
                    'row': row,
                    'col': col,
                    'value': 0,
                    'technique': 'backtrack_undo',
                    'grid_state': [row[:] for row in self.grid]
                })
            
            return False
        
        success = solve_recursive()
        return success, self.steps
    
    def solve(self, grid: List[List[int]]) -> List[List[int]]:
        """Solve the puzzle and return the solution."""
        solution = [row[:] for row in grid]
        
        def solve_recursive(grid_to_solve):
            for row in range(9):
                for col in range(9):
                    if grid_to_solve[row][col] == 0:
                        for num in range(1, 10):
                            if self.is_valid(grid_to_solve, row, col, num):
                                grid_to_solve[row][col] = num
                                if solve_recursive(grid_to_solve):
                                    return True
                                grid_to_solve[row][col] = 0
                        return False
            return True
        
        success = solve_recursive(solution)
        return solution if success else None
    
    def validate_solution(self, grid: List[List[int]]) -> Dict[str, Any]:
        """Validate if the current grid state is correct."""
        errors = []
        
        # Check for duplicates in rows
        for row in range(9):
            seen = set()
            for col in range(9):
                if grid[row][col] != 0:
                    if grid[row][col] in seen:
                        errors.append({'type': 'row', 'row': row, 'col': col})
                    seen.add(grid[row][col])
        
        # Check for duplicates in columns
        for col in range(9):
            seen = set()
            for row in range(9):
                if grid[row][col] != 0:
                    if grid[row][col] in seen:
                        errors.append({'type': 'col', 'row': row, 'col': col})
                    seen.add(grid[row][col])
        
        # Check for duplicates in 3x3 boxes
        for box_row in range(3):
            for box_col in range(3):
                seen = set()
                for row in range(box_row * 3, (box_row + 1) * 3):
                    for col in range(box_col * 3, (box_col + 1) * 3):
                        if grid[row][col] != 0:
                            if grid[row][col] in seen:
                                errors.append({'type': 'box', 'row': row, 'col': col})
                            seen.add(grid[row][col])
        
        # Check if complete
        is_complete = all(grid[row][col] != 0 for row in range(9) for col in range(9))
        
        return {
            'is_valid': len(errors) == 0,
            'is_complete': is_complete,
            'errors': errors
        }
    
    def get_hint(self, grid: List[List[int]]) -> Optional[Dict[str, Any]]:
        """Get a hint for the next move."""
        # Try naked singles first
        naked_single = self.find_naked_singles(grid)
        if naked_single:
            row, col, num = naked_single
            return {
                'row': row,
                'col': col,
                'value': num,
                'technique': 'naked_single',
                'explanation': f"Cell ({row+1}, {col+1}) can only be {num}"
            }
        
        # Find cell with minimum candidates
        min_candidates = 10
        best_hint = None
        
        for row in range(9):
            for col in range(9):
                if grid[row][col] == 0:
                    candidates = self.get_candidates(grid, row, col)
                    if len(candidates) < min_candidates and len(candidates) > 0:
                        min_candidates = len(candidates)
                        best_hint = {
                            'row': row,
                            'col': col,
                            'candidates': candidates,
                            'technique': 'candidates',
                            'explanation': f"Cell ({row+1}, {col+1}) can be {', '.join(map(str, candidates))}"
                        }
        
        return best_hint
