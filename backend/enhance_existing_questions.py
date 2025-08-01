#!/usr/bin/env python3
"""
Script to enhance existing questions with proper type classification
This will analyze existing questions and add enhanced type metadata
"""

import os
import json
import sys
from question_types import QuestionTypeDetector, QuestionTypeEnhancer, QuestionType

def enhance_questions_in_folder(folder_path, exam_type):
    """Enhance all questions in a specific exam folder"""
    enhanced_count = 0
    total_count = 0
    
    print(f"\n🔍 Processing {exam_type} questions in {folder_path}")
    
    if not os.path.exists(folder_path):
        print(f"❌ Folder {folder_path} does not exist")
        return 0, 0
    
    for filename in os.listdir(folder_path):
        if not filename.endswith('.json'):
            continue
            
        file_path = os.path.join(folder_path, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle different JSON structures
            modified = False
            
            if isinstance(data, list):
                for item in data:
                    if 'questions' in item:
                        for question in item['questions']:
                            total_count += 1
                            
                            # Enhance question with type detection
                            enhanced_question = QuestionTypeEnhancer.enhance_question(question)
                            
                            # Update the question in place
                            question.update(enhanced_question)
                            enhanced_count += 1
                            modified = True
            
            # Save back to file if modified
            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
    
    return enhanced_count, total_count

def analyze_question_types(folder_path):
    """Analyze and report question types in a folder"""
    type_counts = {}
    total_questions = 0
    
    if not os.path.exists(folder_path):
        return type_counts, total_questions
    
    for filename in os.listdir(folder_path):
        if not filename.endswith('.json'):
            continue
            
        file_path = os.path.join(folder_path, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, list):
                for item in data:
                    if 'questions' in item:
                        for question in item['questions']:
                            total_questions += 1
                            
                            # Detect question type
                            question_type = QuestionTypeDetector.detect_question_type(question)
                            type_name = question_type.value
                            
                            if type_name not in type_counts:
                                type_counts[type_name] = 0
                            type_counts[type_name] += 1
                            
        except Exception as e:
            print(f"❌ Error analyzing {filename}: {e}")
    
    return type_counts, total_questions

def main():
    """Main function to enhance all questions"""
    print("🚀 Starting Question Type Enhancement Process")
    print("=" * 60)
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    pyqs_folder = os.path.join(backend_dir, "pyqs")
    
    if not os.path.exists(pyqs_folder):
        print(f"❌ PYQS folder not found at {pyqs_folder}")
        return
    
    # Define exam folders
    exam_folders = {
        'jee_main': 'JEE_MAIN',
        'jee_advanced': 'JEE_ADVANCED', 
        'neet': 'NEET',
        'bitsat': 'BITSAT',
        'other_engineering': 'OTHER_ENGINEERING'
    }
    
    total_enhanced = 0
    total_questions = 0
    
    # First, analyze current question types
    print("\n📊 CURRENT QUESTION TYPE ANALYSIS")
    print("-" * 40)
    
    for folder_name, exam_type in exam_folders.items():
        folder_path = os.path.join(pyqs_folder, folder_name)
        type_counts, question_count = analyze_question_types(folder_path)
        
        if question_count > 0:
            print(f"\n{exam_type} ({question_count} questions):")
            for qtype, count in sorted(type_counts.items()):
                percentage = (count / question_count) * 100
                print(f"  • {qtype.upper()}: {count} ({percentage:.1f}%)")
    
    # Ask user if they want to proceed with enhancement
    print("\n" + "=" * 60)
    response = input("🤔 Do you want to enhance all questions with type metadata? (y/N): ")
    
    if response.lower() != 'y':
        print("❌ Enhancement cancelled by user")
        return
    
    # Enhance questions in each folder
    print("\n🔧 ENHANCING QUESTIONS")
    print("-" * 40)
    
    for folder_name, exam_type in exam_folders.items():
        folder_path = os.path.join(pyqs_folder, folder_name)
        enhanced, total = enhance_questions_in_folder(folder_path, exam_type)
        
        total_enhanced += enhanced
        total_questions += total
        
        if total > 0:
            print(f"✅ {exam_type}: Enhanced {enhanced}/{total} questions")
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 ENHANCEMENT COMPLETE!")
    print(f"📈 Total Questions Enhanced: {total_enhanced}/{total_questions}")
    
    if total_enhanced > 0:
        print("\n✨ Enhanced Features Added:")
        print("  • Automatic question type detection")
        print("  • Type-specific marking schemes")
        print("  • Enhanced evaluation logic")
        print("  • Frontend component selection")
        
        print("\n🎯 Supported Question Types:")
        for qtype in QuestionType:
            print(f"  • {qtype.value.upper()}: {qtype.name}")
    
    print("\n🚀 Your system now supports multiple question types!")
    print("   Restart your backend server to see the changes.")

if __name__ == "__main__":
    main()