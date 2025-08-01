#!/usr/bin/env python3
"""
Correct Classification Script
Only moves files that explicitly have biology as subject field
"""

import os
import json
import shutil
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def has_biology_subject(file_path):
    """
    Check if file has biology/botany/zoology as explicit subject
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        biology_subjects = []
        
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and 'questions' in item:
                    questions = item['questions']
                    for question in questions:
                        subject = question.get('subject', '').lower().strip()
                        if subject in ['biology', 'botany', 'zoology']:
                            biology_subjects.append(subject)
                            
        return len(biology_subjects) > 0, biology_subjects
        
    except Exception as e:
        logger.error(f"Error analyzing {file_path}: {e}")
        return False, []

def get_exam_classification(file_path):
    """
    Classify exam based on subjects and marking scheme
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        subjects = set()
        marking_schemes = []
        
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and 'questions' in item:
                    questions = item['questions']
                    for question in questions:
                        # Collect subjects
                        subject = question.get('subject', '').lower().strip()
                        if subject:
                            subjects.add(subject)
                        
                        # Collect marking schemes
                        marks = question.get('marks', 0)
                        neg_marks = question.get('negMarks', 0)
                        if marks and neg_marks:
                            marking_schemes.append((marks, neg_marks))
        
        # Classification logic
        has_biology = any(subj in ['biology', 'botany', 'zoology'] for subj in subjects)
        has_physics = 'physics' in subjects
        has_chemistry = 'chemistry' in subjects
        has_mathematics = 'mathematics' in subjects
        
        # If has biology, it's NEET
        if has_biology:
            return 'neet'
        
        # If has physics, chemistry, mathematics (but no biology), it's JEE
        if has_physics and has_chemistry and has_mathematics:
            return 'jee_main'  # Default to main, can be refined later
        
        # Check for BITSAT indicators
        content_text = json.dumps(data).lower()
        if 'bitsat' in content_text or 'bits pilani' in content_text:
            return 'bitsat'
        
        return 'uncategorized'
        
    except Exception as e:
        logger.error(f"Error classifying {file_path}: {e}")
        return 'uncategorized'

def reorganize_files():
    """
    Move all files back to main pyqs folder and reclassify properly
    """
    pyqs_dir = Path("pyqs")
    
    if not pyqs_dir.exists():
        logger.error("PYQS directory not found!")
        return
    
    # First, move all files back to main pyqs directory
    logger.info("Moving all files back to main pyqs directory...")
    
    subfolders = ['jee_main', 'jee_advanced', 'neet', 'bitsat', 'other_engineering', 'uncategorized']
    
    for subfolder in subfolders:
        subfolder_path = pyqs_dir / subfolder
        if subfolder_path.exists():
            json_files = list(subfolder_path.glob("*.json"))
            for file_path in json_files:
                destination = pyqs_dir / file_path.name
                shutil.move(str(file_path), str(destination))
                logger.info(f"Moved {file_path.name} back to main directory")
    
    # Now classify properly
    logger.info("Starting proper classification...")
    
    # Create exam-specific directories
    exam_dirs = {
        'jee_main': pyqs_dir / 'jee_main',
        'jee_advanced': pyqs_dir / 'jee_advanced', 
        'neet': pyqs_dir / 'neet',
        'bitsat': pyqs_dir / 'bitsat',
        'other_engineering': pyqs_dir / 'other_engineering',
        'uncategorized': pyqs_dir / 'uncategorized'
    }
    
    for exam_dir in exam_dirs.values():
        exam_dir.mkdir(exist_ok=True)
    
    # Get all JSON files in main directory
    json_files = list(pyqs_dir.glob("*.json"))
    
    classification_counts = {
        'jee_main': 0,
        'jee_advanced': 0,
        'neet': 0,
        'bitsat': 0,
        'other_engineering': 0,
        'uncategorized': 0
    }
    
    biology_files = []
    
    for file_path in json_files:
        exam_type = get_exam_classification(file_path)
        classification_counts[exam_type] += 1
        
        # Check if it has biology subject
        has_bio, bio_subjects = has_biology_subject(file_path)
        if has_bio:
            biology_files.append({
                'file': file_path.name,
                'subjects': bio_subjects
            })
        
        # Move file to appropriate directory
        destination = exam_dirs[exam_type] / file_path.name
        shutil.move(str(file_path), str(destination))
        
        logger.info(f"Classified {file_path.name} as {exam_type}")
    
    # Generate report
    logger.info("\n" + "="*60)
    logger.info("CORRECT CLASSIFICATION REPORT")
    logger.info("="*60)
    
    for exam_type, count in classification_counts.items():
        logger.info(f"{exam_type.upper()}: {count} files")
    
    logger.info(f"\nFiles with explicit biology subjects: {len(biology_files)}")
    for bio_file in biology_files[:10]:  # Show first 10
        logger.info(f"  - {bio_file['file']}: {bio_file['subjects']}")
    
    logger.info("="*60)
    logger.info("Classification complete!")

if __name__ == "__main__":
    reorganize_files()