@echo off
echo.
echo ====================================
echo    🎯 Sudoku Solver Game Setup
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not available
    echo Please ensure pip is installed with Python
    pause
    exit /b 1
)

echo ✅ pip found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Create necessary directories
if not exist "data" mkdir data
if not exist "sessions" mkdir sessions

echo 📁 Created necessary directories
echo.

echo 🚀 Starting Sudoku Game...
echo.
echo The game will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the application
python app.py

echo.
echo 👋 Thanks for playing Sudoku!
pause
