#!/bin/bash

# BodhAI Deployment Script
echo "🚀 Starting BodhAI Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Test backend health
echo "🔍 Testing backend health..."
cd backend
python -c "
import sys
try:
    from server import app
    print('✅ Backend imports successful')
except ImportError as e:
    print(f'❌ Backend import error: {e}')
    sys.exit(1)
"
cd ..

echo "✅ BodhAI is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy frontend to Vercel: vercel --prod"
echo "2. Deploy backend to Railway/Render"
echo "3. Update environment variables"
echo "4. Test the deployed application"