"""
Enhanced Question Types System for JEE/NEET Competitive Exams
Supports multiple question formats as per actual exam patterns
"""

from enum import Enum
from typing import List, Dict, Any, Union
import re

class QuestionType(Enum):
    """Supported question types based on actual data analysis"""
    # Basic types found in data
    MCQ = "mcq"                    # Single correct MCQ (80.8% of questions)
    MCQM = "mcqm"                  # Multiple correct MCQ (2.8% of questions)
    INTEGER = "integer"            # Integer answer type (22.4% JEE Main, 32.4% JEE Advanced)
    
    # Special patterns detected in data
    NUMERICAL_ANSWER = "numerical_answer"  # Questions expecting numerical input (5.3%)
    INTEGER_ANSWER = "integer_answer"      # Questions expecting integer input (4.1%)
    PASSAGE_BASED = "passage_based"        # Passage-based questions (1.1%)
    MATRIX_MATCH = "matrix_match"          # Matrix match questions (1.1%)
    ASSERTION_REASON = "assertion_reason"  # Assertion-Reason questions (0.7%)
    FILL_BLANKS = "fill_blanks"           # Fill in the blanks (14.7%)
    IMAGE_BASED = "image_based"           # Image-based questions (15.7%)

class QuestionTypeDetector:
    """Automatically detect question type from question data"""
    
    @staticmethod
    def detect_question_type(question_data: Dict[str, Any]) -> QuestionType:
        """
        Detect question type based on actual data patterns found in analysis
        """
        # Check if type is already specified (most reliable)
        if 'type' in question_data:
            type_str = question_data['type'].lower()
            if type_str == 'mcq':
                # Check if multiple correct answers
                correct_options = question_data.get('correct_options', [])
                if len(correct_options) > 1:
                    return QuestionType.MCQM
                return QuestionType.MCQ
            elif type_str == 'mcqm':
                return QuestionType.MCQM
            elif type_str == 'integer':
                return QuestionType.INTEGER
        
        # Auto-detect based on structure and content patterns
        options = question_data.get('options', [])
        correct_options = question_data.get('correct_options', [])
        content = question_data.get('content', '').lower()
        
        # Check for integer type (no options, expects integer answer)
        if not options or len(options) == 0:
            if 'integer' in content or any(keyword in content for keyword in ['whole number', 'find the value']):
                return QuestionType.INTEGER_ANSWER
            # Default numerical for no-option questions
            return QuestionType.NUMERICAL_ANSWER
        
        # Check for passage-based (1.1% of questions)
        if question_data.get('comprehension') or 'passage' in content:
            return QuestionType.PASSAGE_BASED
        
        # Check for assertion-reason (0.7% of questions)
        if 'assertion' in content and 'reason' in content:
            return QuestionType.ASSERTION_REASON
        
        # Check for matrix match (1.1% of questions)
        if ('match' in content and 'column' in content) or 'list i' in content:
            return QuestionType.MATRIX_MATCH
        
        # Check for fill in the blanks (14.7% of questions)
        if '_____' in content or 'fill' in content:
            return QuestionType.FILL_BLANKS
        
        # Check for image-based questions (15.7% of questions)
        if QuestionTypeDetector._has_images(question_data):
            # Still need to determine the base type
            if len(correct_options) > 1:
                return QuestionType.MCQM
            return QuestionType.IMAGE_BASED
        
        # Check for multiple correct (2.8% of questions)
        if len(correct_options) > 1:
            return QuestionType.MCQM
        
        # Default to single correct MCQ (80.8% of questions)
        return QuestionType.MCQ
    
    @staticmethod
    def _has_images(question_data: Dict[str, Any]) -> bool:
        """Check if question contains images"""
        content = str(question_data.get('content', ''))
        options = question_data.get('options', [])
        
        # Check for image tags in content
        if '<img' in content or 'src=' in content or 'data-orsrc=' in content:
            return True
        
        # Check for image tags in options
        for option in options:
            if isinstance(option, dict):
                option_content = str(option.get('content', ''))
                if '<img' in option_content or 'src=' in option_content:
                    return True
        
        return False

class QuestionValidator:
    """Validate question structure for different types"""
    
    @staticmethod
    def validate_mcq(question_data: Dict[str, Any]) -> bool:
        """Validate single correct MCQ structure"""
        required_fields = ['options', 'correct_options']
        if not all(field in question_data for field in required_fields):
            return False
        
        options = question_data['options']
        correct_options = question_data['correct_options']
        
        return (len(options) >= 2 and 
                len(correct_options) == 1 and 
                correct_options[0] in [opt.get('identifier', '') for opt in options])
    
    @staticmethod
    def validate_mcqm(question_data: Dict[str, Any]) -> bool:
        """Validate multiple correct MCQ structure"""
        required_fields = ['options', 'correct_options']
        if not all(field in question_data for field in required_fields):
            return False
        
        options = question_data['options']
        correct_options = question_data['correct_options']
        option_ids = [opt.get('identifier', '') for opt in options]
        
        return (len(options) >= 2 and 
                len(correct_options) >= 2 and 
                all(opt in option_ids for opt in correct_options))
    
    @staticmethod
    def validate_numerical(question_data: Dict[str, Any]) -> bool:
        """Validate numerical answer type structure"""
        return 'correct_answer' in question_data or 'answer_range' in question_data

class AnswerEvaluator:
    """Evaluate answers for different question types"""
    
    @staticmethod
    def evaluate_mcq(user_answer: str, correct_options: List[str]) -> bool:
        """Evaluate single correct MCQ"""
        return user_answer in correct_options
    
    @staticmethod
    def evaluate_mcqm(user_answers: List[str], correct_options: List[str]) -> Dict[str, Any]:
        """Evaluate multiple correct MCQ with partial marking"""
        if not user_answers:
            return {'correct': False, 'score': 0, 'partial_score': 0}
        
        correct_selected = set(user_answers) & set(correct_options)
        incorrect_selected = set(user_answers) - set(correct_options)
        
        # JEE Advanced marking scheme for MCQM
        # +4 for all correct, -2 for each wrong, 0 for partial correct
        if len(correct_selected) == len(correct_options) and len(incorrect_selected) == 0:
            return {'correct': True, 'score': 4, 'partial_score': 4}
        elif len(incorrect_selected) > 0:
            return {'correct': False, 'score': -2 * len(incorrect_selected), 'partial_score': 0}
        else:
            return {'correct': False, 'score': 0, 'partial_score': len(correct_selected)}
    
    @staticmethod
    def evaluate_numerical(user_answer: Union[str, float], correct_answer: Union[str, float], 
                          tolerance: float = 0.01) -> bool:
        """Evaluate numerical answer with tolerance"""
        try:
            user_val = float(user_answer)
            correct_val = float(correct_answer)
            return abs(user_val - correct_val) <= tolerance
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def evaluate_integer(user_answer: Union[str, int], correct_answer: Union[str, int]) -> bool:
        """Evaluate integer answer (exact match)"""
        try:
            return int(user_answer) == int(correct_answer)
        except (ValueError, TypeError):
            return False

class QuestionTypeEnhancer:
    """Enhance existing questions with proper type classification"""
    
    @staticmethod
    def enhance_question(question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add enhanced type information to question"""
        enhanced_question = question_data.copy()
        
        # Detect question type
        question_type = QuestionTypeDetector.detect_question_type(question_data)
        enhanced_question['question_type'] = question_type.value
        
        # Add type-specific metadata
        if question_type == QuestionType.MCQM:
            enhanced_question['marking_scheme'] = {
                'correct_all': 4,
                'incorrect_penalty': -2,
                'partial_credit': 0
            }
        elif question_type == QuestionType.NUMERICAL_ANSWER:
            enhanced_question['answer_type'] = 'numerical'
            enhanced_question['tolerance'] = 0.01
        elif question_type == QuestionType.INTEGER:
            enhanced_question['answer_type'] = 'integer'
            enhanced_question['tolerance'] = 0
        
        # Add difficulty-based marking if not present
        if 'marks' not in enhanced_question:
            if question_type in [QuestionType.MCQM, QuestionType.MATRIX_MATCH]:
                enhanced_question['marks'] = 4
            else:
                enhanced_question['marks'] = 4
        
        if 'negMarks' not in enhanced_question:
            if question_type == QuestionType.NUMERICAL_ANSWER:
                enhanced_question['negMarks'] = 0  # No negative marking for numerical
            else:
                enhanced_question['negMarks'] = 1
        
        return enhanced_question

# Question type specific templates for frontend based on actual data analysis
QUESTION_TYPE_TEMPLATES = {
    QuestionType.MCQ: {
        'component': 'SingleChoiceQuestion',
        'answer_format': 'single_option',
        'validation': 'required',
        'percentage': 80.8,
        'description': 'Single correct multiple choice'
    },
    QuestionType.MCQM: {
        'component': 'MultipleChoiceQuestion', 
        'answer_format': 'multiple_options',
        'validation': 'min_one_required',
        'percentage': 2.8,
        'description': 'Multiple correct options (JEE Advanced style)'
    },
    QuestionType.INTEGER: {
        'component': 'IntegerQuestion',
        'answer_format': 'integer_number',
        'validation': 'integer_required',
        'percentage': 22.4,  # JEE Main percentage
        'description': 'Integer answer input (JEE Main/Advanced)'
    },
    QuestionType.NUMERICAL_ANSWER: {
        'component': 'NumericalQuestion',
        'answer_format': 'decimal_number',
        'validation': 'numeric_required',
        'percentage': 5.3,
        'description': 'Numerical answer input'
    },
    QuestionType.INTEGER_ANSWER: {
        'component': 'IntegerQuestion',
        'answer_format': 'integer_number',
        'validation': 'integer_required',
        'percentage': 4.1,
        'description': 'Integer answer input'
    },
    QuestionType.PASSAGE_BASED: {
        'component': 'PassageBasedQuestion',
        'answer_format': 'single_option',
        'validation': 'required',
        'percentage': 1.1,
        'description': 'Passage-based comprehension questions'
    },
    QuestionType.MATRIX_MATCH: {
        'component': 'MatrixMatchQuestion',
        'answer_format': 'matrix_mapping',
        'validation': 'matrix_required',
        'percentage': 1.1,
        'description': 'Matrix matching questions'
    },
    QuestionType.ASSERTION_REASON: {
        'component': 'AssertionReasonQuestion',
        'answer_format': 'assertion_reason_choice',
        'validation': 'required',
        'percentage': 0.7,
        'description': 'Assertion and Reason type questions'
    },
    QuestionType.FILL_BLANKS: {
        'component': 'FillBlanksQuestion',
        'answer_format': 'text_input',
        'validation': 'required',
        'percentage': 14.7,
        'description': 'Fill in the blanks questions'
    },
    QuestionType.IMAGE_BASED: {
        'component': 'ImageBasedQuestion',
        'answer_format': 'single_option',
        'validation': 'required',
        'percentage': 15.7,
        'description': 'Questions with images/diagrams'
    }
}

def get_question_type_info(question_type: QuestionType) -> Dict[str, Any]:
    """Get template information for a question type"""
    return QUESTION_TYPE_TEMPLATES.get(question_type, QUESTION_TYPE_TEMPLATES[QuestionType.MCQ])