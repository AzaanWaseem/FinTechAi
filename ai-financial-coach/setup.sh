#!/bin/bash

echo "🚀 Setting up AI Financial Coach..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo "📦 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp env_template.txt .env
    echo "📝 Created .env file - please add your API keys!"
    echo "   - Get Nessie API key: http://api.nessieisreal.com/"
    echo "   - Get Gemini API key: https://makersuite.google.com/app/apikey"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your API keys to backend/.env"
echo "2. Start backend: cd backend && source venv/bin/activate && python app.py"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🚀"
