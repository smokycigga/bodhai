#!/usr/bin/env python3
"""
ChromaDB Management Script
Provides utilities for managing the ChromaDB vector database
"""

import sys
import os
from vector_db import VectorDBManager
from json_ingestion import JSONIngestion
from dotenv import load_dotenv

load_dotenv()

def print_header(title):
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def show_health():
    """Show ChromaDB health status"""
    print_header("ChromaDB Health Status")

    try:
        vector_db = VectorDBManager()

        # Get health status
        health = vector_db.get_database_health()
        memory = vector_db.get_memory_usage()

        print(f" Database Status: {health['status'].upper()}")
        print(f" Database Path: {memory.get('database_path', 'Unknown')}")
        print(f" Database Size: {memory.get('database_size_mb', 0)} MB")
        print(f"🧠 Process Memory: {memory.get('process_memory_mb', 0)} MB")
        print(f" Embedding Cache: {memory.get('embedding_cache_size', 0)} entries")

        print(f"\n Collections Status:")
        collections = memory.get('collections', {})
        total_questions = 0
        for exam_type, count in collections.items():
            print(f" {exam_type:<12}: {count:>6} questions")
            total_questions += count

        print(f"\n Total Questions: {total_questions}")

        # Show issues if any
        issues = health.get('issues', [])
        if issues:
            print(f"\n Issues Found ({len(issues)}):")
            for i, issue in enumerate(issues, 1):
                print(f" {i}. {issue}")
        else:
            print(f"\n No issues found!")

    except Exception as e:
        print(f" Error checking health: {e}")

def show_stats():
    """Show detailed ChromaDB statistics"""
    print_header("ChromaDB Statistics")

    try:
        vector_db = VectorDBManager()

        for exam_type in ["JEE_MAIN", "JEE_ADVANCED", "NEET", "BITSAT"]:
            print(f"\n {exam_type}:")
            stats = vector_db.get_collection_stats(exam_type)

            if stats:
                print(f" Total Questions: {stats.get('total_questions', 0)}")
                print(f" Subjects: {len(stats.get('subjects', []))}")
                print(f" Topics: {len(stats.get('topics', []))}")
                print(f" Chapters: {len(stats.get('chapters', []))}")
                print(f" Difficulties: {stats.get('difficulties', [])}")

                # Show top subjects
                subjects = stats.get('subjects', [])[:5]
                if subjects:
                    print(f" Top Subjects: {', '.join(subjects)}")
            else:
                print(f" No data or collection not found")

    except Exception as e:
        print(f" Error getting stats: {e}")

def optimize_db():
    """Optimize ChromaDB performance"""
    print_header("ChromaDB Optimization")

    try:
        vector_db = VectorDBManager()

        print("🧹 Starting database optimization...")

        # Get memory usage before
        memory_before = vector_db.get_memory_usage()
        print(f" Memory before: {memory_before.get('process_memory_mb', 0)} MB")
        print(f" Cache before: {memory_before.get('embedding_cache_size', 0)} entries")

        # Optimize
        success = vector_db.optimize_database()

        if success:
            # Get memory usage after
            memory_after = vector_db.get_memory_usage()
            print(f" Memory after: {memory_after.get('process_memory_mb', 0)} MB")
            print(f" Cache after: {memory_after.get('embedding_cache_size', 0)} entries")

            memory_saved = memory_before.get('process_memory_mb', 0) - memory_after.get('process_memory_mb', 0)
            cache_cleaned = memory_before.get('embedding_cache_size', 0) - memory_after.get('embedding_cache_size', 0)

            print(f" Optimization completed!")
            print(f" Memory saved: {memory_saved:.1f} MB")
            print(f" Cache entries cleaned: {cache_cleaned}")
        else:
            print(f" Optimization failed")

    except Exception as e:
        print(f" Error optimizing database: {e}")

def reset_collection(exam_type):
    """Reset a specific collection"""
    print_header(f"Reset Collection: {exam_type}")

    try:
        vector_db = VectorDBManager()

        # Confirm reset
        response = input(f" Are you sure you want to reset {exam_type} collection? (yes/no): ")
        if response.lower() != 'yes':
            print(" Reset cancelled")
            return

        print(f" Resetting {exam_type} collection...")
        success = vector_db.reset_collection(exam_type)

        if success:
            print(f" Collection {exam_type} reset successfully")
        else:
            print(f" Failed to reset collection {exam_type}")

    except Exception as e:
        print(f" Error resetting collection: {e}")

def reingest_data():
    """Re-ingest all PYQ data"""
    print_header("Re-ingest PYQ Data")

    try:
        # Confirm re-ingestion
        response = input(" This will re-process all PYQ files. Continue? (yes/no): ")
        if response.lower() != 'yes':
            print(" Re-ingestion cancelled")
            return

        mongo_uri = os.getenv('MONGODB_URI')
        if not mongo_uri:
            print(" MONGODB_URI not found in environment")
            return

        print(" Starting PYQ data re-ingestion...")
        json_ingestor = JSONIngestion(mongo_uri)

        # Run ingestion
        stats = json_ingestor.ingest_all_files()

        print(f" Re-ingestion completed!")
        print(f" Files processed: {stats.get('processed_files', 0)}")
        print(f" Questions ingested: {stats.get('total_questions', 0)}")

        # Show breakdown
        by_exam = stats.get('by_exam_type', {})
        for exam_type, count in by_exam.items():
            print(f" {exam_type}: {count} questions")

    except Exception as e:
        print(f" Error re-ingesting data: {e}")

def show_help():
    """Show help information"""
    print_header("ChromaDB Management Help")

    print("Available commands:")
    print(" health - Show ChromaDB health status")
    print(" stats - Show detailed statistics")
    print(" optimize - Optimize database performance")
    print(" reset - Reset a specific collection")
    print(" reingest - Re-ingest all PYQ data")
    print(" help - Show this help message")

    print("\nUsage examples:")
    print(" python manage_chromadb.py health")
    print(" python manage_chromadb.py stats")
    print(" python manage_chromadb.py reset JEE_MAIN")
    print(" python manage_chromadb.py optimize")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        show_help()
        return

    command = sys.argv[1].lower()

    if command == "health":
        show_health()
    elif command == "stats":
        show_stats()
    elif command == "optimize":
        optimize_db()
    elif command == "reset":
        if len(sys.argv) < 3:
            print(" Please specify exam type: JEE_MAIN, JEE_ADVANCED, NEET, or BITSAT")
            return
        exam_type = sys.argv[2].upper()
        if exam_type not in ["JEE_MAIN", "JEE_ADVANCED", "NEET", "BITSAT"]:
            print(" Invalid exam type. Use: JEE_MAIN, JEE_ADVANCED, NEET, or BITSAT")
            return
        reset_collection(exam_type)
    elif command == "reingest":
        reingest_data()
    elif command == "help":
        show_help()
    else:
        print(f" Unknown command: {command}")
        show_help()

if __name__ == "__main__":
    main()