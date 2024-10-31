from services.article import ArticleCollection
from services.company_analytics import CompanyAnalyticsEngine
from managers.company_manager import CompanyManager
from config import app
from itertools import islice

def batch_iterable(iterable, batch_size):
    iterator = iter(iterable)
    while batch := list(islice(iterator, batch_size)):
        yield batch

def process_articles():
    with app.app_context():
        print("processing articles")
        article_collection = ArticleCollection()
        all_companies = CompanyManager.get_all_companies()
        tickers = [company.ticker for company in all_companies]
        
        batch_size = 125
        for batch in batch_iterable(tickers, batch_size):
            article_collection.fetch_articles(tickers=batch, days_ago=1)

            for article in article_collection.articles:
                print(article.title)
                print()

            print(len(article_collection.articles))
            
            article_collection.summarize_articles()
            
            article_collection.save_articles()
            article_collection.embed_articles_to_vector_db()


def update_company_analytics():
    with app.app_context():
        all_companies = CompanyManager.get_all_companies()
        tickers = [company.ticker for company in all_companies]
        companies_analyzer = CompanyAnalyticsEngine(tickers=tickers)
        companies_analyzer.generate_overall_summaries(time_period=14)


def full_update():
    process_articles()
    update_company_analytics()
