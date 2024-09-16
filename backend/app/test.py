from entities.article import Article, ArticleCollection
import json
import time

articles_data = []
file_path = "./raw_news_data.json"
with open(file_path, "r") as file:
    articles_data = json.load(file)

articles = []
for article_data in articles_data["articles"]:
    article = Article(
        title=article_data["title"],
        content=article_data["summary"],
        url=article_data["link"],
        media=article_data["media"],
        published_date=article_data["published_date"],
        clean_url=article_data["clean_url"]
    )
    articles.append(article)

start_time = time.time()

article_collection = ArticleCollection("Nvidia", articles)

output = article_collection.full_analysis()

end_time = time.time()

print(output)

# article_collection.filter_articles()

# print(f"length after filter {len(article_collection.relevant_articles)}")

# article_collection.summarize_articles()

# article_collection.generate_sentiment_summaries()

# print("summarized")

# end_time = time.time()

# print(article_collection.overall_summary)
# print()

# for summary_point in article_collection.positive_summaries:
#     print(summary_point.value)
#     print(summary_point.source_article.title)
#     print(summary_point.source_article.url)
#     print("-----------------------------------------------------------------------------")

# for summary_point in article_collection.negative_summaries:
#     print(summary_point.value)
#     print(summary_point.source_article.title)
#     print(summary_point.source_article.url)
#     print("-----------------------------------------------------------------------------")

# print(article_collection.score)

print(end_time - start_time)
