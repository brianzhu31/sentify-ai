from app.services.article import ArticleCollection
from app.services.company_analytics import CompanyAnalyticsEngine
from app.managers.company_manager import CompanyManager
from itertools import islice
from app.logger import logger
from app import app
import time

def batch_iterable(iterable, batch_size):
    iterator = iter(iterable)
    while batch := list(islice(iterator, batch_size)):
        yield batch

def process_articles():
    logger.info("Processing articles task started.")
    with app.app_context():
        article_collection = ArticleCollection()
        all_companies = CompanyManager.get_all_companies()
        tickers = [company.ticker for company in all_companies]
        
        batch_size = 80
        for batch in batch_iterable(tickers, batch_size):
            article_collection.fetch_articles(tickers=batch, days_ago=1)

            logger.info(f"Fetched {len(article_collection.articles)} relevant articles.")
            
            article_collection.summarize_articles()
            
            article_collection.save_articles()
            article_collection.embed_articles_to_vector_db()
    logger.info("Processing articles task finished.")


def update_company_analytics():
    logger.info("Updating company analytics task started.")
    with app.app_context():
        all_companies = CompanyManager.get_all_companies()
        tickers = [company.ticker for company in all_companies]
        companies_analyzer = CompanyAnalyticsEngine(tickers=tickers)
        companies_analyzer.generate_overall_summaries(time_period=14)
    logger.info("Updating company analytics task finished.")


def full_update():
    start_time = time.time()
    logger.info("Daily update task triggered.")

    process_articles()
    update_company_analytics()

    end_time = time.time()
    duration = end_time - start_time
    hours, remainder = divmod(duration, 3600)
    minutes, seconds = divmod(remainder, 60)

    logger.info(f"Daily update task finished in {int(hours)}:{int(minutes):02}:{int(seconds):02}")
