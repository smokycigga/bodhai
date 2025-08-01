#!/usr/bin/env python3
"""
Comprehensive Question Type Analyzer
This script scans all question files in the pyqs folder and extracts:
- All unique question types
- Question structures and patterns
- Answer formats
- Special question characteristics
"""

import os
import json
import re
from collections import defaultdict, Counter
from typing import Dict, List, Set, Any

class QuestionTypeAnalyzer:
    def __init__(self):
        self.question_types = set()
        self.question_structures = defaultdict(list)
        self.answer_patterns = defaultdict(int)
        self.special_patterns = defaultdict(int)
        self.content_patterns = defaultdict(int)
        self.option_patterns = defaultdict(int)
        self.total_questions = 0
        self.exam_type_stats = defaultdict(lambda: defaultdict(int))
        
    def analyze_question(self, question: Dict[str, Any], exam_type: str) -> Dict[str, Any]:
        """Analyze a single question and extract all patterns"""
        self.total_questions += 1
        analysis = {
            'exam_type': exam_type,
            'detected_patterns': []
        }
        
        # Extract basic type
        question_type = question.get('type', 'unknown')
        self.question_types.add(question_type)
        self.exam_type_stats[exam_type]['total'] += 1
        self.exam_type_stats[exam_type][question_type] += 1
        
        # Analyze question structure
        structure = self._analyze_structure(question)
        self.question_structures[question_type].append(structure)
        
        # Analyze content patterns
        content = question.get('content', '')
        self._analyze_content_patterns(content, question_type)
        
        # Analyze options
        options = question.get('options', [])
        self._analyze_options(options, question_type)
        
        # Analyze correct answers
        correct_options = question.get('correct_options', [])
        correct_answer = question.get('correct_answer', '')
        self._analyze_answers(correct_options, correct_answer, question_type)
        
        # Detect special question types
        special_types = self._detect_special_types(question)
        for special_type in special_types:
            self.special_patterns[special_type] += 1
            analysis['detected_patterns'].append(special_type)
        
        return analysis
    
    def _analyze_structure(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the structure of a question"""
        structure = {
            'has_content': bool(question.get('content')),
            'has_options': bool(question.get('options')),
            'num_options': len(question.get('options', [])),
            'has_correct_options': bool(question.get('correct_options')),
            'num_correct_options': len(question.get('correct_options', [])),
            'has_correct_answer': bool(question.get('correct_answer')),
            'has_explanation': bool(question.get('explanation')),
            'has_marks': bool(question.get('marks')),
            'has_neg_marks': bool(question.get('negMarks')),
            'has_comprehension': bool(question.get('comprehension')),
            'has_direction': bool(question.get('direction')),
            'has_images': self._has_images(question),
            'fields': list(question.keys())
        }
        return structure
    
    def _has_images(self, question: Dict[str, Any]) -> bool:
        """Check if question contains images"""
        content = str(question.get('content', ''))
        options = question.get('options', [])
        
        # Check for image tags in content
        if '<img' in content or 'src=' in content:
            return True
        
        # Check for image tags in options
        for option in options:
            if isinstance(option, dict):
                option_content = str(option.get('content', ''))
                if '<img' in option_content or 'src=' in option_content:
                    return True
        
        return False
    
    def _analyze_content_patterns(self, content: str, question_type: str):
        """Analyze patterns in question content"""
        if not content:
            return
        
        content_lower = content.lower()
        
        # Mathematical patterns
        if any(pattern in content for pattern in ['$', '\\frac', '\\sum', '\\int', '\\sqrt']):
            self.content_patterns[f'{question_type}_has_math'] += 1
        
        # Chemical patterns
        if any(pattern in content for pattern in ['H_2O', 'CO_2', 'NaCl', 'mol', 'reaction']):
            self.content_patterns[f'{question_type}_has_chemistry'] += 1
        
        # Physics patterns
        if any(pattern in content_lower for pattern in ['force', 'velocity', 'acceleration', 'energy', 'momentum']):
            self.content_patterns[f'{question_type}_has_physics'] += 1
        
        # Biology patterns
        if any(pattern in content_lower for pattern in ['cell', 'dna', 'protein', 'enzyme', 'gene']):
            self.content_patterns[f'{question_type}_has_biology'] += 1
        
        # Numerical patterns
        if re.search(r'\b\d+\.?\d*\b', content):
            self.content_patterns[f'{question_type}_has_numbers'] += 1
        
        # Question keywords
        if any(keyword in content_lower for keyword in ['find', 'calculate', 'determine', 'solve']):
            self.content_patterns[f'{question_type}_computational'] += 1
        
        if any(keyword in content_lower for keyword in ['which', 'what', 'identify', 'select']):
            self.content_patterns[f'{question_type}_identification'] += 1
    
    def _analyze_options(self, options: List[Any], question_type: str):
        """Analyze option patterns"""
        if not options:
            self.option_patterns[f'{question_type}_no_options'] += 1
            return
        
        num_options = len(options)
        self.option_patterns[f'{question_type}_{num_options}_options'] += 1
        
        # Check option format
        if all(isinstance(opt, dict) for opt in options):
            self.option_patterns[f'{question_type}_dict_options'] += 1
            
            # Check for identifiers
            identifiers = [opt.get('identifier', '') for opt in options]
            if all(id for id in identifiers):
                if all(id in 'ABCDEFGH' for id in identifiers):
                    self.option_patterns[f'{question_type}_letter_identifiers'] += 1
        
        elif all(isinstance(opt, str) for opt in options):
            self.option_patterns[f'{question_type}_string_options'] += 1
        
        # Check for image options
        for option in options:
            if isinstance(option, dict):
                content = str(option.get('content', ''))
                if '<img' in content:
                    self.option_patterns[f'{question_type}_image_options'] += 1
                    break
    
    def _analyze_answers(self, correct_options: List[str], correct_answer: str, question_type: str):
        """Analyze answer patterns"""
        if correct_options:
            num_correct = len(correct_options)
            self.answer_patterns[f'{question_type}_{num_correct}_correct'] += 1
            
            if num_correct == 1:
                self.answer_patterns[f'{question_type}_single_correct'] += 1
            elif num_correct > 1:
                self.answer_patterns[f'{question_type}_multiple_correct'] += 1
        
        if correct_answer:
            self.answer_patterns[f'{question_type}_has_correct_answer'] += 1
            
            # Check if it's a letter
            if correct_answer in 'ABCDEFGH':
                self.answer_patterns[f'{question_type}_letter_answer'] += 1
            
            # Check if it's numeric
            try:
                float(correct_answer)
                self.answer_patterns[f'{question_type}_numeric_answer'] += 1
            except ValueError:
                pass
    
    def _detect_special_types(self, question: Dict[str, Any]) -> List[str]:
        """Detect special question types based on content and structure"""
        special_types = []
        content = question.get('content', '').lower()
        
        # Passage-based questions
        if question.get('comprehension') or 'passage' in content:
            special_types.append('passage_based')
        
        # Assertion-Reason questions
        if 'assertion' in content and 'reason' in content:
            special_types.append('assertion_reason')
        
        # Matrix match questions
        if ('match' in content and 'column' in content) or 'list i' in content:
            special_types.append('matrix_match')
        
        # Numerical answer questions (no options but expects numeric answer)
        options = question.get('options', [])
        if not options and any(keyword in content for keyword in ['find', 'calculate', 'value']):
            special_types.append('numerical_answer')
        
        # Integer answer questions
        if 'integer' in content or 'whole number' in content:
            special_types.append('integer_answer')
        
        # True/False questions
        if len(options) == 2 and any('true' in str(opt).lower() or 'false' in str(opt).lower() for opt in options):
            special_types.append('true_false')
        
        # Fill in the blanks
        if '_____' in content or 'fill' in content:
            special_types.append('fill_blanks')
        
        # Multiple correct questions (more than one correct option)
        correct_options = question.get('correct_options', [])
        if len(correct_options) > 1:
            special_types.append('multiple_correct')
        
        # Image-based questions
        if self._has_images(question):
            special_types.append('image_based')
        
        return special_types

def analyze_all_questions():
    """Main function to analyze all questions in the pyqs folder"""
    print("🔍 COMPREHENSIVE QUESTION TYPE ANALYSIS")
    print("=" * 60)
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    pyqs_folder = os.path.join(backend_dir, "pyqs")
    
    if not os.path.exists(pyqs_folder):
        print(f"❌ PYQS folder not found at {pyqs_folder}")
        return
    
    analyzer = QuestionTypeAnalyzer()
    
    # Define exam folders
    exam_folders = {
        'jee_main': 'JEE_MAIN',
        'jee_advanced': 'JEE_ADVANCED', 
        'neet': 'NEET',
        'bitsat': 'BITSAT',
        'other_engineering': 'OTHER_ENGINEERING'
    }
    
    # Analyze each exam folder
    for folder_name, exam_type in exam_folders.items():
        folder_path = os.path.join(pyqs_folder, folder_name)
        
        if not os.path.exists(folder_path):
            print(f"⚠️  Folder {folder_name} not found, skipping...")
            continue
        
        print(f"\n📂 Analyzing {exam_type} questions...")
        folder_questions = 0
        
        for filename in os.listdir(folder_path):
            if not filename.endswith('.json'):
                continue
            
            file_path = os.path.join(folder_path, filename)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Handle different JSON structures
                if isinstance(data, list):
                    for item in data:
                        if 'questions' in item:
                            for question in item['questions']:
                                analyzer.analyze_question(question, exam_type)
                                folder_questions += 1
                        elif isinstance(item, dict) and 'content' in item:
                            # Direct question format
                            analyzer.analyze_question(item, exam_type)
                            folder_questions += 1
                
            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")
        
        print(f"   Processed {folder_questions} questions")
    
    # Generate comprehensive report
    generate_report(analyzer)

def generate_report(analyzer: QuestionTypeAnalyzer):
    """Generate a comprehensive analysis report"""
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE ANALYSIS REPORT")
    print("=" * 60)
    
    print(f"\n📈 TOTAL QUESTIONS ANALYZED: {analyzer.total_questions}")
    
    # Basic question types
    print(f"\n🏷️  BASIC QUESTION TYPES FOUND:")
    print("-" * 40)
    for qtype in sorted(analyzer.question_types):
        count = sum(1 for structures in analyzer.question_structures[qtype] for _ in structures)
        print(f"  • {qtype.upper()}: Found in data")
    
    # Exam-wise distribution
    print(f"\n🎯 EXAM-WISE DISTRIBUTION:")
    print("-" * 40)
    for exam_type, stats in analyzer.exam_type_stats.items():
        total = stats['total']
        print(f"\n{exam_type} ({total} questions):")
        for qtype, count in sorted(stats.items()):
            if qtype != 'total':
                percentage = (count / total) * 100 if total > 0 else 0
                print(f"  • {qtype}: {count} ({percentage:.1f}%)")
    
    # Special question patterns
    print(f"\n🔍 SPECIAL QUESTION PATTERNS DETECTED:")
    print("-" * 40)
    for pattern, count in sorted(analyzer.special_patterns.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / analyzer.total_questions) * 100
        print(f"  • {pattern.replace('_', ' ').title()}: {count} ({percentage:.1f}%)")
    
    # Answer patterns
    print(f"\n✅ ANSWER PATTERNS:")
    print("-" * 40)
    answer_summary = defaultdict(int)
    for pattern, count in analyzer.answer_patterns.items():
        if 'single_correct' in pattern:
            answer_summary['Single Correct'] += count
        elif 'multiple_correct' in pattern:
            answer_summary['Multiple Correct'] += count
        elif 'numeric_answer' in pattern:
            answer_summary['Numeric Answer'] += count
        elif 'letter_answer' in pattern:
            answer_summary['Letter Answer'] += count
    
    for pattern, count in sorted(answer_summary.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / analyzer.total_questions) * 100
        print(f"  • {pattern}: {count} ({percentage:.1f}%)")
    
    # Content patterns
    print(f"\n📝 CONTENT PATTERNS:")
    print("-" * 40)
    content_summary = defaultdict(int)
    for pattern, count in analyzer.content_patterns.items():
        if 'has_math' in pattern:
            content_summary['Mathematical Content'] += count
        elif 'has_chemistry' in pattern:
            content_summary['Chemistry Content'] += count
        elif 'has_physics' in pattern:
            content_summary['Physics Content'] += count
        elif 'has_biology' in pattern:
            content_summary['Biology Content'] += count
        elif 'computational' in pattern:
            content_summary['Computational Questions'] += count
        elif 'identification' in pattern:
            content_summary['Identification Questions'] += count
    
    for pattern, count in sorted(content_summary.items(), key=lambda x: x[1], reverse=True):
        if count > 0:
            percentage = (count / analyzer.total_questions) * 100
            print(f"  • {pattern}: {count} ({percentage:.1f}%)")
    
    # Option patterns
    print(f"\n🔘 OPTION PATTERNS:")
    print("-" * 40)
    option_summary = defaultdict(int)
    for pattern, count in analyzer.option_patterns.items():
        if '_options' in pattern and pattern.split('_')[1].isdigit():
            num_options = pattern.split('_')[1]
            option_summary[f'{num_options} Options'] += count
        elif 'no_options' in pattern:
            option_summary['No Options (Numerical)'] += count
        elif 'image_options' in pattern:
            option_summary['Image Options'] += count
    
    for pattern, count in sorted(option_summary.items(), key=lambda x: x[1], reverse=True):
        if count > 0:
            percentage = (count / analyzer.total_questions) * 100
            print(f"  • {pattern}: {count} ({percentage:.1f}%)")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS FOR QUESTION TYPE SYSTEM:")
    print("-" * 40)
    
    recommendations = []
    
    # Check for multiple correct questions
    if analyzer.special_patterns.get('multiple_correct', 0) > 0:
        recommendations.append("✅ Implement MCQM (Multiple Correct) support")
    
    # Check for numerical questions
    if analyzer.special_patterns.get('numerical_answer', 0) > 0:
        recommendations.append("✅ Implement Numerical Answer input")
    
    # Check for integer questions
    if analyzer.special_patterns.get('integer_answer', 0) > 0:
        recommendations.append("✅ Implement Integer Answer input")
    
    # Check for passage-based questions
    if analyzer.special_patterns.get('passage_based', 0) > 0:
        recommendations.append("✅ Implement Passage-based question layout")
    
    # Check for assertion-reason questions
    if analyzer.special_patterns.get('assertion_reason', 0) > 0:
        recommendations.append("✅ Implement Assertion-Reason question type")
    
    # Check for matrix match questions
    if analyzer.special_patterns.get('matrix_match', 0) > 0:
        recommendations.append("✅ Implement Matrix Match question type")
    
    # Check for image-based questions
    if analyzer.special_patterns.get('image_based', 0) > 0:
        recommendations.append("✅ Ensure proper image rendering support")
    
    # Check for true/false questions
    if analyzer.special_patterns.get('true_false', 0) > 0:
        recommendations.append("✅ Implement True/False question type")
    
    for rec in recommendations:
        print(f"  {rec}")
    
    # Generate question type enum
    print(f"\n🔧 SUGGESTED QUESTION TYPE ENUM:")
    print("-" * 40)
    print("class QuestionType(Enum):")
    
    suggested_types = set()
    
    # Add basic types
    for qtype in analyzer.question_types:
        if qtype != 'unknown':
            suggested_types.add(qtype.upper())
    
    # Add special types
    for special_type in analyzer.special_patterns.keys():
        if analyzer.special_patterns[special_type] > 10:  # Only if significant count
            suggested_types.add(special_type.upper())
    
    for qtype in sorted(suggested_types):
        enum_name = qtype.replace(' ', '_')
        enum_value = qtype.lower().replace(' ', '_')
        print(f'    {enum_name} = "{enum_value}"')
    
    print(f"\n🎉 Analysis complete! Found {len(analyzer.question_types)} basic types and {len(analyzer.special_patterns)} special patterns.")
    print("Use this data to build a comprehensive question type system.")

if __name__ == "__main__":
    analyze_all_questions()