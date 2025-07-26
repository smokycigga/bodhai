
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import random
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import logging
from typing import List, Dict, Any
import hashlib
import re
import statistics

# Import our enhanced modules
from vector_db import VectorDBManager
from models import Question, ExamType, Difficulty

load_dotenv()

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle MongoDB ObjectId and datetime objects"""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = JSONEncoder
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_uri = os.getenv('MONGODB_URI')
try:
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client['intelligentJEE']
    user_profiles_collection = db['user_profiles']
    test_results_collection = db['test_results']
    questions_collection = db['questions']
    logger.info("MongoDB connected successfully")
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}")
    exit(1)

# Initialize ChromaDB Vector Database for intelligent memory
try:
    vector_db = VectorDBManager("./intelligent_chroma_db")
    logger.info("ChromaDB initialized with intelligent memory")
except Exception as e:
    logger.error(f"ChromaDB initialization failed: {e}")
    exit(1)

# Global questions storage
all_questions = []

def clean_mongo_doc(doc):
    """Clean MongoDB document by removing/converting ObjectId fields"""
    if isinstance(doc, dict):
        cleaned = {}
        for key, value in doc.items():
            if key == '_id':
                continue  # Skip _id field
            elif isinstance(value, ObjectId):
                cleaned[key] = str(value)
            elif isinstance(value, datetime):
                cleaned[key] = value.isoformat()
            elif isinstance(value, dict):
                cleaned[key] = clean_mongo_doc(value)
            elif isinstance(value, list):
                cleaned[key] = [clean_mongo_doc(item) if isinstance(item, dict) else item for item in value]
            else:
                cleaned[key] = value
        return cleaned
    return doc

def load_and_vectorize_questions():
    """Load questions from JSON and store in both MongoDB and ChromaDB for intelligent retrieval"""
    global all_questions
    # Use absolute path to pyqs folder
    pyqs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pyqs")

    logger.info("🧠 Loading questions with intelligent vectorization...")
    question_count = 0
    vectorized_count = 0

    for filename in os.listdir(pyqs_folder):
        if filename.endswith('.json'):
            file_path = os.path.join(pyqs_folder, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Handle different JSON structures
                if isinstance(data, list):
                    for item in data:
                        if 'questions' in item:
                            for question_data in item['questions']:
                                processed_q = process_question_with_intelligence(question_data)
                                if processed_q:
                                    all_questions.append(processed_q)
                                    question_count += 1

                                    # Add to ChromaDB for intelligent retrieval
                                    if add_question_to_vector_db(processed_q):
                                        vectorized_count += 1
            except Exception as e:
                logger.warning(f"Error loading {filename}: {e}")

    logger.info(f"Loaded {question_count} questions")
    logger.info(f"🧠 Vectorized {vectorized_count} questions for intelligent retrieval")

    # Save to MongoDB for persistence
    if all_questions:
        try:
            questions_collection.delete_many({})  # Clear existing
            questions_collection.insert_many(all_questions)
            logger.info(f"Saved {len(all_questions)} questions to MongoDB")
        except Exception as e:
            logger.warning(f"Error saving to MongoDB: {e}")

def process_latex_for_rendering(text: str) -> str:
    """
    Cleans and formats text containing LaTeX for proper inline and block rendering.
    This is the complete version handling all specified cases.
    """
    if not text or not isinstance(text, str):
        return ""

    # 1. Clean up newlines and HTML tags to create a single line
    processed_content = re.sub(r'<br\s*/?>|\n|\\n', ' ', text)
    processed_content = processed_content.replace('&nbsp;', ' ').strip()

    # 2. Standardize common symbols into LaTeX commands
    symbol_map = {
        '→': '\\rightarrow', '⇌': '\\rightleftharpoons', '≤': '\\leq', '≥': '\\geq',
        '≠': '\\neq', '≈': '\\approx', '×': '\\times', '⋅': '\\cdot', '÷': '\\div',
        '±': '\\pm', '∞': '\\infty', '°': '^{\\circ}', '∫': '\\int', '∑': '\\sum',
        '√': '\\sqrt', 'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
        'ε': '\\epsilon', 'θ': '\\theta', 'λ': '\\lambda', 'μ': '\\mu', 'π': '\\pi',
        'ρ': '\\rho', 'σ': '\\sigma', 'ω': '\\omega', 'Γ': '\\Gamma', 'Δ': '\\Delta',
        'Θ': '\\Theta', 'Λ': '\\Lambda', 'Π': '\\Pi', 'Σ': '\\Sigma', 'Ω': '\\Omega',
        '\\Complex': '\\mathbb{C}', '\\Real': '\\mathbb{R}', '\\Integer': '\\mathbb{Z}',
        '\\Re': '\\operatorname{Re}', '\\Im': '\\operatorname{Im}',
    }
    for uni, latex in symbol_map.items():
        processed_content = processed_content.replace(uni, latex)

    # 3. Handle specific LaTeX structures
    # Handle \over expressions
    processed_content = re.sub(r'\{([^{}]+)\}\\over\{([^{}]+)\}', r'\\frac{\1}{\2}', processed_content)
    
    # Handle Matrices & Determinants
    processed_content = re.sub(r'\\left\|(.*?)\\right\|', r'\\begin{vmatrix}\1\\end{vmatrix}', processed_content)
    
    # Handle Systems of Equations
    processed_content = re.sub(r'\\left\\\{\s*\\begin{matrix}(.*?)\\end{matrix}\s*\\right\.', r'\\begin{cases}\1\\end{cases}', processed_content)

    # Handle Chemical Equations (e.g., H2O -> H_{2}O)
    processed_content = re.sub(r'([A-Z][a-z]?)(\d+)', r'\1_{\2}', processed_content)
    
    # Handle Dimensional Analysis (e.g., [M L T-2] -> [M L T^{-2}])
    def process_dims(match):
        dims = match.group(1)
        return f"[{re.sub(r'([MLT])\\s*(-?\\d+)', r'\\1^{\\2}', dims)}]"
    processed_content = re.sub(r'\[([MLT\s\d-]+)\]', process_dims, processed_content)

    # Handle multi-character superscripts and subscripts
    processed_content = re.sub(r'\^([a-zA-Z0-_0-9]{2,})', r'^{\1}', processed_content)
    processed_content = re.sub(r'_([a-zA-Z0-9]{2,})', r'_{\1}', processed_content)
    
    # 4. Identify if content should be a block-level formula
    block_pattern = re.compile(r'(\\sum|\\frac|\\lim|\\int|\\begin\{aligned\}|\\begin\{matrix\}|\\begin\{vmatrix\}|\\begin\{cases\})')
    if block_pattern.search(processed_content):
        processed_content = processed_content.replace('$', '')
        return f"$${processed_content.strip()}$$"

    return processed_content

def process_question_with_intelligence(question_data):
    """Process question with enhanced metadata for intelligent retrieval"""
    try:
        question_id = question_data.get('question_id', '')
        if not question_id:
            return None

        content = question_data.get('content', '').strip()
        content = re.sub(r'<br\s*/?>|\n|\\n', ' ', content)
        content = re.sub(r'\s+', ' ', content).strip()
        if not content:
            return None

        

        # Extract options
        options = []
        for opt in question_data.get('options', []):
            if isinstance(opt, dict):
                option_text = opt.get('content', '').strip()
                if option_text:
                    # Format LaTeX content in options too
                    formatted_option_text = re.sub(r'<br\s*/?>|\n|\\n', ' ', option_text)
                    formatted_option_text = re.sub(r'\s+', ' ', formatted_option_text).strip()
                    options.append({
                        'id': opt.get('identifier', ''),
                        'text': formatted_option_text
                    })

        if len(options) < 4:
            return None

        # Get correct answer
        correct_options = question_data.get('correct_options', [])
        correct_answer = correct_options[0] if correct_options else 'A'

        # Extract and normalize subject info
        subject = normalize_subject(question_data.get('subject', ''))
        chapter_group = question_data.get('chapterGroup', '')
        chapter = question_data.get('chapter', '')
        topic = question_data.get('topicName', '') or question_data.get('topic', '') or chapter

        # Create enhanced question object for intelligent processing
        return {
            'question_id': question_id,
            'content': content,
            'options': options,
            'correct_answer': correct_answer,
            'subject': subject,
            'chapter_group': chapter_group,
            'chapter': chapter,
            'topic': topic,
            'marks': question_data.get('marks', 4),
            'negative_marks': question_data.get('negMarks', 1),
            'type': question_data.get('type', 'mcq'),
            'explanation': question_data.get('explanation', ''),
            'difficulty': question_data.get('difficulty', 'medium'),
            'created_at': datetime.now(timezone.utc),
            # Enhanced metadata for intelligent retrieval
            'content_hash': hashlib.md5(content.encode()).hexdigest(),
            'topic_keywords': extract_topic_keywords(content, chapter, topic),
            'complexity_score': calculate_complexity_score(content, options)
        }

    except Exception as e:
        logger.warning(f"Error processing question: {e}")
        return None

def normalize_subject(subject):
    """Normalize subject names"""
    subject = subject.lower().strip()
    if subject in ['mathematics', 'math', 'maths']:
        return 'Mathematics'
    elif subject == 'physics':
        return 'Physics'
    elif subject == 'chemistry':
        return 'Chemistry'
    else:
        return subject.title()

def extract_topic_keywords(content, chapter, topic):
    """Extract keywords for better topic matching"""
    keywords = []

    # Add chapter and topic as keywords
    if chapter:
        keywords.append(chapter.lower())
    if topic:
        keywords.append(topic.lower())

    # Extract key terms from content (simple approach)
    words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
    # Filter common words and keep domain-specific terms
    domain_words = [w for w in words if w not in ['question', 'following', 'given', 'find', 'calculate']]
    keywords.extend(domain_words[:5]) # Top 5 domain words

    return list(set(keywords)) # Remove duplicates

def calculate_complexity_score(content, options):
    """Calculate question complexity for intelligent difficulty matching"""
    score = 0

    # Length-based complexity
    if len(content) > 200:
        score += 2
    elif len(content) > 100:
        score += 1

    # Mathematical content complexity
    if '$' in content or 'equation' in content.lower():
        score += 2

    # Option complexity
    if options:
        avg_option_length = sum(len(opt['text']) for opt in options) / len(options)
        if avg_option_length > 50:
            score += 1

    return min(score, 5) # Cap at 5

def add_question_to_vector_db(question):
    """Add question to ChromaDB for intelligent retrieval"""
    try:
        # Create Question object for ChromaDB
        question_obj = Question(
            id=question['question_id'],
            question_text=question['content'],
            options=[opt['text'] for opt in question['options']],
            correct_answer=question['correct_answer'],
            subject=question['subject'],
            chapter=question['chapter'],
            topic=question['topic'],
            difficulty=Difficulty.MEDIUM, # Default
            marks=question['marks'],
            exam_type=ExamType.JEE_MAIN,
            year=2024,
            explanation=question['explanation']
        )

        # Add negative marks as additional attribute
        question_obj.neg_marks = question['negative_marks']

        return vector_db.add_question(question_obj)

    except Exception as e:
        logger.warning(f"Error adding question to vector DB: {e}")
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check with intelligent system status"""
    try:
        # Check ChromaDB health
        chroma_health = vector_db.get_database_health()
        memory_usage = vector_db.get_memory_usage()

        return jsonify({
            "status": "healthy",
            "total_questions": len(all_questions),
            "intelligent_memory": {
                "status": chroma_health.get('status', 'unknown'),
                "vectorized_questions": memory_usage.get('total_questions', 0),
                "memory_size_mb": memory_usage.get('database_size_mb', 0)
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "degraded",
            "error": str(e)
        }), 500

@app.route('/api/load-questions', methods=['POST'])
def load_questions():
    """Load and vectorize questions for intelligent retrieval"""
    try:
        load_and_vectorize_questions()

        # Get final stats
        memory_usage = vector_db.get_memory_usage()

        return jsonify({
            "success": True,
            "message": "Questions loaded with intelligent memory",
            "stats": {
                "total_questions": len(all_questions),
                "vectorized_questions": memory_usage.get('total_questions', 0),
                "memory_size_mb": memory_usage.get('database_size_mb', 0)
            }
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/generate-intelligent-test', methods=['POST'])
def generate_intelligent_test():
    """Generate highly personalized test using ChromaDB intelligence"""
    try:
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        total_questions = min(data.get('total_questions', 30), 90)
        subjects = data.get('subjects', ['Physics', 'Chemistry', 'Mathematics'])

        logger.info(f"🧠 Generating intelligent test for user {user_id}")

        # Get user's intelligent profile (includes question history)
        user_intelligence = get_user_intelligence(user_id)
        seen_questions = user_intelligence.get('seen_questions', set())

        logger.info(f"Excluding {len(seen_questions)} previously seen questions for user {user_id}")

        # Generate intelligent test with no repetition
        test_questions = []
        questions_per_subject = total_questions // len(subjects)

        for subject in subjects:
            logger.info(f"Generating {questions_per_subject} {subject} questions")

            # Get weak topics for this subject
            weak_topics = user_intelligence.get('weak_topics', {}).get(subject, [])
            mistake_patterns = user_intelligence.get('mistake_patterns', {}).get(subject, [])

            subject_questions = []
            current_exclude_ids = seen_questions.copy()  # Start with all seen questions

            # 60% from weak topics (intelligent targeting)
            weak_count = int(questions_per_subject * 0.6)
            if weak_topics:
                for topic in weak_topics[:3]:  # Top 3 weak topics
                    topic_questions = get_intelligent_questions_for_topic(
                        subject, topic['topic'], weak_count // len(weak_topics[:3]), current_exclude_ids
                    )
                    subject_questions.extend(topic_questions)
                    # Update exclusion list with newly selected questions
                    for q in topic_questions:
                        current_exclude_ids.add(q['question_id'])

            # 25% from mistake patterns (learning from errors)
            mistake_count = int(questions_per_subject * 0.25)
            if mistake_patterns:
                mistake_questions = get_questions_similar_to_mistakes(
                    user_id, subject, mistake_count, current_exclude_ids
                )
                subject_questions.extend(mistake_questions)
                # Update exclusion list
                for q in mistake_questions:
                    current_exclude_ids.add(q['question_id'])

            # 15% from general coverage (maintaining breadth)
            remaining_count = questions_per_subject - len(subject_questions)
            if remaining_count > 0:
                general_questions = get_general_coverage_questions(
                    subject, remaining_count, current_exclude_ids
                )
                subject_questions.extend(general_questions)

            test_questions.extend(subject_questions[:questions_per_subject])

        # Intelligent shuffling (maintain difficulty progression)
        test_questions = intelligent_shuffle(test_questions)
        test_questions = test_questions[:total_questions]

        # Create test session with intelligence metadata
        test_id = f"intelligent_test_{user_id}_{int(datetime.now(timezone.utc).timestamp())}"

        test_session = {
            'test_id': test_id,
            'user_id': user_id,
            'questions': test_questions,
            'total_questions': len(test_questions),
            'subjects': subjects,
            'intelligence_used': {
                'weak_topics_targeted': sum(len(topics) for topics in user_intelligence.get('weak_topics', {}).values()),
                'mistake_patterns_addressed': len(user_intelligence.get('mistake_patterns', {})),
                'personalization_level': calculate_personalization_level(user_intelligence)
            },
            'created_at': datetime.now(timezone.utc),
            'status': 'active'
        }

        # Save test session
        try:
            db['test_sessions'].insert_one(test_session)
        except Exception as e:
            logger.warning(f"Error saving test session: {e}")

        # Verify no question repetition
        question_ids = [q['question_id'] for q in test_questions]
        unique_questions = len(set(question_ids))

        logger.info(f"Generated intelligent test with {len(test_questions)} questions")
        logger.info(f"Zero repetition guarantee: {unique_questions}/{len(test_questions)} unique questions")
        logger.info(f"Question sources: {len([q for q in test_questions if 'weak_topic' in q.get('selection_reason', '')])} weak topics, "
                    f"{len([q for q in test_questions if 'mistake' in q.get('selection_reason', '')])} mistake patterns, "
                    f"{len([q for q in test_questions if 'general' in q.get('selection_reason', '')])} general coverage")

        # Clean questions for JSON serialization
        clean_questions = [clean_mongo_doc(q) for q in test_questions]

        return jsonify({
            "success": True,
            "test_id": test_id,
            "questions": clean_questions,
            "intelligence_metadata": clean_mongo_doc(test_session['intelligence_used']),
            "personalization_insights": generate_personalization_insights(user_intelligence),
            "no_repetition_guarantee": {
                "total_questions": len(test_questions),
                "unique_questions": unique_questions,
                "previously_seen": len(seen_questions),
                "repetition_free": unique_questions == len(test_questions)
            }
        }), 200

    except Exception as e:
        logger.error(f"Intelligent test generation failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def get_user_question_history(user_id):
    """Get all questions the user has seen before to prevent repetition"""
    try:
        # Get all test results for this user
        test_results = list(test_results_collection.find({
            'user_id': user_id
        }, {
            'detailed_results.question_id': 1,
            '_id': 0
        }))

        seen_questions = set()
        for result in test_results:
            for detail in result.get('detailed_results', []):
                question_id = detail.get('question_id')
                if question_id:
                    seen_questions.add(question_id)

        logger.info(f"User {user_id} has seen {len(seen_questions)} questions before")
        return seen_questions

    except Exception as e:
        logger.warning(f"Error getting user question history: {e}")
        return set()

def get_user_intelligence(user_id):
    """Get comprehensive user intelligence from performance history"""
    try:
        # Get user profile
        profile = user_profiles_collection.find_one({'user_id': user_id})
        if not profile:
            return {
                'weak_topics': {},
                'mistake_patterns': {},
                'learning_trends': {},
                'seen_questions': set()
            }

        # Get question history to prevent repetition
        seen_questions = get_user_question_history(user_id)

        # Analyze weak topics by subject
        weak_topics = {}
        mistake_patterns = {}

        chapter_performance = profile.get('chapter_performance', {})

        for chapter_key, perf in chapter_performance.items():
            subject = perf.get('subject', 'Unknown')

            if subject not in weak_topics:
                weak_topics[subject] = []
                mistake_patterns[subject] = []

            # Calculate accuracy and identify weak areas
            accuracy = (perf['correct'] / perf['total']) * 100 if perf['total'] > 0 else 0

            if accuracy < 65 and perf['total'] >= 2: # Weak topic threshold
                weak_topics[subject].append({
                    'topic': chapter_key,
                    'accuracy': accuracy,
                    'attempts': perf['total'],
                    'priority': calculate_topic_priority(perf)
                })

            # Identify mistake patterns
            if accuracy < 50 and perf['total'] >= 3:
                mistake_patterns[subject].append({
                    'topic': chapter_key,
                    'error_rate': 100 - accuracy,
                    'attempts': perf['total']
                })

        # Sort by priority
        for subject in weak_topics:
            weak_topics[subject].sort(key=lambda x: x['priority'], reverse=True)
        for subject in mistake_patterns:
            mistake_patterns[subject].sort(key=lambda x: x['error_rate'], reverse=True)

        return {
            'weak_topics': weak_topics,
            'mistake_patterns': mistake_patterns,
            'learning_trends': analyze_learning_trends(user_id),
            'seen_questions': seen_questions
        }

    except Exception as e:
        logger.warning(f"Error getting user intelligence: {e}")
        return {'weak_topics': {}, 'mistake_patterns': {}, 'learning_trends': {}, 'seen_questions': set()}

def calculate_topic_priority(performance):
    """Calculate priority score for topic remediation"""
    accuracy = (performance['correct'] / performance['total']) * 100
    attempts = performance['total']

    # Lower accuracy = higher priority
    accuracy_score = (100 - accuracy) / 100

    # More attempts = higher confidence in the weakness
    attempt_score = min(attempts / 10, 1.0)

    # Recent performance gets higher priority
    recency_score = 0.8 # Default high recency

    return accuracy_score * 0.5 + attempt_score * 0.3 + recency_score * 0.2

def get_intelligent_questions_for_topic(subject, topic, count, exclude_ids=None):
    """Get questions for specific topic using ChromaDB intelligence, avoiding repetition"""
    try:
        exclude_ids = exclude_ids or set()

        # Use ChromaDB to find similar questions (get more to account for exclusions)
        search_results = vector_db.search_questions(
            exam_type="JEE_MAIN",
            query=f"{subject} {topic}",
            n_results=count * 4, # Get 4x more to account for exclusions
            subject=subject
        )

        questions = []
        for result in search_results:
            if len(questions) >= count:
                break

            question_id = result['question_id']
            if question_id not in exclude_ids:
                question = get_question_by_id(question_id)
                if question:
                    question['selection_reason'] = f'weak_topic_{topic}'
                    questions.append(question)
                    exclude_ids.add(question_id) # Add to exclusion list

        logger.info(f"Selected {len(questions)} new questions for topic '{topic}' (excluded {len(exclude_ids)} seen questions)")
        return questions

    except Exception as e:
        logger.warning(f"Error getting intelligent questions for topic: {e}")
        return []

def get_questions_similar_to_mistakes(user_id, subject, count, exclude_ids=None):
    """Get questions similar to user's past mistakes using vector similarity, avoiding repetition"""
    try:
        exclude_ids = exclude_ids or set()

        # Get user's mistake questions
        recent_results = list(test_results_collection.find({
            'user_id': user_id
        }).sort('completed_at', -1).limit(5))

        mistake_questions = []
        for result in recent_results:
            for detail in result.get('detailed_results', []):
                if not detail.get('is_correct') and detail.get('subject') == subject:
                    mistake_questions.append(detail.get('question_id'))

        if not mistake_questions:
            return []

        # Find similar questions using ChromaDB
        similar_questions = []
        for mistake_id in mistake_questions[:3]: # Top 3 recent mistakes
            if len(similar_questions) >= count:
                break

            mistake_question = get_question_by_id(mistake_id)
            if mistake_question:
                # Find similar questions
                search_results = vector_db.search_questions(
                    exam_type="JEE_MAIN",
                    query=mistake_question['content'][:200], # Use content for similarity
                    n_results=count * 2, # Get more to account for exclusions
                    subject=subject,
                    exclude_ids=[mistake_id]
                )

                for result in search_results:
                    if len(similar_questions) >= count:
                        break

                    question_id = result['question_id']
                    if question_id not in exclude_ids:
                        question = get_question_by_id(question_id)
                        if question:
                            question['selection_reason'] = f'similar_to_mistake_{mistake_id[:8]}'
                            similar_questions.append(question)
                            exclude_ids.add(question_id)

        logger.info(f"Selected {len(similar_questions)} questions similar to mistakes (excluded {len(exclude_ids)} seen questions)")
        return similar_questions[:count]

    except Exception as e:
        logger.warning(f"Error getting questions similar to mistakes: {e}")
        return []

def get_general_coverage_questions(subject, count, exclude_ids=None):
    """Get general coverage questions for breadth, avoiding repetition"""
    try:
        exclude_ids = exclude_ids or set()

        # Get diverse questions from the subject, excluding seen ones
        subject_questions = [q for q in all_questions
                             if q['subject'] == subject and q['question_id'] not in exclude_ids]

        if not subject_questions:
            logger.warning(f"No new questions available for {subject} (all {len(all_questions)} questions seen)")
            return []

        # Select diverse questions (different chapters)
        selected = []
        chapters_used = set()

        # Shuffle to get random selection within chapters
        random.shuffle(subject_questions)

        for question in subject_questions:
            if len(selected) >= count:
                break

            chapter = question['chapter']
            if chapter not in chapters_used or len(selected) < count // 2:
                question['selection_reason'] = 'general_coverage'
                selected.append(question)
                chapters_used.add(chapter)
                exclude_ids.add(question['question_id'])

        logger.info(f"Selected {len(selected)} general coverage questions for {subject} (excluded {len(exclude_ids)} seen questions)")
        return selected[:count]

    except Exception as e:
        logger.warning(f"Error getting general coverage questions: {e}")
        return []

def intelligent_shuffle(questions):
    """Intelligently shuffle questions maintaining difficulty progression"""
    try:
        # Group by complexity
        easy = [q for q in questions if q.get('complexity_score', 3) <= 2]
        medium = [q for q in questions if q.get('complexity_score', 3) == 3]
        hard = [q for q in questions if q.get('complexity_score', 3) >= 4]

        # Shuffle within groups
        random.shuffle(easy)
        random.shuffle(medium)
        random.shuffle(hard)

        # Interleave for progressive difficulty
        result = []
        max_len = max(len(easy), len(medium), len(hard))

        for i in range(max_len):
            if i < len(easy):
                result.append(easy[i])
            if i < len(medium):
                result.append(medium[i])
            if i < len(hard):
                result.append(hard[i])

        return result

    except Exception as e:
        logger.warning(f"Error in intelligent shuffle: {e}")
        random.shuffle(questions)
        return questions

def calculate_personalization_level(user_intelligence):
    """Calculate how personalized the test is"""
    weak_topics_count = sum(len(topics) for topics in user_intelligence.get('weak_topics', {}).values())
    mistake_patterns_count = len(user_intelligence.get('mistake_patterns', {}))

    if weak_topics_count == 0:
        return "beginner"
    elif weak_topics_count < 5:
        return "moderate"
    else:
        return "high"

def generate_personalization_insights(user_intelligence):
    """Generate insights about the personalization"""
    insights = []

    weak_topics = user_intelligence.get('weak_topics', {})
    for subject, topics in weak_topics.items():
        if topics:
            insights.append(f"Focusing on {len(topics)} weak {subject} topics")

    mistake_patterns = user_intelligence.get('mistake_patterns', {})
    total_mistakes = sum(len(patterns) for patterns in mistake_patterns.values())
    if total_mistakes > 0:
        insights.append(f"Addressing {total_mistakes} mistake patterns")

    return insights

def analyze_learning_trends(user_id):
    """Analyze user's learning trends over time"""
    try:
        # Get recent test results
        recent_results = list(test_results_collection.find({
            'user_id': user_id
        }).sort('completed_at', -1).limit(10))

        if len(recent_results) < 2:
            return {'trend': 'insufficient_data'}

        # Calculate trend
        scores = [result.get('percentage', 0) for result in recent_results]
        trend = 'stable'

        if len(scores) >= 3:
            recent_avg = sum(scores[:3]) / 3
            older_avg = sum(scores[3:6]) / len(scores[3:6]) if len(scores) > 3 else scores[-1]

            if recent_avg > older_avg + 5:
                trend = 'improving'
            elif recent_avg < older_avg - 5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'

        return {
            'trend': trend,
            'recent_average': round(sum(scores[:3]) / min(3, len(scores)), 2),
            'test_count': len(recent_results)
        }

    except Exception as e:
        logger.warning(f"Error analyzing learning trends: {e}")
        return {'trend': 'unknown'}

def get_question_by_id(question_id):
    """Get question by ID from memory or database"""
    # First try from memory
    for q in all_questions:
        if q['question_id'] == question_id:
            return q

    # Fallback to database
    try:
        question = questions_collection.find_one({'question_id': question_id})
        if question and '_id' in question:
            del question['_id']
        return question
    except Exception as e:
        logger.warning(f"Error getting question by ID: {e}")
        return None

# Include the evaluation and profile endpoints from the simple server
@app.route('/api/evaluate-intelligent-test', methods=['POST'])
def evaluate_intelligent_test():
    """Evaluate test with enhanced intelligence tracking"""
    try:
        data = request.json
        user_id = data.get('user_id')
        test_id = data.get('test_id')
        user_answers = data.get('answers', [])

        # Get test session
        test_session = db['test_sessions'].find_one({'test_id': test_id})
        if not test_session:
            return jsonify({
                "success": False,
                "error": "Test session not found"
            }), 404

        questions = test_session['questions']

        # Evaluate with enhanced tracking
        evaluation_result = evaluate_with_intelligence(user_id, questions, user_answers)

        # Update user intelligence
        update_user_intelligence(user_id, evaluation_result)

        return jsonify(evaluation_result), 200

    except Exception as e:
        logger.error(f"Intelligent test evaluation failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def evaluate_with_intelligence(user_id, questions, user_answers):
    """Evaluate test with enhanced intelligence tracking"""
    total_score = 0
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0

    detailed_results = []
    chapter_performance = {}
    topic_performance = {}
    mistake_analysis = []

    for i, (question, user_answer) in enumerate(zip(questions, user_answers)):
        correct_answer = question['correct_answer']
        is_correct = False
        score = 0
        status = "unattempted"

        if not user_answer or user_answer == "":
            score = 0
            status = "unattempted"
            unattempted_count += 1
        elif user_answer == correct_answer:
            score = question['marks']
            is_correct = True
            status = "correct"
            correct_count += 1
        else:
            score = -question['negative_marks']
            status = "incorrect"
            incorrect_count += 1

            # Enhanced mistake analysis
            mistake_analysis.append({
                'question_id': question['question_id'],
                'subject': question['subject'],
                'chapter': question['chapter'],
                'topic': question['topic'],
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'selection_reason': question.get('selection_reason', 'unknown'),
                'content_preview': question['content'][:100] + "..."
            })

        total_score += score

        # Enhanced performance tracking
        chapter = question['chapter']
        topic = question['topic']
        subject = question['subject']

        # Chapter performance
        chapter_key = f"{subject}:{chapter}"
        if chapter_key not in chapter_performance:
            chapter_performance[chapter_key] = {
                'total': 0,
                'correct': 0,
                'subject': subject,
                'chapter': chapter
            }
        chapter_performance[chapter_key]['total'] += 1
        if is_correct:
            chapter_performance[chapter_key]['correct'] += 1

        # Topic performance (more granular)
        topic_key = f"{subject}:{chapter}:{topic}"
        if topic_key not in topic_performance:
            topic_performance[topic_key] = {
                'total': 0,
                'correct': 0,
                'subject': subject,
                'chapter': chapter,
                'topic': topic
            }
        topic_performance[topic_key]['total'] += 1
        if is_correct:
            topic_performance[topic_key]['correct'] += 1

        detailed_results.append({
            'question_number': i + 1,
            'question_id': question['question_id'],
            'subject': subject,
            'chapter': chapter,
            'topic': topic,
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct,
            'score': score,
            'status': status,
            'selection_reason': question.get('selection_reason', 'general')
        })

    # Calculate percentage
    max_possible_score = sum(q['marks'] for q in questions)
    percentage = max(0, (total_score / max_possible_score) * 100) if max_possible_score > 0 else 0

    return {
        "success": True,
        "user_id": user_id,
        "score": {
            "total_score": total_score,
            "max_possible_score": max_possible_score,
            "percentage": round(percentage, 2)
        },
        "summary": {
            "correct": correct_count,
            "incorrect": incorrect_count,
            "unattempted": unattempted_count,
            "total": len(questions)
        },
        "chapter_performance": chapter_performance,
        "topic_performance": topic_performance,
        "detailed_results": detailed_results,
        "mistake_analysis": mistake_analysis,
        "intelligence_insights": generate_intelligence_insights(mistake_analysis, topic_performance)
    }

def update_user_intelligence(user_id, evaluation_result):
    """Update user intelligence based on test results"""
    try:
        # Get existing profile
        profile = user_profiles_collection.find_one({'user_id': user_id})

        if not profile:
            profile = {
                'user_id': user_id,
                'chapter_performance': {},
                'topic_performance': {},
                'total_tests': 0,
                'total_questions': 0,
                'mistake_history': [],
                'learning_velocity': {},
                'created_at': datetime.now(timezone.utc)
            }

        # Update chapter performance
        existing_chapter_perf = profile.get('chapter_performance', {})
        new_chapter_perf = evaluation_result['chapter_performance']

        for chapter_key, new_perf in new_chapter_perf.items():
            if chapter_key in existing_chapter_perf:
                existing_chapter_perf[chapter_key]['total'] += new_perf['total']
                existing_chapter_perf[chapter_key]['correct'] += new_perf['correct']
            else:
                existing_chapter_perf[chapter_key] = new_perf

        # Update topic performance (enhanced granularity)
        existing_topic_perf = profile.get('topic_performance', {})
        new_topic_perf = evaluation_result['topic_performance']

        for topic_key, new_perf in new_topic_perf.items():
            if topic_key in existing_topic_perf:
                existing_topic_perf[topic_key]['total'] += new_perf['total']
                existing_topic_perf[topic_key]['correct'] += new_perf['correct']
            else:
                existing_topic_perf[topic_key] = new_perf

        # Update mistake history for pattern analysis
        mistake_history = profile.get('mistake_history', [])
        new_mistakes = evaluation_result.get('mistake_analysis', [])

        # Keep last 50 mistakes for pattern analysis
        mistake_history.extend(new_mistakes)
        mistake_history = mistake_history[-50:]

        # Calculate learning velocity (improvement rate)
        learning_velocity = calculate_learning_velocity(user_id, evaluation_result)

        # Update profile
        profile.update({
            'chapter_performance': existing_chapter_perf,
            'topic_performance': existing_topic_perf,
            'mistake_history': mistake_history,
            'learning_velocity': learning_velocity,
            'total_tests': profile.get('total_tests', 0) + 1,
            'total_questions': profile.get('total_questions', 0) + evaluation_result['summary']['total'],
            'last_updated': datetime.now(timezone.utc)
        })

        # Save updated profile
        user_profiles_collection.update_one(
            {'user_id': user_id},
            {'$set': profile},
            upsert=True
        )

        # Save test result with intelligence metadata
        test_result = evaluation_result.copy()
        test_result['completed_at'] = datetime.now(timezone.utc)
        test_results_collection.insert_one(test_result)

        logger.info(f"Updated intelligence for user {user_id}")

    except Exception as e:
        logger.error(f"Error updating user intelligence: {e}")

def calculate_learning_velocity(user_id, current_result):
    """Calculate how fast the user is learning/improving"""
    try:
        # Get recent results
        recent_results = list(test_results_collection.find({
            'user_id': user_id
        }).sort('completed_at', -1).limit(5))

        if len(recent_results) < 2:
            return {'status': 'insufficient_data'}

        # Calculate improvement rate
        current_score = current_result['score']['percentage']
        previous_scores = [r['score']['percentage'] for r in recent_results]

        if len(previous_scores) >= 2:
            recent_avg = sum(previous_scores[:2]) / 2
            improvement = current_score - recent_avg

            return {
                'status': 'calculated',
                'improvement_rate': round(improvement, 2),
                'trend': 'improving' if improvement > 2 else 'stable' if improvement > -2 else 'declining',
                'consistency': calculate_consistency(previous_scores + [current_score])
            }

        return {'status': 'stable'}

    except Exception as e:
        logger.warning(f"Error calculating learning velocity: {e}")
        return {'status': 'error'}

def calculate_consistency(scores):
    """Calculate consistency of performance"""
    if len(scores) < 3:
        return 'unknown'

    std_dev = statistics.stdev(scores)

    if std_dev < 5:
        return 'high'
    elif std_dev < 15:
        return 'moderate'
    else:
        return 'low'

def generate_intelligence_insights(mistake_analysis, topic_performance):
    """Generate intelligent insights from test performance"""
    insights = []

    # Mistake pattern insights
    if mistake_analysis:
        mistake_subjects = {}
        for mistake in mistake_analysis:
            subject = mistake['subject']
            mistake_subjects[subject] = mistake_subjects.get(subject, 0) + 1

        worst_subject = max(mistake_subjects.items(), key=lambda x: x[1])
        insights.append(f"Most mistakes in {worst_subject[0]} ({worst_subject[1]} errors)")

    # Topic performance insights
    weak_topics = []
    for topic_key, perf in topic_performance.items():
        accuracy = (perf['correct'] / perf['total']) * 100 if perf['total'] > 0 else 0
        if accuracy < 50:
            weak_topics.append(f"{perf['subject']}:{perf['topic']}")

    if weak_topics:
        insights.append(f"Weak topics identified: {', '.join(weak_topics[:3])}")

    return insights

# Frontend compatibility endpoints - bridge to intelligent system
@app.route('/api/generate-questions', methods=['POST'])
def generate_questions_compat():
    """Compatibility endpoint that routes to intelligent test generation"""
    try:
        data = request.get_json()

        # Map frontend request to intelligent system
        intelligent_request = {
            'user_id': data.get('userId', 'anonymous'),
            'exam_type': 'JEE_MAIN', # Default
            'subjects': [data.get('subject', 'Physics')],
            'question_count': data.get('count', 30),
            'difficulty': data.get('difficulty', 'mixed').lower(),
            'test_mode': data.get('testMode', 'timed')
        }

        # Call the intelligent test generation
        return generate_intelligent_test_internal(intelligent_request)

    except Exception as e:
        logger.error(f"Error in generate-questions compatibility: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/evaluate', methods=['POST'])
def evaluate_compat():
    """Compatibility endpoint that routes to intelligent evaluation"""
    try:
        data = request.get_json()

        # Map frontend request to intelligent system
        intelligent_request = {
            'user_id': data.get('userId', 'anonymous'),
            'test_id': data.get('testId', ''),
            'answers': data.get('answers', {}),
            'time_taken': data.get('timeTaken', 0),
            'questions': data.get('questions', [])
        }

        # Call the intelligent evaluation
        return evaluate_intelligent_test_internal(intelligent_request)

    except Exception as e:
        logger.error(f"Error in evaluate compatibility: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-test-result', methods=['POST'])
def save_test_result():
    """Save test result to database"""
    try:
        data = request.get_json()

        result = {
            'user_id': data.get('userId'),
            'test_id': data.get('testId'),
            'score': data.get('score'),
            'total_questions': data.get('totalQuestions'),
            'correct_answers': data.get('correctAnswers'),
            'time_taken': data.get('timeTaken'),
            'subject_scores': data.get('subjectScores', {}),
            'timestamp': datetime.now(timezone.utc)
        }

        test_results_collection.insert_one(result)

        return jsonify({
            'success': True,
            'message': 'Test result saved successfully'
        })

    except Exception as e:
        logger.error(f"Error saving test result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-test', methods=['POST'])
def save_test():
    """Save test configuration"""
    try:
        data = request.get_json()

        # This is mainly for frontend compatibility
        # The intelligent system handles test generation differently

        return jsonify({
            'success': True,
            'message': 'Test configuration saved',
            'test_id': f"test_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        })

    except Exception as e:
        logger.error(f"Error saving test: {e}")
        return jsonify({'error': str(e)}), 500

def generate_intelligent_test_internal(data):
    """Internal method for intelligent test generation"""
    try:
        user_id = data.get('user_id', 'anonymous')
        subjects = data.get('subjects', ['Physics'])
        question_count = data.get('question_count', 30)
        difficulty = data.get('difficulty', 'mixed')

        # Get user profile for personalization
        user_profile = user_profiles_collection.find_one({'user_id': user_id})

        questions = []

        for subject in subjects:
            subject_questions = list(questions_collection.find({
                'subject': subject
            }))

            if not subject_questions:
                # Try with different case
                subject_questions = list(questions_collection.find({
                    'subject': {'$regex': f'^{subject}$', '$options': 'i'}
                }))

            if not subject_questions:
                logger.warning(f"No questions found for subject: {subject}")
                continue

            # Intelligent question selection based on user profile
            if user_profile and user_profile.get('topic_performance'):
                # Get weak topics for this user
                topic_performance = user_profile.get('topic_performance', {})
                weak_topics = [topic for topic, perf in topic_performance.items()
                               if perf.get('accuracy', 0) < 60 and perf.get('attempts', 0) >= 1]

                # If no specific weak topics yet, use recent poor performance patterns
                if not weak_topics and user_profile.get('recent_scores'):
                    recent_scores = user_profile.get('recent_scores', [])
                    if recent_scores and recent_scores[-1].get('percentage', 100) < 70:
                        # Focus on topics from recent test if performance was poor
                        weak_topics = list(topic_performance.keys())[:5] # Take first 5 topics

                # 70% from weak topics, 30% general
                weak_count = int(question_count * 0.7)
                general_count = question_count - weak_count

                # Get questions from weak topics
                weak_questions = [q for q in subject_questions
                                  if q.get('topic', '').lower() in [t.lower() for t in weak_topics]]

                if weak_questions:
                    questions.extend(random.sample(weak_questions,
                                                  min(weak_count, len(weak_questions))))

                # Fill remaining with general questions
                remaining_needed = question_count - len(questions)
                if remaining_needed > 0:
                    general_questions = [q for q in subject_questions if q not in questions]
                    if general_questions:
                        questions.extend(random.sample(general_questions,
                                                      min(remaining_needed, len(general_questions))))
            else:
                # No profile data, use random selection
                questions.extend(random.sample(subject_questions,
                                              min(question_count, len(subject_questions))))

        # Format questions for frontend
        formatted_questions = []
        for i, q in enumerate(questions):
            # Handle different option formats - frontend expects simple strings
            options = q.get('options', [])
            formatted_options = []

            if options and isinstance(options[0], dict):
                # Format: [{'id': 'A', 'text': '...'}, ...]
                # Extract just the text content for frontend
                for opt in options:
                    formatted_options.append(str(opt.get('text', '')))
            else:
                # Fallback format - ensure strings
                for opt in options[:4]:
                    formatted_options.append(str(opt) if opt else '')

            formatted_q = {
                'id': str(q.get('_id', i)),
                'question': q.get('content', q.get('question', '')),
                'options': formatted_options, # This should now be strings
                'correct_answer': q.get('correct_answer', 'A'),
                'subject': q.get('subject', 'Physics'),
                'topic': q.get('topic', q.get('chapter', 'General')),
                'difficulty': q.get('difficulty', 'medium'),
                'explanation': q.get('explanation', ''),
                'marks': q.get('marks', 4),
                'negative_marks': q.get('negative_marks', 1)
            }
            formatted_questions.append(formatted_q)

        return jsonify({
            'success': True,
            'questions': formatted_questions,
            'total_count': len(formatted_questions),
            'personalized': bool(user_profile),
            'test_id': f"test_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        })

    except Exception as e:
        logger.error(f"Error in intelligent test generation: {e}")
        return jsonify({'error': str(e)}), 500

def evaluate_intelligent_test_internal(data):
    """Internal method for intelligent test evaluation"""
    try:
        user_id = data.get('user_id', 'anonymous')
        answers = data.get('answers', {})
        questions = data.get('questions', [])
        time_taken = data.get('time_taken', 0)

        # Calculate score
        correct_count = 0
        total_score = 0
        subject_scores = {}
        topic_performance = {}

        for i, question in enumerate(questions):
            question_id = str(i)
            user_answer = answers.get(question_id, '')
            correct_answer = question.get('correct_answer', '')
            subject = question.get('subject', 'Physics')
            topic = question.get('topic', 'General')

            # Initialize subject score if not exists
            if subject not in subject_scores:
                subject_scores[subject] = {'correct': 0, 'total': 0, 'score': 0}

            subject_scores[subject]['total'] += 1

            # Check if answer is correct
            is_correct = user_answer.upper() == correct_answer.upper()

            if is_correct:
                correct_count += 1
                total_score += 4 # JEE scoring
                subject_scores[subject]['correct'] += 1
                subject_scores[subject]['score'] += 4
            elif user_answer: # Wrong answer (not blank)
                total_score -= 1 # Negative marking
                subject_scores[subject]['score'] -= 1

            # Track topic performance
            if topic not in topic_performance:
                topic_performance[topic] = {'correct': 0, 'total': 0}

            topic_performance[topic]['total'] += 1
            if is_correct:
                topic_performance[topic]['correct'] += 1

        # Update user profile with intelligent tracking
        if user_id != 'anonymous':
            update_user_profile_intelligent(user_id, topic_performance, total_score, len(questions))

        # Calculate percentages
        accuracy = (correct_count / len(questions)) * 100 if questions else 0

        for subject in subject_scores:
            total = subject_scores[subject]['total']
            if total > 0:
                subject_scores[subject]['percentage'] = (subject_scores[subject]['correct'] / total) * 100

        # Calculate incorrect and unattempted
        incorrect_count = 0
        if questions:
            incorrect_count = len(questions) - correct_count
        
        unattempted_count = 0 # For now, assuming all questions are attempted

        return jsonify({
            'success': True,
            'score': total_score,
            'correct_answers': correct_count,
            'incorrect_answers': incorrect_count,
            'unattempted_answers': unattempted_count,
            'total_questions': len(questions),
            'accuracy': round(accuracy, 2),
            'subject_scores': subject_scores,
            'time_taken': time_taken,
            'performance_insights': generate_performance_insights(topic_performance)
        })

    except Exception as e:
        logger.error(f"Error in intelligent evaluation: {e}")
        return jsonify({'error': str(e)}), 500

def update_user_profile_intelligent(user_id, topic_performance, score, total_questions):
    """Update user profile with intelligent tracking"""
    try:
        # Get existing profile
        profile = user_profiles_collection.find_one({'user_id': user_id})

        if not profile:
            profile = {
                'user_id': user_id,
                'topic_performance': {},
                'total_tests': 0,
                'total_score': 0,
                'recent_scores': [],
                'created_at': datetime.now(timezone.utc)
            }

        # Update topic performance
        existing_topics = profile.get('topic_performance', {})

        for topic, perf in topic_performance.items():
            if topic in existing_topics:
                # Update existing topic stats
                old_correct = existing_topics[topic].get('correct', 0)
                old_total = existing_topics[topic].get('attempts', 0)

                new_correct = old_correct + perf['correct']
                new_total = old_total + perf['total']

                existing_topics[topic] = {
                    'correct': new_correct,
                    'attempts': new_total,
                    'accuracy': (new_correct / new_total) * 100 if new_total > 0 else 0,
                    'last_updated': datetime.now(timezone.utc)
                }
            else:
                # New topic
                existing_topics[topic] = {
                    'correct': perf['correct'],
                    'attempts': perf['total'],
                    'accuracy': (perf['correct'] / perf['total']) * 100 if perf['total'] > 0 else 0,
                    'last_updated': datetime.now(timezone.utc)
                }

        # Update overall stats
        profile['topic_performance'] = existing_topics
        profile['total_tests'] = profile.get('total_tests', 0) + 1
        profile['total_score'] = profile.get('total_score', 0) + score
        profile['average_score'] = profile['total_score'] / profile['total_tests']

        # Update recent scores (keep last 10)
        recent_scores = profile.get('recent_scores', [])
        recent_scores.append({
            'score': score,
            'total': total_questions,
            'percentage': (score / (total_questions * 4)) * 100 if total_questions > 0 else 0,
            'date': datetime.now(timezone.utc)
        })
        profile['recent_scores'] = recent_scores[-10:] # Keep only last 10

        profile['updated_at'] = datetime.now(timezone.utc)

        # Upsert profile
        user_profiles_collection.replace_one(
            {'user_id': user_id},
            profile,
            upsert=True
        )

        logger.info(f"Updated intelligent profile for user {user_id}")

    except Exception as e:
        logger.error(f"Error updating user profile: {e}")

def generate_performance_insights(topic_performance):
    """Generate intelligent performance insights"""
    insights = []

    for topic, perf in topic_performance.items():
        accuracy = (perf['correct'] / perf['total']) * 100 if perf['total'] > 0 else 0

        if accuracy < 40:
            insights.append(f"Focus needed on {topic} (accuracy: {accuracy:.1f}%)")
        elif accuracy > 80:
            insights.append(f"Strong performance in {topic} (accuracy: {accuracy:.1f}%)")

    return insights

@app.route('/api/user-test-results/<user_id>', methods=['GET'])
def get_user_test_results(user_id):
    """Get user's test results with proper date formatting"""
    try:
        # Get test results from database
        results = list(test_results_collection.find({
            'user_id': user_id
        }).sort('completed_at', -1).limit(50))

        # Format results for frontend
        formatted_results = []
        for result in results:
            # Remove MongoDB _id field
            if '_id' in result:
                del result['_id']

            # Ensure proper date format
            completed_at = result.get('completed_at')
            if completed_at and isinstance(completed_at, datetime):
                result['completedAt'] = completed_at.isoformat()
            elif completed_at:
                result['completedAt'] = completed_at
            else:
                # Fallback to current time if no date
                result['completedAt'] = datetime.now(timezone.utc).isoformat()

            # Ensure required fields exist with proper null handling
            result['testName'] = result.get('test_name', result.get('testName', 'Test'))
            result['timeTaken'] = result.get('time_taken', result.get('timeTaken', 0)) or 0
            result['totalQuestions'] = result.get('total_questions', result.get('totalQuestions', 0)) or 0
            result['correctAnswers'] = result.get('correct_answers', result.get('correctAnswers', 0)) or 0

            # Ensure results object exists with percentage
            if 'results' not in result:
                result['results'] = {}

            if 'percentage' not in result['results']:
                # Calculate percentage from available data
                total_q = result.get('total_questions', result.get('totalQuestions', 1))
                correct = result.get('correct_answers', result.get('correctAnswers', 0))

                # Handle None values
                total_q = total_q if total_q is not None else 1
                correct = correct if correct is not None else 0

                result['results']['percentage'] = round((correct / total_q) * 100, 1) if total_q > 0 else 0

            formatted_results.append(result)

        return jsonify({
            'success': True,
            'results': formatted_results
        }), 200

    except Exception as e:
        logger.error(f"Error fetching user test results: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'results': []
        }), 500

@app.route('/api/user-stats/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics"""
    try:
        # Get user profile
        profile = user_profiles_collection.find_one({'user_id': user_id})

        if not profile:
            return jsonify({
                'success': True,
                'stats': {
                    'total_tests': 0,
                    'average_score': 0,
                    'weak_topics': [],
                    'strong_topics': [],
                    'recent_performance': []
                }
            }), 200

        # Remove MongoDB _id field
        if '_id' in profile:
            del profile['_id']

        # Calculate weak and strong topics
        topic_performance = profile.get('topic_performance', {})
        weak_topics = []
        strong_topics = []

        for topic, perf in topic_performance.items():
            accuracy = perf.get('accuracy', 0)
            if accuracy < 60 and perf.get('attempts', 0) >= 2:
                weak_topics.append({
                    'topic': topic,
                    'accuracy': accuracy,
                    'attempts': perf.get('attempts', 0)
                })
            elif accuracy > 80 and perf.get('attempts', 0) >= 2:
                strong_topics.append({
                    'topic': topic,
                    'accuracy': accuracy,
                    'attempts': perf.get('attempts', 0)
                })

        # Sort by accuracy
        weak_topics.sort(key=lambda x: x['accuracy'])
        strong_topics.sort(key=lambda x: x['accuracy'], reverse=True)

        stats = {
            'total_tests': profile.get('total_tests', 0),
            'average_score': round(profile.get('average_score', 0), 2),
            'weak_topics': weak_topics[:10], # Top 10 weak topics
            'strong_topics': strong_topics[:10], # Top 10 strong topics
            'recent_performance': profile.get('recent_scores', [])
        }

        return jsonify({
            'success': True,
            'stats': stats
        }), 200

    except Exception as e:
        logger.error(f"Error fetching user stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'stats': {}
        }), 500

@app.route('/api/evaluate-test', methods=['POST'])
def evaluate_test():
    """Evaluate test and save results with proper date"""
    try:
        data = request.json
        user_id = data.get('user_id')
        test_id = data.get('test_id', f"test_{int(datetime.now(timezone.utc).timestamp())}")
        answers = data.get('answers', {})
        questions = data.get('questions', [])
        time_taken = data.get('time_taken', 0)
        test_name = data.get('test_name', 'Practice Test')

        if not user_id or not questions:
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400

        # Evaluate answers
        total_questions = len(questions)
        correct_answers = 0
        incorrect_answers = 0
        total_score = 0
        detailed_results = []
        
        logger.info(f"Evaluating test for user {user_id}: {total_questions} questions, answers: {answers}")

        for i, question in enumerate(questions):
            user_answer = answers.get(str(i), '')
            correct_answer = question.get('correct_answer', '')
            is_correct = user_answer.upper() == correct_answer.upper() if user_answer and correct_answer else False

            if is_correct:
                correct_answers += 1
                score = question.get('marks', 4)
            elif user_answer: # Attempted but wrong
                incorrect_answers += 1
                score = -question.get('negative_marks', 1)
            else: # Unattempted
                score = 0

            total_score += score
            
            # Debug logging
            logger.info(f"Q{i}: user='{user_answer}', correct='{correct_answer}', is_correct={is_correct}, score={score}")

            detailed_results.append({
                'question_id': question.get('question_id', f'q_{i}'),
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'score': score,
                'subject': question.get('subject', 'Unknown'),
                'chapter': question.get('chapter', 'Unknown'),
                'topic': question.get('topic', 'Unknown')
            })

        # Calculate percentage
        percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        # Create test result document
        test_result = {
            'user_id': user_id,
            'test_id': test_id,
            'test_name': test_name,
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'incorrect_answers': incorrect_answers,
            'unattempted_answers': total_questions - correct_answers - incorrect_answers,
            'total_score': total_score,
            'time_taken': time_taken,
            'completed_at': datetime.now(timezone.utc), # This is the key field for dates
            'results': {
                'percentage': round(percentage, 1),
                'accuracy': round(percentage, 1),
                'correct_answers': correct_answers,
                'total_questions': total_questions
            },
            'detailed_results': detailed_results,
            'created_at': datetime.now(timezone.utc)
        }

        # Save to database
        try:
            test_results_collection.insert_one(test_result)
            logger.info(f"Saved test result for user {user_id}")
        except Exception as e:
            logger.warning(f"Error saving test result: {e}")

        # Update user profile
        update_user_profile_from_test(user_id, test_result)

        return jsonify({
            'success': True,
            'test_id': test_id,
            'score': total_score,
            'correct_answers': correct_answers,
            'incorrect_answers': incorrect_answers,
            'total_questions': total_questions,
            'percentage': round(percentage, 1),
            'time_taken': time_taken
        }), 200

    except Exception as e:
        logger.error(f"Error evaluating test: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def update_user_profile_from_test(user_id, test_result):
    """Update user profile based on test results"""
    try:
        # Get existing profile
        profile = user_profiles_collection.find_one({'user_id': user_id})

        if not profile:
            profile = {
                'user_id': user_id,
                'total_tests': 0,
                'total_score': 0,
                'topic_performance': {},
                'recent_scores': [],
                'created_at': datetime.now(timezone.utc)
            }

        # Update basic stats
        profile['total_tests'] = profile.get('total_tests', 0) + 1
        profile['total_score'] = profile.get('total_score', 0) + test_result['total_score']
        if profile['total_tests'] > 0:
            profile['average_score'] = profile['total_score'] / profile['total_tests']

        # Update topic performance
        topic_performance = profile.get('topic_performance', {})

        for detail in test_result.get('detailed_results', []):
            topic_key = f"{detail['subject']}:{detail['chapter']}:{detail['topic']}"

            if topic_key not in topic_performance:
                topic_performance[topic_key] = {
                    'correct': 0,
                    'attempts': 0,
                    'accuracy': 0
                }

            topic_performance[topic_key]['attempts'] += 1
            if detail['is_correct']:
                topic_performance[topic_key]['correct'] += 1

            # Recalculate accuracy
            attempts = topic_performance[topic_key]['attempts']
            correct = topic_performance[topic_key]['correct']
            topic_performance[topic_key]['accuracy'] = (correct / attempts) * 100 if attempts > 0 else 0

        profile['topic_performance'] = topic_performance

        # Update recent scores (keep last 10)
        recent_scores = profile.get('recent_scores', [])
        recent_scores.append({
            'score': test_result['total_score'],
            'percentage': test_result['results']['percentage'],
            'total_questions': test_result['total_questions'],
            'date': test_result['completed_at']
        })
        profile['recent_scores'] = recent_scores[-10:] # Keep only last 10

        profile['updated_at'] = datetime.now(timezone.utc)

        # Save profile
        user_profiles_collection.replace_one(
            {'user_id': user_id},
            profile,
            upsert=True
        )

        logger.info(f"Updated profile for user {user_id}")

    except Exception as e:
        logger.error(f"Error updating user profile: {e}")

if __name__ == '__main__':
    # Load and vectorize questions on startup
    load_and_vectorize_questions()

    # Start intelligent server
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting JEE Main Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)