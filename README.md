<div align="center">
 <h1> BodhAi</h1>
 <p><strong>AI-Powered JEE Mock Test Generator</strong></p>
 
 <p>An intelligent web application that generates personalized JEE-style mock tests using AI and machine learning techniques.</p>

 ![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
 ![React](https://img.shields.io/badge/React-19+-61dafb.svg)
 ![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)
 ![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
 ![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)
 ![License](https://img.shields.io/badge/License-MIT-yellow.svg)
 
</div>

## Overview

BodhAi is an AI-powered platform that creates personalized JEE mock tests from a curated database of previous year questions. Using advanced NLP and machine learning, it generates contextual questions, provides intelligent test curation, and offers comprehensive performance analytics to help JEE aspirants excel in their preparation.

## Features

- 🧠 **AI Question Generation**: Create original MCQs using **Groq's LLaMA-3** from existing question database
- **Smart Question Selection**: Intelligent curation based on topics and difficulty levels
- **Vector Search**: Fast semantic search using **ChromaDB** and **Sentence Transformers**
- **Performance Analytics**: Detailed subject-wise and topic-wise analysis
- ⏱ **Timed Tests**: Configurable test duration (15 min to 3 hours)
- **Personalized Tests**: Custom question count per subject (Physics, Chemistry, Mathematics)
- **Progress Tracking**: Historical performance with interactive charts
- **Secure Authentication**: User management with **Clerk**
- **Responsive Design**: Modern UI with **Tailwind CSS**
- **Data Persistence**: Test history and results stored in **MongoDB**

## Tech Stack

### Frontend
- **Next.js 15** with **React 19**
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Lucide React** for icons
- **ApexCharts** for data visualization
- **KaTeX** for mathematical notation

### Backend
- **Flask 3.0** (Python)
- **ChromaDB** for vector storage
- **Sentence Transformers** for embeddings
- **Groq API** (LLaMA-3) for question generation
- **PyMongo** for database operations

### Database & Storage
- **MongoDB** for application data
- **ChromaDB** for vector similarity search
- **JSON** files for question bank (pyqs folder)

## Prerequisites

Before running this application, make sure you have:

- **Python 3.8+**
- **Node.js 18+** 
- **MongoDB** (local or cloud)
- **Groq API Key** (for AI question generation)
- **Clerk Account** (for authentication)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bodhai.git
cd bodhai
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

### 3. Frontend Setup
```bash
cd ..
npm install
```

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## ‍ Running the Application

### Development Mode

1. **Start the Backend:**
```bash
cd backend
python server.py
```
The Flask server will run on `http://localhost:5000`

2. **Start the Frontend:**
```bash
npm run dev
```
The Next.js app will run on `http://localhost:3000`

### Production Mode

1. **Build the Frontend:**
```bash
npm run build
npm start
```

2. **Deploy Backend:**
Use your preferred deployment platform (Heroku, Railway, etc.)

## Project Structure

```
bodhai/
 backend/
 server.py # Flask application & API routes
 models.py # Data models (Question, UserProfile)
 vector_db.py # ChromaDB vector database manager
 test_generator.py # Personalized test generation
 json_ingestion.py # Question database ingestion
 user_profile_manager.py # User performance tracking
 pyqs/ # Question bank JSON files
 requirements.txt # Python dependencies
 .env # Environment variables
 src/
 app/
 components/ # Reusable React components
 dashboard/ # Dashboard page
 mockTests/ # Test creation interface
 takeTest/ # Test taking interface
 login/ # Authentication pages
 profile/ # User profile management
 lib/ # Utility functions
 public/ # Static assets
 package.json # Node.js dependencies
 README.md # This file
```

## Configuration

### Environment Variables

**Backend (.env):**
- `MONGODB_URI`: MongoDB connection string
- `GROQ_API_KEY`: Groq API key for LLaMA-3 access

**Frontend (.env.local):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication key
- `CLERK_SECRET_KEY`: Clerk secret key

### Question Database
The application uses JSON files in the `backend/pyqs/` folder containing JEE questions. Each file should follow this structure:
```json
{
 "question_id": "unique_id",
 "content": "Question text",
 "options": ["Option A", "Option B", "Option C", "Option D"],
 "correct_options": [0],
 "subject": "Physics",
 "chapter": "Mechanics",
 "topic": "Newton's Laws"
}
```

## Usage

1. **Sign Up/Login**: Create an account using Clerk authentication
2. **Create Mock Test**: 
 - Select subjects (Physics, Chemistry, Mathematics)
 - Choose number of questions per subject
 - Set test duration and difficulty level
3. **Take Test**: Attempt the generated test with timer
4. **View Results**: Get detailed performance analysis
5. **Track Progress**: Monitor improvement through dashboard analytics

## Key Features Walkthrough

### Smart Test Generation
- AI analyzes question database using vector embeddings
- Selects questions based on topic relevance and difficulty
- Generates new variations using Groq's LLaMA-3

### Performance Analytics
- Subject-wise performance tracking
- Score distribution analysis
- Progress trends over time
- Detailed question-level feedback

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## Acknowledgments

- **Groq** for providing the LLaMA-3 API
- **Sentence Transformers** for powerful embedding models
- **ChromaDB** for vector storage capabilities
- **Clerk** for seamless authentication
- **Next.js** and **React** teams for the amazing framework
- The open-source community for incredible tools and libraries

## Support

If you have any questions or need help:
- Open an issue on GitHub
- Join our Discord community
- Email us at: support@bodhai.com

## Roadmap

- [ ] Add more subjects (Biology for NEET)
- [ ] Implement adaptive testing
- [ ] Mobile app development
- [ ] Advanced analytics with ML insights
- [ ] Question difficulty prediction
- [ ] Peer comparison features

---

<div align="center">
 <p>Made with for JEE aspirants</p>
 <p> Star this repo if you found it helpful!</p>
</div>

