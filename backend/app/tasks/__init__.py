from app.logger import logger
from app.tasks.inference_tasks import process_articles, update_company_analytics
from app.tasks.cleanup_tasks import delete_old_articles_in_postgres, delete_old_articles_in_vector_db, reset_user_message_counts
import time

def full_update():
    start_time = time.time()
    logger.info("Daily update task triggered.")

    process_articles()
    update_company_analytics()
    delete_old_articles_in_postgres()
    delete_old_articles_in_vector_db()
    reset_user_message_counts()

    end_time = time.time()
    duration = end_time - start_time
    hours, remainder = divmod(duration, 3600)
    minutes, seconds = divmod(remainder, 60)

    logger.info(f"Daily update task finished in {int(hours)}:{int(minutes):02}:{int(seconds):02}")
