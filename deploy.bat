@echo off
echo 🚀 Starting BodhAI Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing frontend dependencies...
npm install

echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

REM Build frontend
echo 🏗️ Building frontend...
npm run build

echo ✅ BodhAI is ready for deployment!
echo.
echo Next steps:
echo 1. Deploy frontend to Vercel: vercel --prod
echo 2. Deploy backend to Railway/Render
echo 3. Update environment variables
echo 4. Test the deployed application

pause