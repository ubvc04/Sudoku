#!/bin/bash

echo ""
echo "===================================="
echo "   🎯 Sudoku Solver Game Setup"
echo "===================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python is not installed"
        echo "Please install Python 3.8 or higher"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python found"
echo ""

# Check Python version
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
    echo "❌ Python version $PYTHON_VERSION is too old"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "✅ Python version $PYTHON_VERSION is compatible"
echo ""

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    if ! command -v pip &> /dev/null; then
        echo "❌ pip is not available"
        echo "Please install pip"
        exit 1
    else
        PIP_CMD="pip"
    fi
else
    PIP_CMD="pip3"
fi

echo "✅ pip found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
$PIP_CMD install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    echo "Please check your internet connection and try again"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create necessary directories
mkdir -p data sessions

echo "📁 Created necessary directories"
echo ""

echo "🚀 Starting Sudoku Game..."
echo ""
echo "The game will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the application
$PYTHON_CMD app.py

echo ""
echo "👋 Thanks for playing Sudoku!"
