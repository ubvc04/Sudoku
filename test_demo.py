#!/usr/bin/env python3
"""
Sudoku Game Demo Script
Tests the core functionality to ensure everything works correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.sudoku_engine import SudokuGenerator, SudokuSolver


def print_grid(grid, title="Grid"):
    """Pretty print a Sudoku grid."""
    print(f"\n{title}:")
    print("┌─────────┬─────────┬─────────┐")
    for i in range(9):
        if i > 0 and i % 3 == 0:
            print("├─────────┼─────────┼─────────┤")
        row = "│ "
        for j in range(9):
            if j > 0 and j % 3 == 0:
                row += "│ "
            if grid[i][j] == 0:
                row += "· "
            else:
                row += f"{grid[i][j]} "
        row += "│"
        print(row)
    print("└─────────┴─────────┴─────────┘")


def test_puzzle_generation():
    """Test puzzle generation for all difficulties."""
    print("🎯 Testing Puzzle Generation...")
    generator = SudokuGenerator()
    
    difficulties = ['easy', 'medium', 'hard', 'expert']
    
    for difficulty in difficulties:
        print(f"\n📋 Generating {difficulty.capitalize()} puzzle...")
        puzzle_data = generator.generate_puzzle(difficulty)
        
        puzzle = puzzle_data['puzzle']
        solution = puzzle_data['solution']
        
        # Count given numbers
        given_count = sum(row.count(0) for row in puzzle)
        total_given = 81 - given_count
        
        print(f"✅ Generated {difficulty} puzzle with {total_given} given numbers")
        print_grid(puzzle, f"{difficulty.capitalize()} Puzzle")
        
        # Verify solution is valid
        solver = SudokuSolver()
        validation = solver.validate_solution(solution)
        
        if validation['is_valid'] and validation['is_complete']:
            print(f"✅ Solution is valid and complete")
        else:
            print(f"❌ Solution validation failed")
            return False
    
    return True


def test_puzzle_solving():
    """Test puzzle solving capabilities."""
    print("\n🧩 Testing Puzzle Solving...")
    generator = SudokuGenerator()
    solver = SudokuSolver()
    
    # Generate a medium puzzle
    puzzle_data = generator.generate_puzzle('medium')
    puzzle = puzzle_data['puzzle']
    expected_solution = puzzle_data['solution']
    
    print_grid(puzzle, "Original Puzzle")
    
    # Solve the puzzle
    print("\n🔍 Solving puzzle...")
    solved_grid = solver.solve([row[:] for row in puzzle])
    
    if solved_grid:
        print("✅ Puzzle solved successfully!")
        print_grid(solved_grid, "Solved Puzzle")
        
        # Verify the solution matches expected
        if solved_grid == expected_solution:
            print("✅ Solution matches expected result")
            return True
        else:
            print("❌ Solution doesn't match expected result")
            return False
    else:
        print("❌ Failed to solve puzzle")
        return False


def test_hint_system():
    """Test the hint system."""
    print("\n💡 Testing Hint System...")
    generator = SudokuGenerator()
    solver = SudokuSolver()
    
    # Generate an easy puzzle
    puzzle_data = generator.generate_puzzle('easy')
    puzzle = puzzle_data['puzzle']
    
    print_grid(puzzle, "Puzzle for Hint Testing")
    
    # Get a hint
    hint = solver.get_hint(puzzle)
    
    if hint:
        print(f"✅ Hint received: {hint['explanation']}")
        if 'value' in hint:
            print(f"   Suggested value: {hint['value']} at position ({hint['row']+1}, {hint['col']+1})")
        elif 'candidates' in hint:
            print(f"   Possible candidates: {hint['candidates']} at position ({hint['row']+1}, {hint['col']+1})")
        return True
    else:
        print("❌ No hint available")
        return False


def test_validation():
    """Test puzzle validation."""
    print("\n✅ Testing Validation System...")
    solver = SudokuSolver()
    
    # Test valid complete grid
    valid_grid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
    
    validation = solver.validate_solution(valid_grid)
    if validation['is_valid'] and validation['is_complete']:
        print("✅ Valid complete grid recognized correctly")
    else:
        print("❌ Valid complete grid validation failed")
        return False
    
    # Test invalid grid (duplicate in row)
    invalid_grid = [row[:] for row in valid_grid]
    invalid_grid[0][1] = invalid_grid[0][0]  # Create duplicate
    
    validation = solver.validate_solution(invalid_grid)
    if not validation['is_valid']:
        print("✅ Invalid grid detected correctly")
        print(f"   Found {len(validation['errors'])} error(s)")
    else:
        print("❌ Invalid grid not detected")
        return False
    
    return True


def run_all_tests():
    """Run all tests."""
    print("🚀 Starting Sudoku Game Tests...\n")
    
    tests = [
        ("Puzzle Generation", test_puzzle_generation),
        ("Puzzle Solving", test_puzzle_solving),
        ("Hint System", test_hint_system),
        ("Validation System", test_validation)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running {test_name} Test")
        print('='*50)
        
        try:
            result = test_func()
            results.append((test_name, result))
            
            if result:
                print(f"\n✅ {test_name} test PASSED")
            else:
                print(f"\n❌ {test_name} test FAILED")
                
        except Exception as e:
            print(f"\n💥 {test_name} test ERROR: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n{'='*50}")
    print("TEST SUMMARY")
    print('='*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The Sudoku game is ready to play!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the issues above.")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    
    if success:
        print("\n🎯 You can now run the game with:")
        print("   python app.py")
        print("   or")
        print("   ./run.sh (Linux/Mac)")
        print("   or")
        print("   run.bat (Windows)")
    
    sys.exit(0 if success else 1)
