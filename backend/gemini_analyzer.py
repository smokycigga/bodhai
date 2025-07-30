"""
Gemini AI Test Analysis Service
Provides personalized test analysis using Google's Gemini AI
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class GeminiTestAnalyzer:
    def __init__(self):
        """Initialize Gemini AI with API key"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Gemini AI Test Analyzer initialized successfully")

    def analyze_test_results(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive personalized test analysis
        
        Args:
            user_data: Dictionary containing user's test results and performance data
            
        Returns:
            Dictionary with detailed analysis and recommendations
        """
        try:
            # Create analysis prompt
            prompt = self._create_analysis_prompt(user_data)
            
            logger.info(f"Generating Gemini analysis for user {user_data.get('user_id', 'unknown')}")
            logger.info(f"Prompt length: {len(prompt)} characters")
            
            # Generate analysis using Gemini with cross-platform timeout handling
            import threading
            import time
            
            response = None
            error = None
            
            def generate_content():
                nonlocal response, error
                try:
                    response = self.model.generate_content(prompt)
                except Exception as e:
                    error = e
            
            # Start the generation in a separate thread
            thread = threading.Thread(target=generate_content)
            thread.daemon = True
            thread.start()
            
            # Wait for completion or timeout (30 seconds)
            thread.join(timeout=50)
            
            if thread.is_alive():
                logger.error("Gemini API call timed out after 60 seconds")
                return self._get_fallback_analysis(user_data)
            
            if error:
                logger.error(f"Error in Gemini API call: {error}")
                return self._get_fallback_analysis(user_data)
            
            if not response or not response.text:
                logger.warning("Empty response from Gemini API")
                return self._get_fallback_analysis(user_data)
            
            # Parse and structure the response
            analysis = self._parse_gemini_response(response.text, user_data)
            
            logger.info(f"Successfully generated analysis for user {user_data.get('user_id', 'unknown')}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error generating Gemini analysis: {e}")
            return self._get_fallback_analysis(user_data)

    def _create_analysis_prompt(self, user_data: Dict[str, Any]) -> str:
        """Create detailed prompt for Gemini AI analysis"""
        
        # Extract key metrics
        test_results = user_data.get('test_results', {})
        subject_performance = user_data.get('subject_performance', {})
        chapter_performance = user_data.get('chapter_performance', {})
        user_profile = user_data.get('user_profile', {})
        
        # Extract test-specific context for focused analysis
        test_questions = user_data.get('test_questions', [])
        user_answers = user_data.get('user_answers', {})
        detailed_mistakes = user_data.get('detailed_mistakes', [])
        intelligence_insights = user_data.get('intelligence_insights', {})
        
        # Get topics/chapters actually tested
        tested_topics = set()
        tested_chapters = set()
        for question in test_questions:
            if question.get('topic'):
                tested_topics.add(question['topic'])
            if question.get('chapter'):
                tested_chapters.add(question['chapter'])
        
        # Filter subject_performance and chapter_performance to only include tested subjects/chapters
        tested_subjects = set()
        for question in test_questions:
            if question.get('subject'):
                tested_subjects.add(question['subject'])
        
        # Filter performance data to only include tested subjects/chapters
        filtered_subject_performance = {k: v for k, v in subject_performance.items() if k in tested_subjects}
        filtered_chapter_performance = {k: v for k, v in chapter_performance.items() if any(chapter in tested_chapters for chapter in [k])}
        
        # Get actual test questions and answers for detailed analysis
        test_questions = user_data.get('test_questions', [])
        user_answers = user_data.get('user_answers', {})
        
        # Create detailed question-by-question analysis
        question_analysis = []
        for i, question in enumerate(test_questions):
            user_answer = user_answers.get(str(i), '')
            correct_answer = question.get('correct_answer', '')
            is_correct = user_answer.upper() == correct_answer.upper() if user_answer and correct_answer else False
            
            question_analysis.append({
                'question_number': i + 1,
                'subject': question.get('subject', 'Unknown'),
                'chapter': question.get('chapter', 'Unknown'),
                'topic': question.get('topic', 'Unknown'),
                'question_text': question.get('content', '')[:200] + '...' if len(question.get('content', '')) > 200 else question.get('content', ''),
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'difficulty': question.get('difficulty', 'medium'),
                'explanation': question.get('explanation', '')[:150] + '...' if len(question.get('explanation', '')) > 150 else question.get('explanation', '')
            })

        prompt = f"""
You are an expert JEE tutor and educational analyst. A student just completed a {len(test_questions)}-question test and scored {test_results.get('score_percentage', 0):.1f}%. 

CRITICAL: Provide HIGHLY SPECIFIC, PERSONALIZED analysis based on the EXACT questions they got wrong and the topics they struggled with.

STUDENT PERFORMANCE SUMMARY:
- Total Questions: {test_results.get('total_questions', 0)}
- Correct: {test_results.get('correct_answers', 0)}
- Incorrect: {test_results.get('incorrect_answers', 0)}
- Unattempted: {test_results.get('unattempted_answers', 0)}
- Score: {test_results.get('score_percentage', 0):.1f}%

SUBJECTS TESTED: {list(tested_subjects)}
CHAPTERS COVERED: {list(tested_chapters)}
TOPICS TESTED: {list(tested_topics)}

DETAILED QUESTION-BY-QUESTION ANALYSIS:
{json.dumps(question_analysis, indent=2)}

SPECIFIC MISTAKES MADE:
{json.dumps(detailed_mistakes, indent=2)}

PERFORMANCE CONTEXT:
- Time taken: {intelligence_insights.get('time_taken', 0)} seconds
- Average time per question: {intelligence_insights.get('time_per_question', 0):.1f} seconds
- Student's test history: {user_profile.get('total_tests', 0)} tests taken
- Historical average: {user_profile.get('average_score', 0):.1f}%

INSTRUCTIONS FOR ANALYSIS:
1. Focus ONLY on the subjects/topics that were actually tested
2. Analyze each wrong answer to identify the specific concept gap
3. Provide targeted study recommendations for the exact topics they struggled with
4. Create a personalized study plan addressing their specific weaknesses
5. Be encouraging but honest about areas needing improvement

Provide a comprehensive analysis in the following JSON format:

{{
    "overall_performance": {{
        "score_percentage": {test_results.get('score_percentage', 0)},
        "performance_level": "<Excellent/Very Good/Good/Needs Improvement>",
        "rank_estimate": "<estimated rank range based on {test_results.get('score_percentage', 0):.1f}% score>",
        "summary": "<SPECIFIC 3-4 sentence summary mentioning exact score {test_results.get('correct_answers', 0)}/{test_results.get('total_questions', 0)}, subjects tested {list(tested_subjects)}, and key areas of strength/weakness>"
    }},
    "subject_analysis": {{
        {self._generate_subject_analysis_template(tested_subjects)}
    }},
    "error_analysis": {{
        "total_errors": {test_results.get('incorrect_answers', 0)},
        "error_patterns": [
            {{
                "pattern_type": "<Analyze the {test_results.get('incorrect_answers', 0)} wrong answers to identify if they're Conceptual/Calculation/Time Management/Careless errors>",
                "frequency": <number_of_questions_with_this_pattern>,
                "subjects_affected": {list(tested_subjects)},
                "description": "<SPECIFIC description based on the actual wrong answers in the question analysis above>",
                "root_cause": "<identified root cause from the specific questions they got wrong>",
                "fix_strategy": "<specific strategy targeting the exact topics they struggled with>"
            }}
        ],
        "critical_mistakes": [
            {{
                "question_number": <question_number_they_got_wrong>,
                "question_topic": "<exact topic from the question analysis>",
                "subject": "<subject from question analysis>",
                "chapter": "<chapter from question analysis>",
                "mistake_type": "<analyze their wrong answer vs correct answer>",
                "correct_approach": "<step-by-step method for this specific question type>",
                "why_wrong": "<explain why their specific answer was incorrect>",
                "practice_recommendation": "<specific practice for this exact topic/concept>"
            }}
        ],
        "improvement_priority": ["<highest priority topic based on wrong answers>", "<second priority>", "<third priority>"]
    }},
    "strengths_analysis": [
        "<strength1: specific topic/concept where student excelled>",
        "<strength2: another strong area with explanation>",
        "<strength3: consistent performance area>"
    ],
    "improvement_areas": [
        "<area1: specific weak topic with accuracy percentage>",
        "<area2: another improvement area with specific guidance>",
        "<area3: time management or conceptual gap>"
    ],
    "time_analysis": {{
        "total_time_spent": "{intelligence_insights.get('time_taken', 0)} seconds",
        "average_time_per_question": "{intelligence_insights.get('time_per_question', 0):.1f} seconds",
        "time_per_subject": {{
            "Physics": "<calculate from question analysis>",
            "Chemistry": "<calculate from question analysis>",
            "Mathematics": "<calculate from question analysis>"
        }},
        "speed_analysis": {{
            "fastest_subject": "<subject with lowest average time per question>",
            "slowest_subject": "<subject with highest average time per question>",
            "optimal_time_distribution": {{
                "Physics": "<recommended time based on question count>",
                "Chemistry": "<recommended time based on question count>",
                "Mathematics": "<recommended time based on question count>"
            }}
        }},
        "speed_distribution": {{
            "quick_questions": {{
                "count": <number of questions solved in <60 seconds>,
                "percentage": <percentage of total>,
                "subjects": ["<subjects where student was quick>"]
            }},
            "normal_questions": {{
                "count": <number of questions solved in 60-120 seconds>,
                "percentage": <percentage of total>,
                "subjects": ["<subjects with normal speed>"]
            }},
            "slow_questions": {{
                "count": <number of questions solved in >120 seconds>,
                "percentage": <percentage of total>,
                "subjects": ["<subjects where student was slow>"]
            }}
        }},
        "efficiency_insights": [
            "<specific insight about time management based on actual performance>",
            "<another insight about speed vs accuracy balance>",
            "<recommendation for time optimization>"
        ]
    }},
    "personalized_recommendations": {{
        "immediate_actions": [
            "<urgent action 1: specific topic to review today>",
            "<urgent action 2: practice type needed immediately>",
            "<urgent action 3: concept clarification needed>"
        ],
        "study_plan": {{
            "daily_schedule": {{
                "morning_session": {{
                    "duration": "<time in minutes>",
                    "focus": "<subject/topic>",
                    "activities": ["<activity1>", "<activity2>"],
                    "target": "<specific learning goal>"
                }},
                "afternoon_session": {{
                    "duration": "<time in minutes>",
                    "focus": "<subject/topic>",
                    "activities": ["<activity1>", "<activity2>"],
                    "target": "<specific learning goal>"
                }},
                "evening_session": {{
                    "duration": "<time in minutes>",
                    "focus": "<revision/practice>",
                    "activities": ["<activity1>", "<activity2>"],
                    "target": "<specific learning goal>"
                }}
            }},
            "weekly_plan": {{
                "week_1": {{
                    "primary_focus": "<main weak area to tackle>",
                    "daily_topics": ["<day1_topic>", "<day2_topic>", "<day3_topic>", "<day4_topic>", "<day5_topic>", "<day6_topic>", "<day7_topic>"],
                    "practice_questions": <number_per_day>,
                    "revision_topics": ["<topic1>", "<topic2>"],
                    "target_improvement": "<specific measurable goal>",
                    "success_metric": "<how to measure progress>"
                }},
                "week_2": {{
                    "primary_focus": "<next priority area>",
                    "daily_topics": ["<day1_topic>", "<day2_topic>", "<day3_topic>", "<day4_topic>", "<day5_topic>", "<day6_topic>", "<day7_topic>"],
                    "practice_questions": <number_per_day>,
                    "revision_topics": ["<topic1>", "<topic2>"],
                    "target_improvement": "<specific measurable goal>",
                    "success_metric": "<how to measure progress>"
                }},
                "week_3": {{
                    "primary_focus": "<integration and mixed practice>",
                    "daily_topics": ["<day1_topic>", "<day2_topic>", "<day3_topic>", "<day4_topic>", "<day5_topic>", "<day6_topic>", "<day7_topic>"],
                    "practice_questions": <number_per_day>,
                    "revision_topics": ["<topic1>", "<topic2>"],
                    "target_improvement": "<specific measurable goal>",
                    "success_metric": "<how to measure progress>"
                }},
                "week_4": {{
                    "primary_focus": "<mock tests and final revision>",
                    "daily_topics": ["<day1_topic>", "<day2_topic>", "<day3_topic>", "<day4_topic>", "<day5_topic>", "<day6_topic>", "<day7_topic>"],
                    "practice_questions": <number_per_day>,
                    "revision_topics": ["<topic1>", "<topic2>"],
                    "target_improvement": "<specific measurable goal>",
                    "success_metric": "<how to measure progress>"
                }}
            }},
            "resource_recommendations": [
                {{
                    "subject": "<subject>",
                    "topic": "<specific topic>",
                    "resource_type": "<Book/Video/Practice/Notes>",
                    "specific_resource": "<exact book chapter/video link/practice set>",
                    "why_recommended": "<reason this resource fits student's need>",
                    "how_to_use": "<specific instructions for using this resource>"
                }}
            ]
        }},
        "goal_setting": {{
            "short_term_goals": [
                "<1 week goal with specific target>",
                "<2 week goal with measurable outcome>",
                "<1 month goal with clear metric>"
            ],
            "accuracy_targets": {{
                "current_weak_topics": "<target percentage for improvement>",
                "overall_accuracy": "<target percentage for next test>",
                "subject_wise_targets": {{
                    "Physics": "<target percentage>",
                    "Chemistry": "<target percentage>",
                    "Mathematics": "<target percentage>"
                }}
            }},
            "time_management_goals": {{
                "average_time_per_question": "<target time in seconds>",
                "subject_time_allocation": {{
                    "Physics": "<recommended time percentage>",
                    "Chemistry": "<recommended time percentage>",
                    "Mathematics": "<recommended time percentage>"
                }}
            }}
        }}
    }},
    "motivational_insights": {{
        "positive_highlights": ["<highlight1>", "<highlight2>"],
        "progress_indicators": ["<indicator1>", "<indicator2>"],
        "encouragement_message": "<personalized encouraging message>",
        "success_tips": ["<tip1>", "<tip2>", "<tip3>"]
    }},
    "next_steps": {{
        "immediate_review": [
            {{
                "topic": "<specific topic to review today>",
                "subject": "<subject>",
                "priority": "<High/Medium/Low>",
                "estimated_time": "<time in minutes>",
                "resources": ["<specific resource1>", "<specific resource2>"]
            }}
        ],
        "practice_recommendations": [
            {{
                "type": "<Mock Test/Chapter Practice/Topic Drill>",
                "focus": "<specific area>",
                "difficulty": "<Easy/Medium/Hard>",
                "duration": "<time>",
                "frequency": "<daily/weekly>",
                "success_metric": "<how to measure improvement>"
            }}
        ],
        "retake_suggestions": {{
            "recommended_timing": "<when to retake - specific timeframe>",
            "preparation_needed": ["<preparation1>", "<preparation2>"],
            "expected_improvement": "<realistic score improvement>",
            "focus_areas": ["<area1>", "<area2>"]
        }},
        "goal_setting": {{
            "next_test_targets": {{
                "overall_accuracy": "<target percentage based on current {test_results.get('score_percentage', 0):.1f}%>",
                "time_per_question": "<target time in seconds>",
                "subject_wise_goals": {{
                    "Physics": "<specific target>",
                    "Chemistry": "<specific target>",
                    "Mathematics": "<specific target>"
                }}
            }},
            "monthly_goals": {{
                "accuracy_improvement": "<percentage points to improve>",
                "rank_target": "<realistic rank range>",
                "weak_topics_to_master": ["<topic1>", "<topic2>", "<topic3>"]
            }}
        }}
    }}
}}

IMPORTANT GUIDELINES:
1. Be specific and actionable in all recommendations
2. Use encouraging and motivational language
3. Provide realistic and achievable goals
4. Focus on both strengths and improvement areas
5. Consider the student's current level and progress
6. Make recommendations practical for JEE preparation
7. Include specific chapter/topic names from JEE syllabus
8. Provide time-bound action plans
9. Be empathetic and supportive in tone
10. Ensure all numerical values are realistic and based on the data provided

Respond ONLY with the JSON format requested above, no additional text.
"""
        
        return prompt

    def _generate_subject_analysis_template(self, tested_subjects: set) -> str:
        """Generate dynamic subject analysis template for only tested subjects"""
        if not tested_subjects:
            return ''
        
        subject_templates = []
        for subject in tested_subjects:
            template = f'''"{subject}": {{
                "accuracy_percentage": <calculate from the question analysis above>,
                "total_questions": <count from question analysis>,
                "correct_answers": <count correct from question analysis>,
                "attempted_questions": <count attempted from question analysis>,
                "difficulty_breakdown": {{
                    "easy": {{
                        "total": <count easy questions in this subject>,
                        "correct": <count correct easy questions>,
                        "accuracy": <percentage for easy questions>
                    }},
                    "medium": {{
                        "total": <count medium questions in this subject>,
                        "correct": <count correct medium questions>,
                        "accuracy": <percentage for medium questions>
                    }},
                    "hard": {{
                        "total": <count hard questions in this subject>,
                        "correct": <count correct hard questions>,
                        "accuracy": <percentage for hard questions>
                    }}
                }},
                "chapter_breakdown": [
                    {{
                        "chapter": "<actual chapter name from questions>",
                        "accuracy": <percentage for this chapter>,
                        "questions_count": <number of questions from this chapter>,
                        "topics_covered": ["<topic1>", "<topic2>"],
                        "performance": "<Strong/Average/Weak based on accuracy>"
                    }}
                ],
                "key_insights": [
                    "<specific insight about their {subject} performance>",
                    "<another specific insight based on their answers>",
                    "<third insight about their strengths/weaknesses in {subject}>"
                ],
                "improvement_areas": [
                    "<specific {subject} topic they need to work on>",
                    "<another specific area for improvement>"
                ],
                "specific_recommendations": [
                    "<targeted recommendation for {subject} based on their mistakes>",
                    "<another specific recommendation for this subject>"
                ]
            }}'''
            subject_templates.append(template)
        
        return ',\\n'.join(subject_templates)

    def _parse_gemini_response(self, response_text: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and validate Gemini response"""
        try:
            # Clean the response text
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Parse JSON
            analysis = json.loads(response_text)
            
            # Add metadata
            analysis['analysis_metadata'] = {
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'user_id': user_data.get('user_id'),
                'test_id': user_data.get('test_id'),
                'ai_model': 'gemini-2.5-flash',
                'analysis_version': '1.0'
            }
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response: {e}")
            return self._get_fallback_analysis(user_data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {e}")
            return self._get_fallback_analysis(user_data)

    def _get_fallback_analysis(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide fallback analysis when Gemini fails"""
        test_results = user_data.get('test_results', {})
        
        return {
            "overall_performance": {
                "score_percentage": test_results.get('score_percentage', 0),
                "performance_level": "Good",
                "rank_estimate": "Analysis in progress",
                "summary": "Your test performance is being analyzed. Please check back shortly for detailed insights."
            },
            "subject_analysis": {
                "Physics": {
                    "accuracy": test_results.get('physics_accuracy', 0),
                    "recommendations": ["Focus on conceptual understanding", "Practice more numerical problems"]
                },
                "Chemistry": {
                    "accuracy": test_results.get('chemistry_accuracy', 0),
                    "recommendations": ["Review organic reactions", "Practice inorganic nomenclature"]
                },
                "Mathematics": {
                    "accuracy": test_results.get('math_accuracy', 0),
                    "recommendations": ["Strengthen calculus concepts", "Practice coordinate geometry"]
                }
            },
            "analysis_metadata": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "user_id": user_data.get('user_id'),
                "test_id": user_data.get('test_id'),
                "ai_model": 'fallback',
                "analysis_version": '1.0',
                "note": "Detailed AI analysis will be available shortly"
            }
        }

    def generate_improvement_plan(self, analysis: Dict[str, Any], user_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate detailed improvement plan based on analysis"""
        try:
            preferences = user_preferences or {}
            
            prompt = f"""
Based on the following test analysis, create a detailed 30-day improvement plan:

ANALYSIS DATA:
{json.dumps(analysis, indent=2)}

USER PREFERENCES:
- Study hours per day: {preferences.get('daily_study_hours', 4)}
- Preferred study time: {preferences.get('preferred_time', 'Evening')}
- Weak areas focus: {preferences.get('focus_weak_areas', True)}
- Target exam date: {preferences.get('target_exam_date', 'Not specified')}

Create a JSON response with a detailed 30-day plan including daily tasks, weekly goals, and progress tracking.
"""
            
            response = self.model.generate_content(prompt)
            
            # Parse response
            plan_text = response.text.strip()
            if plan_text.startswith('```json'):
                plan_text = plan_text[7:-3]
            
            improvement_plan = json.loads(plan_text)
            
            return improvement_plan
            
        except Exception as e:
            logger.error(f"Error generating improvement plan: {e}")
            return {"error": "Unable to generate improvement plan at this time"}

    def get_motivational_message(self, user_performance: Dict[str, Any]) -> str:
        """Generate personalized motivational message"""
        try:
            prompt = f"""
Generate a short, encouraging motivational message (2-3 sentences) for a JEE aspirant based on their performance:

Performance Data: {json.dumps(user_performance, indent=2)}

The message should be:
1. Encouraging and positive
2. Specific to their performance
3. Motivating for continued effort
4. Professional yet warm in tone

Respond with just the motivational message, no additional formatting.
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating motivational message: {e}")
            return "Keep pushing forward! Every practice session brings you closer to your JEE goals. Your dedication will pay off!"