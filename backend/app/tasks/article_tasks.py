from services.article import ArticleCollection
from config import app

def process_articles():
    with app.app_context():
        print("running")
        # Initialize the ArticleCollection and fetch articles within the app context
        article_collection = ArticleCollection()
        article_collection.fetch_articles(tickers=["NVDA", "AAPL", "MSFT", "TSLA"], days_ago=7)

        # Now print the article titles
        for article in article_collection.articles:
            print(article.title)
            print()

        print(len(article_collection.articles))
        
        article_collection.summarize_articles()
        
        for article in article_collection.articles:
            print(article.title)
            print(article.compressed_summary)
            print(article.sentiment)
            print(article.impact)
            print("-----------------------------------------------------------")
        
        article_collection.save_articles()
        article_collection.embed_articles_to_vector_db()
