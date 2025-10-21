#!/bin/bash

# AI Financial Coach Setup Script
# This script sets up the development environment for the AI Financial Coach application

set -e  # Exit on any error

echo "🚀 Setting up AI Financial Coach..."
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | grep -oE '[0-9]+\.[0-9]+')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
        print_error "Python 3.9+ is required. Found version: $(python3 --version)"
        exit 1
    fi
    print_status "Python $(python3 --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+') found"
else
    print_error "Python 3 is required but not installed."
    print_info "Install from: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js version  
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | grep -oE '[0-9]+\.[0-9]+')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [ "$NODE_MAJOR" -lt 16 ]; then
        print_error "Node.js 16+ is required. Found version: $(node --version)"
        exit 1
    fi
    print_status "Node.js $(node --version) found"
else
    print_error "Node.js is required but not installed."
    print_info "Install from: https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed."
    exit 1
fi

print_status "Prerequisites check passed"
echo ""

# Setup backend
echo "📦 Setting up backend environment..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_info "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_status "Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
    elif [ -f env_template.txt ]; then
        cp env_template.txt .env
        print_status "Created .env file from env_template.txt"
    else
        print_warning ".env.example file not found, creating basic .env file"
        cat > .env << EOF
# Capital One Nessie API Key
CAPITAL_ONE_KEY=your_nessie_api_key_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Mediastack API Key (Optional)
MEDIASTACK_API_KEY=your_mediastack_api_key_here
EOF
    fi
    
    echo ""
    print_warning "⚠️  IMPORTANT: Please add your API keys to backend/.env"
    print_info "   📍 Get Nessie API key: http://api.nessieisreal.com/"
    print_info "   📍 Get Gemini API key: https://makersuite.google.com/app/apikey"
    print_info "   📍 Get Mediastack API key (optional): https://mediastack.com/"
    echo ""
else
    print_status ".env file already exists"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend environment..."
cd frontend

# Install Node.js dependencies
print_info "Installing Node.js dependencies..."
npm install
print_status "Frontend dependencies installed"

cd ..

# Final success message
echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
print_info "Project structure:"
echo "   📁 backend/     - Flask API server"
echo "   📁 frontend/    - React web application"
echo "   📄 README.md    - Project documentation"
echo "   📄 CONTRIBUTING.md - Contribution guidelines"
echo ""
print_info "Next steps:"
echo "   1️⃣  Configure API keys in backend/.env"
echo "   2️⃣  Start backend server:"
echo "      cd backend && source venv/bin/activate && python app.py"
echo "   3️⃣  Start frontend (in new terminal):"
echo "      cd frontend && npm start"
echo "   4️⃣  Open http://localhost:3000 in your browser"
echo ""
print_info "Development commands:"
echo "   🔧 Backend tests: cd backend && python -m pytest"
echo "   🔧 Frontend tests: cd frontend && npm test"
echo "   🔧 Build frontend: cd frontend && npm run build"
echo ""
print_status "Happy coding! 🚀"
