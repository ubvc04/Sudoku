from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from flask_session import Session
import os
import json
import sqlite3
from datetime import datetime
import uuid
from backend.sudoku_engine import SudokuGenerator, SudokuSolver


app = Flask(__name__, 
           template_folder='frontend/templates',
           static_folder='frontend/static')

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './sessions'
app.config['SESSION_PERMANENT'] = False

# Initialize extensions
CORS(app, supports_credentials=True)
Session(app)

# Initialize game engines
generator = SudokuGenerator()
solver = SudokuSolver()

# Database setup
def init_db():
    """Initialize the SQLite database."""
    os.makedirs('data', exist_ok=True)
    conn = sqlite3.connect('data/sudoku.db')
    cursor = conn.cursor()
    
    # Games table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            user_session TEXT,
            puzzle TEXT,
            solution TEXT,
            current_state TEXT,
            difficulty TEXT,
            created_at TIMESTAMP,
            completed_at TIMESTAMP,
            moves INTEGER DEFAULT 0,
            time_spent INTEGER DEFAULT 0
        )
    ''')
    
    # Statistics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            session_id TEXT,
            games_completed INTEGER DEFAULT 0,
            total_time INTEGER DEFAULT 0,
            best_time_easy INTEGER,
            best_time_medium INTEGER,
            best_time_hard INTEGER,
            best_time_expert INTEGER,
            updated_at TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()


def get_session_id():
    """Get or create session ID."""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    return session['session_id']


@app.route('/')
def index():
    """Serve the main game page."""
    return render_template('index.html')


@app.route('/api/generate/<difficulty>')
def generate_puzzle(difficulty):
    """Generate a new Sudoku puzzle."""
    try:
        if difficulty not in ['easy', 'medium', 'hard', 'expert']:
            return jsonify({'error': 'Invalid difficulty level'}), 400
        
        # Generate puzzle
        puzzle_data = generator.generate_puzzle(difficulty)
        
        # Save to database
        game_id = str(uuid.uuid4())
        session_id = get_session_id()
        
        conn = sqlite3.connect('data/sudoku.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO games (id, user_session, puzzle, solution, current_state, difficulty, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            game_id,
            session_id,
            json.dumps(puzzle_data['puzzle']),
            json.dumps(puzzle_data['solution']),
            json.dumps(puzzle_data['puzzle']),
            difficulty,
            datetime.now()
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'game_id': game_id,
            'puzzle': puzzle_data['puzzle'],
            'difficulty': difficulty,
            'timestamp': puzzle_data['timestamp']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/solve', methods=['POST'])
def solve_puzzle():
    """Solve a Sudoku puzzle with step-by-step tracking."""
    try:
        data = request.get_json()
        grid = data.get('grid')
        show_steps = data.get('show_steps', False)
        
        if not grid or len(grid) != 9 or any(len(row) != 9 for row in grid):
            return jsonify({'error': 'Invalid grid format'}), 400
        
        if show_steps:
            success, steps = solver.solve_with_steps(grid)
            if success:
                return jsonify({
                    'success': True,
                    'solution': solver.grid,
                    'steps': steps,
                    'total_steps': len(steps)
                })
            else:
                return jsonify({'error': 'No solution exists'}), 400
        else:
            solution = solver.solve(grid)
            if solution:
                return jsonify({
                    'success': True,
                    'solution': solution
                })
            else:
                return jsonify({'error': 'No solution exists'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/validate', methods=['POST'])
def validate_puzzle():
    """Validate current puzzle state."""
    try:
        data = request.get_json()
        grid = data.get('grid')
        
        if not grid or len(grid) != 9 or any(len(row) != 9 for row in grid):
            return jsonify({'error': 'Invalid grid format'}), 400
        
        validation = solver.validate_solution(grid)
        return jsonify(validation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/hint', methods=['POST'])
def get_hint():
    """Get a hint for the next move."""
    try:
        data = request.get_json()
        grid = data.get('grid')
        
        if not grid or len(grid) != 9 or any(len(row) != 9 for row in grid):
            return jsonify({'error': 'Invalid grid format'}), 400
        
        hint = solver.get_hint(grid)
        if hint:
            return jsonify({
                'success': True,
                'hint': hint
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No hints available - puzzle may be complete or invalid'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/save', methods=['POST'])
def save_game():
    """Save current game state."""
    try:
        data = request.get_json()
        game_id = data.get('game_id')
        current_state = data.get('current_state')
        moves = data.get('moves', 0)
        time_spent = data.get('time_spent', 0)
        
        if not game_id or not current_state:
            return jsonify({'error': 'Missing required data'}), 400
        
        session_id = get_session_id()
        
        conn = sqlite3.connect('data/sudoku.db')
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE games 
            SET current_state = ?, moves = ?, time_spent = ?
            WHERE id = ? AND user_session = ?
        ''', (json.dumps(current_state), moves, time_spent, game_id, session_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Game not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/load/<game_id>')
def load_game(game_id):
    """Load a saved game."""
    try:
        session_id = get_session_id()
        
        conn = sqlite3.connect('data/sudoku.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT puzzle, solution, current_state, difficulty, moves, time_spent, created_at
            FROM games 
            WHERE id = ? AND user_session = ?
        ''', (game_id, session_id))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'error': 'Game not found'}), 404
        
        puzzle, solution, current_state, difficulty, moves, time_spent, created_at = result
        
        return jsonify({
            'success': True,
            'game_id': game_id,
            'puzzle': json.loads(puzzle),
            'solution': json.loads(solution),
            'current_state': json.loads(current_state),
            'difficulty': difficulty,
            'moves': moves,
            'time_spent': time_spent,
            'created_at': created_at
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/games')
def list_games():
    """List all saved games for current session."""
    try:
        session_id = get_session_id()
        
        conn = sqlite3.connect('data/sudoku.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, difficulty, moves, time_spent, created_at, completed_at
            FROM games 
            WHERE user_session = ?
            ORDER BY created_at DESC
        ''', (session_id,))
        
        games = []
        for row in cursor.fetchall():
            games.append({
                'id': row[0],
                'difficulty': row[1],
                'moves': row[2],
                'time_spent': row[3],
                'created_at': row[4],
                'completed_at': row[5],
                'is_completed': row[5] is not None
            })
        
        conn.close()
        return jsonify({'games': games})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/complete', methods=['POST'])
def complete_game():
    """Mark a game as completed and update statistics."""
    try:
        data = request.get_json()
        game_id = data.get('game_id')
        final_time = data.get('time_spent', 0)
        moves = data.get('moves', 0)
        
        if not game_id:
            return jsonify({'error': 'Missing game_id'}), 400
        
        session_id = get_session_id()
        
        conn = sqlite3.connect('data/sudoku.db')
        cursor = conn.cursor()
        
        # Update game completion
        cursor.execute('''
            UPDATE games 
            SET completed_at = ?, time_spent = ?, moves = ?
            WHERE id = ? AND user_session = ?
        ''', (datetime.now(), final_time, moves, game_id, session_id))
        
        # Get game difficulty for stats
        cursor.execute('SELECT difficulty FROM games WHERE id = ?', (game_id,))
        difficulty = cursor.fetchone()[0]
        
        # Update user statistics
        cursor.execute('''
            SELECT games_completed, total_time, best_time_easy, best_time_medium, 
                   best_time_hard, best_time_expert 
            FROM user_stats WHERE session_id = ?
        ''', (session_id,))
        
        stats = cursor.fetchone()
        if stats:
            games_completed, total_time, best_easy, best_medium, best_hard, best_expert = stats
            games_completed += 1
            total_time += final_time
            
            # Update best times
            if difficulty == 'easy' and (not best_easy or final_time < best_easy):
                best_easy = final_time
            elif difficulty == 'medium' and (not best_medium or final_time < best_medium):
                best_medium = final_time
            elif difficulty == 'hard' and (not best_hard or final_time < best_hard):
                best_hard = final_time
            elif difficulty == 'expert' and (not best_expert or final_time < best_expert):
                best_expert = final_time
            
            cursor.execute('''
                UPDATE user_stats 
                SET games_completed = ?, total_time = ?, best_time_easy = ?, 
                    best_time_medium = ?, best_time_hard = ?, best_time_expert = ?,
                    updated_at = ?
                WHERE session_id = ?
            ''', (games_completed, total_time, best_easy, best_medium, best_hard, 
                  best_expert, datetime.now(), session_id))
        else:
            # Create new stats entry
            best_times = {
                'easy': final_time if difficulty == 'easy' else None,
                'medium': final_time if difficulty == 'medium' else None,
                'hard': final_time if difficulty == 'hard' else None,
                'expert': final_time if difficulty == 'expert' else None
            }
            
            cursor.execute('''
                INSERT INTO user_stats 
                (session_id, games_completed, total_time, best_time_easy, 
                 best_time_medium, best_time_hard, best_time_expert, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (session_id, 1, final_time, best_times['easy'], best_times['medium'],
                  best_times['hard'], best_times['expert'], datetime.now()))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats')
def get_stats():
    """Get user statistics."""
    try:
        session_id = get_session_id()
        
        conn = sqlite3.connect('data/sudoku.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT games_completed, total_time, best_time_easy, best_time_medium,
                   best_time_hard, best_time_expert
            FROM user_stats WHERE session_id = ?
        ''', (session_id,))
        
        stats = cursor.fetchone()
        conn.close()
        
        if stats:
            return jsonify({
                'games_completed': stats[0],
                'total_time': stats[1],
                'best_times': {
                    'easy': stats[2],
                    'medium': stats[3],
                    'hard': stats[4],
                    'expert': stats[5]
                }
            })
        else:
            return jsonify({
                'games_completed': 0,
                'total_time': 0,
                'best_times': {
                    'easy': None,
                    'medium': None,
                    'hard': None,
                    'expert': None
                }
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
