import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import uuid
import os
import hashlib
from typing import List, Dict, Any, Optional
import logging
from models import Question

class VectorDBManager:
    def __init__(self, db_path: str = "./chroma_db"):
        """Initialize ChromaDB client and embedding model with optimized settings"""
        self.db_path = db_path

        # Enhanced ChromaDB settings for better performance and memory management
        # Using the new ChromaDB client configuration
        try:
            self.client = chromadb.PersistentClient(
                path=db_path
            )
        except Exception as e:
            # Fallback to basic client if persistent fails
            logging.warning(f"Persistent client failed, using basic client: {e}")
            self.client = chromadb.Client()

        # Initialize embedding model with caching for better performance
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')

        # Cache for embeddings to avoid recomputation
        self.embedding_cache = {}

        # Create collections for different exam types
        self.collections = {}
        self._initialize_collections()

        logging.info(f" Vector DB initialized successfully at {db_path}")
        logging.info(f" ChromaDB using persistent storage with memory optimization")

    def _initialize_collections(self):
        """Initialize collections for each exam type"""
        exam_types = ["JEE_MAIN", "JEE_ADVANCED", "NEET", "BITSAT"]

        for exam_type in exam_types:
            collection_name = f"questions_{exam_type.lower()}"
            try:
                self.collections[exam_type] = self.client.get_or_create_collection(
                    name=collection_name,
                    metadata={"exam_type": exam_type}
                )
                logging.info(f"Collection {collection_name} initialized")
            except Exception as e:
                logging.error(f"Error initializing collection {collection_name}: {e}")

    def add_question(self, question: Question) -> bool:
        """Add a single question to the vector database with caching"""
        try:
            # Handle both enum and string exam types
            exam_type_str = question.exam_type.value if hasattr(question.exam_type, 'value') else str(question.exam_type)

            collection = self.collections.get(exam_type_str)
            if not collection:
                logging.error(f"Collection not found for exam type: {exam_type_str}")
                return False

            # Check if question already exists to avoid duplicates
            try:
                existing = collection.get(ids=[question.id])
                if existing['ids']:
                    logging.info(f"Question {question.id} already exists, skipping")
                    return True
            except:
                pass # Question doesn't exist, continue

            # Create embedding with caching
            embedding = self._get_cached_embedding(question.question_text)

            # Prepare metadata - handle enum values
            difficulty_str = question.difficulty.value if hasattr(question.difficulty, 'value') else str(question.difficulty)

            metadata = {
                "subject": question.subject,
                "chapter": question.chapter,
                "topic": question.topic,
                "difficulty": difficulty_str,
                "marks": question.marks,
                "neg_marks": getattr(question, 'neg_marks', 1),
                "year": getattr(question, 'year', 2024)
            }

            # Add to collection
            collection.add(
                embeddings=[embedding],
                documents=[question.question_text],
                metadatas=[metadata],
                ids=[question.id]
            )

            logging.info(f" Added question {question.id} to vector DB")
            return True

        except Exception as e:
            logging.error(f" Error adding question to vector DB: {e}")
            return False

    def _get_cached_embedding(self, text: str) -> List[float]:
        """Get embedding with caching to improve performance"""
        # Create a hash of the text for caching
        import hashlib
        text_hash = hashlib.md5(text.encode()).hexdigest()

        if text_hash in self.embedding_cache:
            return self.embedding_cache[text_hash]

        # Generate new embedding
        embedding = self.embedder.encode(text).tolist()

        # Cache the embedding (limit cache size to prevent memory issues)
        if len(self.embedding_cache) < 10000: # Limit to 10k cached embeddings
            self.embedding_cache[text_hash] = embedding

        return embedding

    def add_questions_batch(self, questions: List[Question]) -> int:
        """Add multiple questions in batch"""
        success_count = 0

        # Group questions by exam type
        questions_by_exam = {}
        for question in questions:
            if question.exam_type not in questions_by_exam:
                questions_by_exam[question.exam_type] = []
            questions_by_exam[question.exam_type].append(question)

        # Process each exam type separately
        for exam_type, exam_questions in questions_by_exam.items():
            try:
                # Handle both enum and string exam types
                exam_type_str = exam_type.value if hasattr(exam_type, 'value') else str(exam_type)

                collection = self.collections.get(exam_type_str)
                if not collection:
                    logging.error(f"Collection not found for exam type: {exam_type_str}")
                    continue

                # Prepare batch data
                embeddings = []
                documents = []
                metadatas = []
                ids = []

                for question in exam_questions:
                    # Use cached embedding for better performance
                    embedding = self._get_cached_embedding(question.question_text)
                    embeddings.append(embedding)
                    documents.append(question.question_text)

                    # Handle enum values
                    difficulty_str = question.difficulty.value if hasattr(question.difficulty, 'value') else str(question.difficulty)

                    metadata = {
                        "subject": question.subject,
                        "chapter": question.chapter,
                        "topic": question.topic,
                        "difficulty": difficulty_str,
                        "marks": question.marks,
                        "neg_marks": getattr(question, 'neg_marks', 1),
                        "year": getattr(question, 'year', 2024)
                    }
                    metadatas.append(metadata)
                    ids.append(question.id)

                # Add batch to collection
                collection.add(
                    embeddings=embeddings,
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )

                success_count += len(exam_questions)
                logging.info(f"Added {len(exam_questions)} questions for {exam_type_str}")

            except Exception as e:
                logging.error(f"Error adding batch for {exam_type}: {e}")

        return success_count

    def search_questions(
        self,
        exam_type: str,
        query: str = None,
        n_results: int = 10,
        subject: str = None,
        topic: str = None,
        chapter: str = None,
        difficulty: str = None,
        exclude_ids: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Search for questions based on various criteria"""
        try:
            collection = self.collections.get(exam_type)
            if not collection:
                logging.error(f"Collection not found for exam type: {exam_type}")
                return []

            # Build where clause for filtering
            where_clause = {}
            if subject:
                where_clause["subject"] = subject
            if topic:
                where_clause["topic"] = topic
            if chapter:
                where_clause["chapter"] = chapter
            if difficulty:
                where_clause["difficulty"] = difficulty

            if query:
                # Semantic search with query
                query_embedding = self.embedder.encode(query).tolist()
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results * 2, # Get more results for filtering
                    where=where_clause if where_clause else None
                )
            else:
                # Get random questions matching criteria
                results = collection.get(
                    where=where_clause if where_clause else None,
                    limit=n_results * 2
                )

            # Process results
            questions = []
            if query:
                # Query results format
                for i in range(len(results['ids'][0])):
                    if exclude_ids and results['ids'][0][i] in exclude_ids:
                        continue

                    questions.append({
                        'question_id': results['ids'][0][i],
                        'content': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'distance': results['distances'][0][i] if 'distances' in results else 0
                    })
            else:
                # Get results format
                for i in range(len(results['ids'])):
                    if exclude_ids and results['ids'][i] in exclude_ids:
                        continue

                    questions.append({
                        'question_id': results['ids'][i],
                        'content': results['documents'][i],
                        'metadata': results['metadatas'][i],
                        'distance': 0
                    })

            return questions[:n_results]

        except Exception as e:
            logging.error(f"Error searching questions: {e}")
            return []

    def get_question_by_id(self, exam_type: str, question_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific question by ID"""
        try:
            collection = self.collections.get(exam_type)
            if not collection:
                return None

            result = collection.get(ids=[question_id])

            if result['ids']:
                return {
                    'question_id': result['ids'][0],
                    'content': result['documents'][0],
                    'metadata': result['metadatas'][0]
                }

            return None

        except Exception as e:
            logging.error(f"Error getting question by ID: {e}")
            return None

    def get_collection_stats(self, exam_type: str) -> Dict[str, Any]:
        """Get statistics for a collection"""
        try:
            collection = self.collections.get(exam_type)
            if not collection:
                return {}

            count = collection.count()

            # Get sample of metadata to analyze distribution
            sample = collection.get(limit=1000)

            stats = {
                "total_questions": count,
                "subjects": set(),
                "topics": set(),
                "chapters": set(),
                "difficulties": set()
            }

            for metadata in sample['metadatas']:
                stats["subjects"].add(metadata.get("subject", ""))
                stats["topics"].add(metadata.get("topic", ""))
                stats["chapters"].add(metadata.get("chapter", ""))
                stats["difficulties"].add(metadata.get("difficulty", ""))

            # Convert sets to lists for JSON serialization
            stats["subjects"] = list(stats["subjects"])
            stats["topics"] = list(stats["topics"])
            stats["chapters"] = list(stats["chapters"])
            stats["difficulties"] = list(stats["difficulties"])

            return stats

        except Exception as e:
            logging.error(f"Error getting collection stats: {e}")
            return {}

    def reset_collection(self, exam_type: str) -> bool:
        """Reset a specific collection"""
        try:
            collection_name = f"questions_{exam_type.lower()}"
            self.client.delete_collection(name=collection_name)
            self.collections[exam_type] = self.client.create_collection(
                name=collection_name,
                metadata={"exam_type": exam_type}
            )
            logging.info(f" Reset collection for {exam_type}")
            return True

        except Exception as e:
            logging.error(f" Error resetting collection: {e}")
            return False

    def get_memory_usage(self) -> Dict[str, Any]:
        """Get memory usage statistics"""
        try:
            import os
            import psutil

            # Get ChromaDB file size
            db_size = 0
            if os.path.exists(self.db_path):
                for root, dirs, files in os.walk(self.db_path):
                    for file in files:
                        db_size += os.path.getsize(os.path.join(root, file))

            # Get process memory usage
            process = psutil.Process()
            memory_info = process.memory_info()

            # Get collection counts
            collection_stats = {}
            total_questions = 0
            for exam_type, collection in self.collections.items():
                try:
                    count = collection.count()
                    collection_stats[exam_type] = count
                    total_questions += count
                except:
                    collection_stats[exam_type] = 0

            return {
                "database_size_mb": round(db_size / (1024 * 1024), 2),
                "process_memory_mb": round(memory_info.rss / (1024 * 1024), 2),
                "embedding_cache_size": len(self.embedding_cache),
                "total_questions": total_questions,
                "collections": collection_stats,
                "database_path": self.db_path
            }

        except Exception as e:
            logging.error(f"Error getting memory usage: {e}")
            return {"error": str(e)}

    def optimize_database(self) -> bool:
        """Optimize database performance and clean up"""
        try:
            # Clear embedding cache if it's getting too large
            if len(self.embedding_cache) > 5000:
                # Keep only the most recent 2500 embeddings
                cache_items = list(self.embedding_cache.items())
                self.embedding_cache = dict(cache_items[-2500:])
                logging.info(f"🧹 Cleaned embedding cache, kept 2500 most recent entries")

            logging.info(f"✨ Database optimization completed")
            return True

        except Exception as e:
            logging.error(f"Error optimizing database: {e}")
            return False
