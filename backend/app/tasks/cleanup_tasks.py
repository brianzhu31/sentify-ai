from app import app
from app.managers.article_manager import ArticleManager
from app.managers.user_manager import UserManager
from app.logger import logger
from pinecone import Pinecone
import time
import os

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=PINECONE_API_KEY)


def delete_old_articles_in_postgres():
    with app.app_context():
        deleted_article_count = ArticleManager.delete_old_articles(days=21)
    logger.info(f"Deleted {deleted_article_count} articles from postgres.")


def delete_old_articles_in_vector_db():
    index = pc.Index("company-info")

    days = 21
    cutoff_timestamp = int(time.time()) - (days * 24 * 60 * 60)

    old_vectors = index.query(
        filter={"published_date": {"$lt": cutoff_timestamp}},
        vector=[0] * 1536,
        top_k=10000,
        include_metadata=False,
        namespace="articles"
    )

    old_vector_ids = [vector["id"] for vector in old_vectors["matches"]]
    num_vectors = len(old_vector_ids)

    batch_size = 1000
    for i in range(0, num_vectors, batch_size):
        batch_ids = old_vector_ids[i:i + batch_size]
        index.delete(ids=batch_ids, namespace="articles")
        logger.info(f"Deleted batch of {len(batch_ids)} vectors.")

    logger.info(f"Deleted {num_vectors} vectors in total from the vector DB.")

def reset_user_message_counts():
    with app.app_context():
        UserManager.reset_all_user_message_counts()
    logger.info("Reset all user message counts to 0.")
