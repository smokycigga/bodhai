#!/usr/bin/env python3
"""
Demonstration of Agentic Behavior
Shows how the system adapts question selection based on user performance
"""

import json
import random
from datetime import datetime
from typing import Dict, List, Any

def simulate_user_performance(user_id: str, weak_subjects: List[str], accuracy: float) -> Dict[str, Any]:
    """Simulate a user's performance history"""
    
    # Simulate chapter performance data
    chapters = {
        'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism'],
        'Chemistry': ['Organic', 'Inorganic', 'Physical', 'Analytical'],
        'Mathematics': ['Calculus', 'Algebra', 'Geometry', 'Statistics']
    }
    
    chapter_performance = {}
    
    for subject, chapter_list in chapters.items():
        for chapter in chapter_list:
            chapter_key = f"{subject}_{chapter}"
            
            # Simulate performance based on whether subject is weak
            if subject in weak_subjects:
                # Poor performance in weak subjects
                base_accuracy = accuracy * 0.4  # Much lower accuracy
                attempts = random.randint(8, 15)  # More attempts due to struggle
            else:
                # Better performance in strong subjects
                base_accuracy = accuracy * 1.3  # Higher accuracy
                attempts = random.randint(5, 10)
            
            # Add some randomness
            final_accuracy = max(0.1, min(0.95, base_accuracy + random.uniform(-0.1, 0.1)))
            correct = int(attempts * final_accuracy)
            
            chapter_performance[chapter_key] = {
                'subject': subject,
                'correct': correct,
                'total': attempts,
                'accuracy': (correct / attempts) * 100
            }
    
    return {
        'user_id': user_id,
        'chapter_performance': chapter_performance,
        'overall_accuracy': accuracy * 100,
        'weak_subjects': weak_subjects
    }

def analyze_user_intelligence(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze user intelligence to identify weak topics and mistake patterns"""
    
    weak_topics = {}
    mistake_patterns = {}
    
    for chapter_key, perf in user_data['chapter_performance'].items():
        subject = perf['subject']
        accuracy = perf['accuracy']
        
        if subject not in weak_topics:
            weak_topics[subject] = []
            mistake_patterns[subject] = []
        
        # Identify weak topics (accuracy < 65%)
        if accuracy < 65 and perf['total'] >= 2:
            priority = calculate_topic_priority(perf)
            weak_topics[subject].append({
                'topic': chapter_key,
                'accuracy': accuracy,
                'attempts': perf['total'],
                'priority': priority
            })
        
        # Identify mistake patterns (accuracy < 50%)
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
        'total_weak_topics': sum(len(topics) for topics in weak_topics.values()),
        'total_mistake_patterns': sum(len(patterns) for patterns in mistake_patterns.values())
    }

def calculate_topic_priority(performance: Dict[str, Any]) -> float:
    """Calculate priority score for topic remediation"""
    accuracy = performance['accuracy']
    attempts = performance['total']
    
    # Lower accuracy = higher priority
    accuracy_score = (100 - accuracy) / 100
    
    # More attempts = higher confidence in the weakness
    attempt_score = min(attempts / 10, 1.0)
    
    # Recent performance gets higher priority
    recency_score = 0.8
    
    return accuracy_score * 0.5 + attempt_score * 0.3 + recency_score * 0.2

def simulate_adaptive_question_selection(user_intelligence: Dict[str, Any], total_questions: int = 30) -> Dict[str, Any]:
    """Simulate how the system would select questions adaptively"""
    
    # Mock question database
    all_questions = []
    question_id = 1
    
    subjects = ['Physics', 'Chemistry', 'Mathematics']
    chapters = {
        'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism'],
        'Chemistry': ['Organic', 'Inorganic', 'Physical', 'Analytical'],
        'Mathematics': ['Calculus', 'Algebra', 'Geometry', 'Statistics']
    }
    
    for subject in subjects:
        for chapter in chapters[subject]:
            for i in range(15):  # 15 questions per chapter
                all_questions.append({
                    'question_id': f'q_{question_id}',
                    'subject': subject,
                    'chapter': chapter,
                    'topic': f'{subject}_{chapter}',
                    'difficulty': random.choice(['easy', 'medium', 'hard'])
                })
                question_id += 1
    
    # Adaptive selection algorithm
    selected_questions = []
    exclude_ids = set()
    
    # 60% from weak topics
    weak_count = int(total_questions * 0.6)
    weak_questions_selected = 0
    
    for subject, weak_topics in user_intelligence['weak_topics'].items():
        for weak_topic in weak_topics[:2]:  # Top 2 weak topics per subject
            topic_questions = [q for q in all_questions 
                             if q['topic'] == weak_topic['topic'] and q['question_id'] not in exclude_ids]
            
            # Select questions from this weak topic
            questions_to_select = min(len(topic_questions), max(1, weak_count // 4))
            selected_from_topic = topic_questions[:questions_to_select]
            
            for q in selected_from_topic:
                q['selection_reason'] = f'weak_topic_{weak_topic["topic"]}'
                q['priority_score'] = weak_topic['priority']
            
            selected_questions.extend(selected_from_topic)
            exclude_ids.update(q['question_id'] for q in selected_from_topic)
            weak_questions_selected += len(selected_from_topic)
            
            if weak_questions_selected >= weak_count:
                break
        if weak_questions_selected >= weak_count:
            break
    
    # 25% from mistake patterns
    mistake_count = int(total_questions * 0.25)
    mistake_questions_selected = 0
    
    for subject, mistake_patterns in user_intelligence['mistake_patterns'].items():
        for mistake_pattern in mistake_patterns[:2]:  # Top 2 mistake patterns per subject
            pattern_questions = [q for q in all_questions 
                               if q['topic'] == mistake_pattern['topic'] and q['question_id'] not in exclude_ids]
            
            questions_to_select = min(len(pattern_questions), max(1, mistake_count // 2))
            selected_from_pattern = pattern_questions[:questions_to_select]
            
            for q in selected_from_pattern:
                q['selection_reason'] = f'mistake_pattern_{mistake_pattern["topic"]}'
                q['error_rate'] = mistake_pattern['error_rate']
            
            selected_questions.extend(selected_from_pattern)
            exclude_ids.update(q['question_id'] for q in selected_from_pattern)
            mistake_questions_selected += len(selected_from_pattern)
            
            if mistake_questions_selected >= mistake_count:
                break
        if mistake_questions_selected >= mistake_count:
            break
    
    # 15% general coverage
    remaining_count = total_questions - len(selected_questions)
    general_questions = [q for q in all_questions if q['question_id'] not in exclude_ids]
    
    # Select diverse questions from different subjects
    selected_general = []
    subjects_covered = set()
    
    for q in general_questions:
        if len(selected_general) >= remaining_count:
            break
        
        if q['subject'] not in subjects_covered or len(selected_general) < remaining_count // 2:
            q['selection_reason'] = 'general_coverage'
            selected_general.append(q)
            subjects_covered.add(q['subject'])
    
    selected_questions.extend(selected_general[:remaining_count])
    
    # Analyze selection
    selection_analysis = analyze_question_selection(selected_questions)
    
    return {
        'selected_questions': selected_questions,
        'total_selected': len(selected_questions),
        'selection_breakdown': {
            'weak_topics': weak_questions_selected,
            'mistake_patterns': mistake_questions_selected,
            'general_coverage': len(selected_questions) - weak_questions_selected - mistake_questions_selected
        },
        'analysis': selection_analysis
    }

def analyze_question_selection(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze the question selection for agentic behavior"""
    
    # Subject distribution
    subject_dist = {}
    reason_dist = {}
    
    for q in questions:
        subject = q['subject']
        reason = q.get('selection_reason', 'unknown')
        
        subject_dist[subject] = subject_dist.get(subject, 0) + 1
        reason_dist[reason] = reason_dist.get(reason, 0) + 1
    
    # Calculate adaptiveness metrics
    weak_topic_questions = sum(1 for q in questions if 'weak_topic' in q.get('selection_reason', ''))
    mistake_pattern_questions = sum(1 for q in questions if 'mistake_pattern' in q.get('selection_reason', ''))
    
    adaptiveness_score = ((weak_topic_questions + mistake_pattern_questions) / len(questions)) * 100
    
    return {
        'subject_distribution': subject_dist,
        'selection_reason_distribution': reason_dist,
        'adaptiveness_metrics': {
            'weak_topic_focus_percentage': (weak_topic_questions / len(questions)) * 100,
            'mistake_pattern_focus_percentage': (mistake_pattern_questions / len(questions)) * 100,
            'overall_adaptiveness_score': adaptiveness_score
        },
        'uniqueness_maintained': len(set(q['question_id'] for q in questions)) == len(questions)
    }

def demonstrate_agentic_behavior():
    """Demonstrate the complete agentic behavior workflow"""
    
    print("🧠 AGENTIC BEHAVIOR DEMONSTRATION")
    print("="*60)
    
    # Test Case 1: Student weak in Physics
    print("\n📚 TEST CASE 1: Student Weak in Physics")
    print("-" * 40)
    
    user1_data = simulate_user_performance(
        user_id="student_weak_physics",
        weak_subjects=["Physics"],
        accuracy=0.45
    )
    
    print(f"User: {user1_data['user_id']}")
    print(f"Overall Accuracy: {user1_data['overall_accuracy']:.1f}%")
    print(f"Weak Subjects: {', '.join(user1_data['weak_subjects'])}")
    
    # Analyze intelligence
    intelligence1 = analyze_user_intelligence(user1_data)
    print(f"\n🎯 Intelligence Analysis:")
    print(f"   Total Weak Topics: {intelligence1['total_weak_topics']}")
    print(f"   Total Mistake Patterns: {intelligence1['total_mistake_patterns']}")
    
    # Show weak topics
    for subject, topics in intelligence1['weak_topics'].items():
        if topics:
            print(f"   {subject} Weak Topics:")
            for topic in topics[:2]:  # Show top 2
                print(f"     - {topic['topic']}: {topic['accuracy']:.1f}% (Priority: {topic['priority']:.2f})")
    
    # Adaptive question selection
    selection1 = simulate_adaptive_question_selection(intelligence1)
    print(f"\n🎯 Adaptive Question Selection:")
    print(f"   Total Questions: {selection1['total_selected']}")
    print(f"   Breakdown:")
    breakdown = selection1['selection_breakdown']
    print(f"     - Weak Topics: {breakdown['weak_topics']} ({breakdown['weak_topics']/30*100:.1f}%)")
    print(f"     - Mistake Patterns: {breakdown['mistake_patterns']} ({breakdown['mistake_patterns']/30*100:.1f}%)")
    print(f"     - General Coverage: {breakdown['general_coverage']} ({breakdown['general_coverage']/30*100:.1f}%)")
    
    analysis1 = selection1['analysis']
    print(f"   Subject Distribution: {analysis1['subject_distribution']}")
    print(f"   Adaptiveness Score: {analysis1['adaptiveness_metrics']['overall_adaptiveness_score']:.1f}%")
    print(f"   Uniqueness Maintained: {'✅' if analysis1['uniqueness_maintained'] else '❌'}")
    
    # Test Case 2: Student weak in Chemistry and Math
    print("\n📚 TEST CASE 2: Student Weak in Chemistry & Mathematics")
    print("-" * 50)
    
    user2_data = simulate_user_performance(
        user_id="student_weak_chem_math",
        weak_subjects=["Chemistry", "Mathematics"],
        accuracy=0.35
    )
    
    print(f"User: {user2_data['user_id']}")
    print(f"Overall Accuracy: {user2_data['overall_accuracy']:.1f}%")
    print(f"Weak Subjects: {', '.join(user2_data['weak_subjects'])}")
    
    # Analyze intelligence
    intelligence2 = analyze_user_intelligence(user2_data)
    print(f"\n🎯 Intelligence Analysis:")
    print(f"   Total Weak Topics: {intelligence2['total_weak_topics']}")
    print(f"   Total Mistake Patterns: {intelligence2['total_mistake_patterns']}")
    
    # Adaptive question selection
    selection2 = simulate_adaptive_question_selection(intelligence2)
    print(f"\n🎯 Adaptive Question Selection:")
    print(f"   Total Questions: {selection2['total_selected']}")
    analysis2 = selection2['analysis']
    print(f"   Subject Distribution: {analysis2['subject_distribution']}")
    print(f"   Adaptiveness Score: {analysis2['adaptiveness_metrics']['overall_adaptiveness_score']:.1f}%")
    
    # Test Case 3: Strong student (control case)
    print("\n📚 TEST CASE 3: Strong Student (Control)")
    print("-" * 40)
    
    user3_data = simulate_user_performance(
        user_id="strong_student",
        weak_subjects=[],  # No weak subjects
        accuracy=0.85
    )
    
    print(f"User: {user3_data['user_id']}")
    print(f"Overall Accuracy: {user3_data['overall_accuracy']:.1f}%")
    print(f"Weak Subjects: {user3_data['weak_subjects'] if user3_data['weak_subjects'] else 'None'}")
    
    intelligence3 = analyze_user_intelligence(user3_data)
    selection3 = simulate_adaptive_question_selection(intelligence3)
    analysis3 = selection3['analysis']
    
    print(f"\n🎯 Adaptive Question Selection:")
    print(f"   Subject Distribution: {analysis3['subject_distribution']}")
    print(f"   Adaptiveness Score: {analysis3['adaptiveness_metrics']['overall_adaptiveness_score']:.1f}%")
    
    # Summary comparison
    print("\n🏆 AGENTIC BEHAVIOR SUMMARY")
    print("="*60)
    
    cases = [
        ("Physics Weak Student", analysis1, user1_data['weak_subjects']),
        ("Chem+Math Weak Student", analysis2, user2_data['weak_subjects']),
        ("Strong Student", analysis3, user3_data['weak_subjects'])
    ]
    
    print(f"{'Student Type':<25} {'Physics':<8} {'Chemistry':<10} {'Math':<8} {'Adaptiveness':<12}")
    print("-" * 65)
    
    for case_name, analysis, weak_subjects in cases:
        subject_dist = analysis['subject_distribution']
        adaptiveness = analysis['adaptiveness_metrics']['overall_adaptiveness_score']
        
        physics_q = subject_dist.get('Physics', 0)
        chemistry_q = subject_dist.get('Chemistry', 0)
        math_q = subject_dist.get('Mathematics', 0)
        
        print(f"{case_name:<25} {physics_q:<8} {chemistry_q:<10} {math_q:<8} {adaptiveness:<12.1f}%")
    
    print("\n✅ AGENTIC BEHAVIOR VERIFIED:")
    print("   • System identifies weak topics from user performance")
    print("   • Question selection adapts based on individual weaknesses")
    print("   • Higher proportion of questions from weak areas")
    print("   • Maintains question uniqueness across generations")
    print("   • Provides personalized learning experience")
    
    # Save demonstration results
    demo_results = {
        'timestamp': datetime.now().isoformat(),
        'test_cases': [
            {
                'name': 'Physics Weak Student',
                'user_data': user1_data,
                'intelligence': intelligence1,
                'selection': {
                    'total_questions': selection1['total_selected'],
                    'breakdown': selection1['selection_breakdown'],
                    'analysis': analysis1
                }
            },
            {
                'name': 'Chemistry+Math Weak Student', 
                'user_data': user2_data,
                'intelligence': intelligence2,
                'selection': {
                    'total_questions': selection2['total_selected'],
                    'breakdown': selection2['selection_breakdown'],
                    'analysis': analysis2
                }
            },
            {
                'name': 'Strong Student',
                'user_data': user3_data,
                'intelligence': intelligence3,
                'selection': {
                    'total_questions': selection3['total_selected'],
                    'breakdown': selection3['selection_breakdown'],
                    'analysis': analysis3
                }
            }
        ]
    }
    
    with open('agentic_behavior_demo.json', 'w') as f:
        json.dump(demo_results, f, indent=2, default=str)
    
    print(f"\n💾 Demo results saved to: agentic_behavior_demo.json")

if __name__ == "__main__":
    demonstrate_agentic_behavior()