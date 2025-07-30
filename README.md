# BodhAI - AI-Powered Personalized Learning Platform

<div align="center">

![BodhAI Logo](public/Bodh_Main_Full.png)

**Revolutionize your learning with BodhAI's intelligent education platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green?style=for-the-badge&logo=python)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-red?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.16.0-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Integrated-purple?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

## 🚀 Overview

BodhAI is an advanced AI-powered personalized learning platform designed specifically for competitive exam preparation (JEE Main, JEE Advanced, NEET, BITSAT). The platform leverages cutting-edge artificial intelligence to create personalized learning experiences, adaptive assessments, and intelligent performance analytics.

### 🎯 Key Features

- **🧠 AI-Powered Personalization**: Gemini AI analyzes performance and creates personalized study plans
- **🎯 Intelligent Test Generation**: ChromaDB vector database for smart question selection
- **📊 Advanced Analytics**: Comprehensive performance tracking with interactive visualizations
- **🔄 Adaptive Learning**: System learns from mistakes and focuses on weak areas
- **⚡ Real-time Feedback**: Instant analysis and recommendations
- **🔐 Secure Authentication**: Clerk-based user management
- **📱 Responsive Design**: Works seamlessly across all devices

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.2 with React 19.0.0
- **Styling**: Tailwind CSS 4.0 with custom design system
- **Authentication**: Clerk (@clerk/nextjs 6.24.0)
- **Charts & Visualizations**: 
  - Recharts 2.15.3 (Bar charts, Radar charts)
  - ApexCharts 5.2.0 (Advanced donut charts)
- **Math Rendering**: KaTeX 0.16.22 with react-katex 3.1.0
- **Markdown Support**: react-markdown 10.1.0 with remark-math 6.0.0
- **Icons**: Heroicons, Lucide React, React Icons
- **Animations**: GSAP 3.13.0

### Backend
- **Framework**: Flask 3.0.0 with Flask-CORS 4.0.0
- **AI Integration**: Google Generative AI (Gemini 2.5-flash)
- **Vector Database**: ChromaDB 0.4.22 for intelligent question retrieval
- **Embeddings**: Sentence Transformers 2.2.2
- **Database**: MongoDB 6.16.0 with PyMongo 4.6.1
- **Environment**: python-dotenv 1.0.0
- **Scientific Computing**: NumPy 1.24.3

### DevOps & Tools
- **Package Manager**: npm (frontend), pip (backend)
- **Code Quality**: ESLint with Next.js configuration
- **Version Control**: Git
- **Environment Management**: .env files for configuration

## 🎯 Project Workflow

### 1. User Authentication & Onboarding
```
User Registration → Clerk Authentication → Profile Creation → Initial Assessment
```

### 2. Intelligent Test Generation
```
User Request → AI Analysis → ChromaDB Query → Personalized Question Selection → Test Creation
```

### 3. Test Taking Experience
```
Question Display → Math Rendering → Answer Collection → Real-time Validation → Progress Tracking
```

### 4. AI-Powered Analysis
```
Test Completion → Gemini AI Analysis → Performance Insights → Personalized Recommendations → Study Plan Generation
```

### 5. Progress Tracking
```
Historical Data → Performance Analytics → Trend Analysis → Weakness Identification → Adaptive Learning Path
```

## 🌟 Key Features Deep Dive

### 🧠 Intelligent Question Selection
- **60% Weak Topics**: AI identifies and focuses on areas needing improvement
- **25% Mistake Patterns**: Questions similar to previous mistakes for reinforcement
- **15% General Coverage**: Maintains breadth across all topics
- **Zero Repetition**: Advanced tracking prevents question repetition

### 📊 Advanced Analytics Dashboard
- **Performance Trends**: Visual representation of learning progress
- **Subject-wise Analysis**: Detailed breakdown by Physics, Chemistry, Mathematics
- **Time Management Insights**: Efficiency metrics and optimization suggestions
- **Comparative Analysis**: Benchmarking against peer performance

### 🎯 Personalized Learning Paths
- **Adaptive Difficulty**: Questions adjust based on performance
- **Smart Recommendations**: AI-generated study plans and resource suggestions
- **Progress Milestones**: Clear goals and achievement tracking
- **Motivational Insights**: Encouraging feedback and progress highlights

### 🔍 Comprehensive Test Analysis
- **Error Pattern Recognition**: Identifies common mistake types
- **Conceptual Gap Analysis**: Pinpoints specific knowledge gaps
- **Time Optimization**: Strategies for better time management
- **Strength Reinforcement**: Builds confidence in strong areas

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB Atlas account
- Google AI Studio account (for Gemini API)
- Clerk account for authentication

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/bodhai-learning-platform.git
cd bodhai-learning-platform
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Add your Clerk keys to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your credentials to .env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Setup
```bash
# The application will automatically create necessary collections
# Ensure your MongoDB Atlas cluster is accessible
# Load initial question data (if available)
python manage_chromadb.py
```

### 5. Start the Application
```bash
# Terminal 1: Start Backend Server
cd backend
python server.py
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend Server
cd ..
npm run dev
# Application runs on http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GEMINI_API_KEY=AIzaSy...
```

### Database Collections
- `user_profiles`: User information and learning preferences
- `test_results`: Historical test performance data
- `questions`: Question bank with metadata
- `user_tasks`: Task management and progress tracking

### ChromaDB Collections
- `questions_jee_main`: JEE Main questions with embeddings
- `questions_jee_advanced`: JEE Advanced questions
- `questions_neet`: NEET questions
- `questions_bitsat`: BITSAT questions

## 🚀 Deployment

### Production Deployment

#### Frontend (Vercel - Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Backend (Railway/Heroku/DigitalOcean)
```bash
# For Railway deployment
# 1. Connect GitHub repository
# 2. Set environment variables
# 3. Deploy automatically

# For Docker deployment
docker build -t bodhai-backend ./backend
docker run -p 5000:5000 bodhai-backend
```

#### Database (MongoDB Atlas)
```bash
# 1. Create MongoDB Atlas cluster
# 2. Configure network access
# 3. Create database user
# 4. Get connection string
```

### Environment-Specific Configurations

#### Development
```bash
# Frontend
npm run dev

# Backend
python server.py
```

#### Production
```bash
# Frontend
npm run build
npm start

# Backend
gunicorn --bind 0.0.0.0:5000 server:app
```

## 📁 Project Structure

```
bodhai-learning-platform/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── homepage.js      # Landing page component
│   │   │   ├── sidebar.js       # Navigation sidebar
│   │   │   ├── MathRenderer.js  # LaTeX math rendering
│   │   │   └── navbar.js        # Top navigation
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── mockTests/           # Test selection interface
│   │   ├── takeTest/            # Test taking interface
│   │   │   ├── page.js          # Main test component
│   │   │   └── GeminiAnalysisDashboard.js  # AI analysis display
│   │   ├── studyPlanner/        # Study planning tools
│   │   ├── quickNotes/          # Note-taking feature
│   │   ├── profile/             # User profile management
│   │   └── login/               # Authentication pages
│   ├── lib/                     # Utility functions
│   └── types/                   # TypeScript definitions
├── backend/
│   ├── server.py                # Main Flask application
│   ├── gemini_analyzer.py       # AI analysis service
│   ├── vector_db.py             # ChromaDB management
│   ├── models.py                # Data models
│   ├── requirements.txt         # Python dependencies
│   ├── chroma_db/               # Vector database storage
│   ├── pyqs/                    # Question bank data
│   └── routes/                  # API route handlers
├── public/                      # Static assets
├── package.json                 # Frontend dependencies
├── tailwind.config.js           # Styling configuration
├── next.config.mjs              # Next.js configuration
└── README.md                    # Project documentation
```

## 🤝 Contributing

We welcome contributions to BodhAI! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Areas for Contribution
- 🐛 Bug fixes and performance improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage expansion
- 🌐 Internationalization support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 BodhAI Learning Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Google AI**: For providing the powerful Gemini AI API
- **Clerk**: For seamless authentication solutions
- **MongoDB**: For reliable database services
- **Vercel**: For excellent deployment platform
- **Open Source Community**: For the amazing libraries and tools

## 📞 Support & Contact

- **Documentation**: [docs.bodhai.com](https://docs.bodhai.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/bodhai-learning-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/bodhai-learning-platform/discussions)
- **Email**: support@bodhai.com

---

<div align="center">

**Built with ❤️ for learners, by learners**

[Website](https://bodhai.com) • [Documentation](https://docs.bodhai.com) • [Community](https://community.bodhai.com)

</div>