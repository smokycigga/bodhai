from dataclasses import dataclass
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class ExamType(str, Enum):
    JEE_MAIN = "JEE_MAIN"
    JEE_ADVANCED = "JEE_ADVANCED"
    NEET = "NEET"
    BITSAT = "BITSAT"

class Subject(str, Enum):
    PHYSICS = "Physics"
    CHEMISTRY = "Chemistry"
    MATHEMATICS = "Mathematics"
    BIOLOGY = "Biology"

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

@dataclass
class Question:
    id: str
    question_text: str
    options: List[str]
    correct_answer: str # Single correct answer (A, B, C, D)
    subject: str
    topic: str
    difficulty: Difficulty
    marks: int
    exam_type: ExamType
    year: int
    explanation: str = ""
    chapter: str = ""
    created_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "question_text": self.question_text,
            "options": self.options,
            "correct_answer": self.correct_answer,
            "subject": self.subject,
            "topic": self.topic,
            "difficulty": self.difficulty,
            "marks": self.marks,
            "exam_type": self.exam_type,
            "year": self.year,
            "explanation": self.explanation,
            "chapter": self.chapter,
            "created_at": self.created_at or datetime.utcnow()
        }

@dataclass
class TopicPerformance:
    topic: str
    subject: str
    chapter: str
    total_attempted: int = 0
    correct_answers: int = 0
    accuracy: float = 0.0
    last_attempted: Optional[datetime] = None

    def update_performance(self, is_correct: bool):
        self.total_attempted += 1
        if is_correct:
            self.correct_answers += 1
            self.accuracy = (self.correct_answers / self.total_attempted) * 100
            self.last_attempted = datetime.utcnow()

@dataclass
class UserStreak:
    user_id: str
    current_streak: int = 0
    longest_streak: int = 0
    last_test_date: Optional[str] = None  # Store as YYYY-MM-DD format
    streak_start_date: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "last_test_date": self.last_test_date,
            "streak_start_date": self.streak_start_date,
            "created_at": self.created_at or datetime.utcnow(),
            "updated_at": self.updated_at or datetime.utcnow()
        }

@dataclass
class UserProfile:
    user_id: str
    exam_type: str
    topic_performance: Dict[str, TopicPerformance]
    attempted_questions: List[str]
    mistake_questions: List[str]
    weak_topics: List[str]
    strong_topics: List[str]
    streak_data: Optional[UserStreak] = None
    created_at: datetime = None
    updated_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "exam_type": self.exam_type,
            "topic_performance": {k: v.__dict__ for k, v in self.topic_performance.items()},
            "attempted_questions": self.attempted_questions,
            "mistake_questions": self.mistake_questions,
            "weak_topics": self.weak_topics,
            "strong_topics": self.strong_topics,
            "streak_data": self.streak_data.to_dict() if self.streak_data else None,
            "created_at": self.created_at or datetime.utcnow(),
            "updated_at": self.updated_at or datetime.utcnow()
        }

@dataclass
class TestConfig:
    exam_type: str
    subjects: List[str]
    total_questions: int
    weak_topic_percentage: float = 0.7
    general_percentage: float = 0.3
    exclude_attempted: bool = True
    difficulty_levels: Optional[List[str]] = None
