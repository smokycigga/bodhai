# 🧠 Intelligent JEE Main System with ChromaDB Memory

An **intelligent, memory-powered** system that learns from user performance and creates highly personalized tests. Uses ChromaDB for vector memory and MongoDB for structured data.

## What Makes This Intelligent

### 🧠 **Memory & Learning**
- **ChromaDB Vector Memory** - Remembers question patterns and user interactions
- **Performance Pattern Recognition** - Identifies weak topics and mistake patterns
- **Adaptive Test Generation** - Each test becomes more personalized based on history
- **Mistake Pattern Analysis** - Finds similar questions to past mistakes

### **Personalization Levels**
1. **First Test**: Random questions (no history)
2. **After 1-2 Tests**: Basic weak topic identification
3. **After 3+ Tests**: Advanced personalization with mistake patterns
4. **Ongoing**: Continuous learning and adaptation

## Quick Start

### 1. Start the Intelligent System
```bash
python intelligent_jee_server.py
```

You'll see:
```
 MongoDB connected successfully
 ChromaDB initialized with intelligent memory
🧠 Loading questions with intelligent vectorization...
 Loaded 1250 questions
🧠 Vectorized 1250 questions for intelligent retrieval
🧠 Starting Intelligent JEE Main Server on port 5001
```

### 2. Test the Intelligence
```bash
python test_intelligent_system.py
```

Expected output:
```
🧠 Testing Intelligent JEE Main System with ChromaDB Memory
============================================================
🧠 Testing intelligent system health...
 System healthy!
 Total questions: 1250
 🧠 Memory status: healthy
 Vectorized questions: 1250
 Memory size: 15.2 MB

🧠 Testing intelligent test generation for intelligent_student_123...
 Intelligent test generated!
 Questions: 12
 Weak topics targeted: 0
 Mistake patterns addressed: 0
 Personalization level: beginner

 Testing intelligent evaluation...
 Intelligent evaluation completed!
 Score: 16
 Percentage: 33.3%
 Correct: 7
 Incorrect: 4
 Unattempted: 1
 Mistake analysis:
 Physics: 2 mistakes
 Chemistry: 2 mistakes
 Intelligence insights:
 - Most mistakes in Physics (2 errors)
 - Weak topics identified: Physics:kinematics, Chemistry:thermodynamics

 Testing second intelligent test (should be more personalized)...
 Second intelligent test generated!
 Questions: 15
 Weak topics targeted: 3
 Mistake patterns addressed: 2
 Personalization level: moderate
 Enhanced insights:
 - Focusing on 2 weak Physics topics
 - Focusing on 1 weak Chemistry topics
 - Addressing 2 mistake patterns
 🧠 Intelligent selection (should show more targeting):
 weak_topic_kinematics: 3 questions
 weak_topic_thermodynamics: 2 questions
 similar_to_mistake_abc123: 2 questions
 general_coverage: 8 questions

 All tests passed! Intelligent system with ChromaDB memory is working!
🧠 The system now has memory and can learn from user performance!
```

## 🧠 How the Intelligence Works

### **Question Selection Algorithm**
```
For each test:
 60% from weak topics (ChromaDB similarity search)
 25% from mistake patterns (vector similarity to past errors)
 15% from general coverage (maintaining breadth)
```

### **Memory Components**
1. **Vector Memory (ChromaDB)**
 - Question embeddings for similarity search
 - Topic clustering and pattern recognition
 - Mistake pattern matching

2. **Structured Memory (MongoDB)**
 - User performance history
 - Chapter/topic accuracy tracking
 - Learning velocity analysis

### **Intelligence Features**
- **Weak Topic Detection**: < 65% accuracy with ≥2 attempts
- **Mistake Pattern Analysis**: Finds questions similar to past errors
- **Learning Velocity**: Tracks improvement rate over time
- **Adaptive Difficulty**: Adjusts question complexity based on performance

## Intelligent API Endpoints

### Generate Intelligent Test
```bash
POST /api/generate-intelligent-test
{
 "user_id": "student_123",
 "total_questions": 30,
 "subjects": ["Physics", "Chemistry", "Mathematics"]
}

Response:
{
 "success": true,
 "questions": [...],
 "intelligence_metadata": {
 "weak_topics_targeted": 5,
 "mistake_patterns_addressed": 3,
 "personalization_level": "high"
 },
 "personalization_insights": [
 "Focusing on 3 weak Physics topics",
 "Addressing 2 mistake patterns"
 ]
}
```

### Evaluate with Intelligence
```bash
POST /api/evaluate-intelligent-test
{
 "user_id": "student_123",
 "test_id": "intelligent_test_123_1234567890",
 "answers": ["A", "B", "", "C", "D"]
}

Response:
{
 "success": true,
 "score": {...},
 "mistake_analysis": [
 {
 "question_id": "q123",
 "subject": "Physics",
 "topic": "kinematics",
 "selection_reason": "weak_topic_kinematics"
 }
 ],
 "intelligence_insights": [
 "Most mistakes in Physics (3 errors)",
 "Weak topics identified: Physics:kinematics"
 ]
}
```

## Personalization Examples

### **Beginner User (First Test)**
```json
{
 "personalization_level": "beginner",
 "question_selection": {
 "general_coverage": 12,
 "weak_topics": 0,
 "mistake_patterns": 0
 }
}
```

### **Learning User (After 3 Tests)**
```json
{
 "personalization_level": "moderate",
 "question_selection": {
 "weak_topic_thermodynamics": 4,
 "weak_topic_kinematics": 3,
 "similar_to_mistake_abc123": 2,
 "general_coverage": 6
 },
 "insights": [
 "Focusing on 2 weak Chemistry topics",
 "Addressing 1 mistake patterns"
 ]
}
```

### **Advanced User (After 10+ Tests)**
```json
{
 "personalization_level": "high",
 "question_selection": {
 "weak_topic_electrochemistry": 5,
 "weak_topic_optics": 4,
 "similar_to_mistake_def456": 3,
 "similar_to_mistake_ghi789": 2,
 "general_coverage": 1
 },
 "insights": [
 "Focusing on 4 weak topics across subjects",
 "Addressing 3 mistake patterns",
 "Learning velocity: improving (+12.5%)"
 ]
}
```

## Intelligence Configuration

### **ChromaDB Memory Settings**
- **Database Path**: `./intelligent_chroma_db/`
- **Embedding Model**: `all-MiniLM-L6-v2`
- **Vector Dimensions**: 384
- **Similarity Threshold**: 0.7

### **Personalization Thresholds**
```python
WEAK_TOPIC_THRESHOLD = 65 # % accuracy
MIN_ATTEMPTS_FOR_CLASSIFICATION = 2
MISTAKE_PATTERN_SIMILARITY = 0.8
LEARNING_VELOCITY_WINDOW = 5 # tests
```

### **Question Selection Weights**
```python
WEAK_TOPICS_WEIGHT = 0.60 # 60%
MISTAKE_PATTERNS_WEIGHT = 0.25 # 25%
GENERAL_COVERAGE_WEIGHT = 0.15 # 15%
```

## 🧠 Memory Architecture

```
 
 ChromaDB MongoDB 
 (Vector) (Structured) 
 
 • Question • User Profiles 
 Embeddings • Test Results 
 • Similarity • Performance 
 Search History 
 • Pattern • Learning 
 Matching Velocity 
 
 
 
 
 
 Intelligence 
 Engine 
 
 • Weak Topic 
 Detection 
 • Mistake 
 Analysis 
 • Adaptive 
 Selection 
 
```

## Key Intelligence Features

### **Smart Question Selection**
- Uses vector similarity to find questions related to weak topics
- Identifies questions similar to past mistakes
- Maintains topic diversity for comprehensive learning

### **Performance Analytics**
- Tracks accuracy at chapter and topic level
- Identifies learning patterns and trends
- Calculates learning velocity and consistency

### 🧠 **Memory-Powered Insights**
- "Most mistakes in Physics (kinematics)"
- "Weak topics: thermodynamics, optics"
- "Learning velocity: improving (+15%)"
- "Consistency: high (low variance)"

### **Continuous Learning**
- Each test improves the personalization
- Memory grows with user interactions
- Adapts to changing performance patterns

## Ready for Intelligent Testing!

Your intelligent JEE Main system is ready with:
- **ChromaDB Memory** - Vector-based question intelligence
- **Performance Learning** - Learns from every test
- **Mistake Analysis** - Finds similar questions to errors
- **Adaptive Personalization** - Gets smarter over time
- **Real Intelligence** - Not just random selection

The system will remember every user interaction and create increasingly personalized tests! 🧠