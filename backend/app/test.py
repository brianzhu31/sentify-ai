# from services.article import ArticleCollection
# from config import app

# with app.app_context():
#     # Initialize the ArticleCollection and fetch articles within the app context
#     article_collection = ArticleCollection()
#     article_collection.fetch_articles(tickers=["NVDA", "AAPL", "MSFT"])

#     # Now print the article titles
#     for article in article_collection.articles:
#         print(article.title)
#         print()

#     print(len(article_collection.articles))
    
#     article_collection.summarize_articles()
    
#     for article in article_collection.articles:
#         print(article.title)
#         print(article.compressed_summary)
#         print(article.sentiment)
#         print(article.impact)
#         print("-----------------------------------------------------------")
    
#     article_collection.save_articles()
#     article_collection.embed_articles_to_vector_db()



# from pinecone import Pinecone
# import os
# from dotenv import load_dotenv
# import numpy as np
# from datetime import datetime

# load_dotenv(".env.local")

# PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
# pc = Pinecone(api_key=PINECONE_API_KEY)

# def get_ids_from_query(index, input_vector, namespace):
#     # Simulating query logic
#     query_result = index.query(
#         vector=input_vector, 
#         top_k=1000,  # Adjust top_k based on index limits
#         namespace=namespace,
#         include_metadata=False
#     )
#     return [item['id'] for item in query_result['matches']]

# def get_all_ids_from_namespace(index, num_dimensions, namespace):
#     # Get index statistics
#     stats = index.describe_index_stats()
    
#     # Check if the namespace exists
#     if namespace not in stats['namespaces']:
#         print(f"Namespace {namespace} not found in index.")
#         return None
    
#     # Get the total number of vectors in the namespace
#     num_vectors = stats['namespaces'][namespace]['vector_count']
#     print(f"Namespace {namespace} contains {num_vectors} vectors.")
    
#     all_ids = set()
    
#     # Keep querying the index until we get all vector IDs
#     while len(all_ids) < num_vectors:
#         print("Length of ids list is shorter than the number of total vectors...")
        
#         # Create a random vector for querying
#         input_vector = np.random.rand(num_dimensions).tolist()  # or [0.5] * num_dimensions for a fixed vector
#         print("Creating random vector...")
        
#         # Query the index to get the vector IDs
#         ids = get_ids_from_query(index, input_vector, namespace)
#         print(f"Getting ids from a vector query of {namespace}...")
        
#         # Add the new IDs to the set
#         all_ids.update(ids)
#         print("Updating ids set...")
#         print(f"Collected {len(all_ids)} ids out of {num_vectors}.")
    
#     return all_ids

# index = pc.Index("company-info")
# all_ids = list(get_all_ids_from_namespace(index, 1536, "articles"))
# # print(all_ids)s

# def convert_to_unix(timestamp_str):
#     # Define the format of the input timestamp string
#     time_format = "%Y-%m-%d %H:%M:%S"
    
#     # Convert the timestamp string to a datetime object
#     dt_obj = datetime.strptime(timestamp_str, time_format)
    
#     # Convert the datetime object to a Unix timestamp (assuming UTC)
#     unix_timestamp = int(dt_obj.timestamp())
    
#     return unix_timestamp


# all_articles = index.fetch(ids=all_ids, namespace="articles")

# for article_id in all_ids:
#     print(all_articles["vectors"][article_id]["metadata"])
    
#     article_metadata = all_articles["vectors"][article_id]["metadata"]
#     iso_time = article_metadata["published_date"]   
#     if isinstance(iso_time, str):
#         unix_time = convert_to_unix(iso_time)
    
#     index.update(
#         id=article_id,
#         set_metadata= {"published_date": unix_time},
#         namespace="articles"
#     )

# # 0.99,0.06,0.27,0.96,0.54,0.71,0.93,0.49,0.38,0.18,0.81,0.62,0.39,0.89,0.58,0.34,0.79,0.74,0.34,0.46,0.13,0.74,0.75,0.07,0.65,0.76,0.05,0.68,0.23,0.67,0.99,0.29,0.82,0.56,0.11,0.36,0.6,0.6,0.88,0.34,0.42,0.65,0.47,0.19,0.98,0.03,0.38,0.72,0.02,0.05,0.15,0.58,0.75,0.14,0.9,0.8,0.32,0.56,0.01,0.42,0.76,0.1,0.16,0.06,0.18,0.46,0.39,0.86,0.01,0.12,0.88,0.22,0.34,0.03,0.91,0.42,0.54,0.33,0.05,0.15,0.13,0.22,0.77,0.54,0.7,0.29,0.03,0.66,0.66,0.92,0.47,0.43,0.73,0.43,0.82,0.89,0.74,0.44,0.12,0.72,0.92,0.27,0.41,0.29,0.6,0.51,0.91,0.73,0.98,0.45,0.14,0.09,0.57,0.35,0.88,0.15,0.27,0.27,0.32,0.22,0.03,0.48,0.73,0.93,0.87,0.46,0.81,0.79,0.8,0.9,0.29,0.64,0.04,0.86,0.21,0.37,0.77,0.86,0.09,0.24,0.11,0.15,0.28,0.7,0.24,0.87,0.59,0.1,0.25,0.36,0.93,0.33,0.44,0.67,0.68,0.11,0.49,0.32,0.19,0.06,0.16,0.83,0.37,0.98,0.61,0.03,0.83,0.76,0.39,0.66,0.7,0.15,0.94,0.19,0.87,0.13,0.65,0.56,0.56,0.09,0.19,0.93,0.99,0.44,0.51,0.55,0.11,0.71,0.3,0.93,0.2,0.4,0.3,0.56,0.44,0.85,0.95,0.49,0.34,0.5,0.55,0.41,0.15,0.81,0.36,0.64,0.48,0.78,0.76,0.73,0.35,0.27,0.52,0.6,0.56,0.66,0.43,0.09,0.46,0.93,0.98,0.59,0.22,0.88,0.59,0.18,0.56,0.53,0.7,0.83,0.01,0.59,0.83,0.58,0.57,0.06,0.13,0.45,0.11,0.6,0.72,0.67,0.52,0.18,0.05,0.08,0.19,0.12,0.1,0.48,0.8,0.53,0.71,0.93,0.77,0.27,0.15,0.79,0.59,0.02,0.68,0.77,0.17,0.19,0.57,0.04,0.24,0.23,0.11,0.57,0.75,0.4,0.89,0.16,0.86,0.54,0.01,0.2,0.46,0.32,0.38,0.46,0.92,0.26,0.71,0.16,0.42,0.82,0.82,0.73,0.99,0.08,0.83,0.84,0.92,0.83,0.95,0.28,0.87,0.43,0.32,0.99,0.5,0.26,0.99,1,0.42,0.52,0.34,0.11,0.98,0.93,0.87,0.33,0.8,0.56,0.63,0.52,0.41,0.41,0.68,0.17,0.05,0.24,0.99,0.15,0.03,0.79,0.8,0.56,0.23,0.78,0.35,0.32,0.62,0.9,0.19,0.05,0.42,0.08,0.18,0.47,0.89,0.46,0.03,0.44,0.3,0.5,0.94,0.05,0.26,0.26,0.27,0.05,0.7,0.39,0.98,0,0.31,0.2,0.49,0.2,0.28,0.11,0.19,0.52,0.11,0.33,0.01,0.82,0.86,0.83,0.82,0.1,0.89,0.39,0.55,0.59,0.34,0.07,0.95,0.36,0.14,0.36,0.16,0.44,0.92,0.11,0.86,0.94,0.68,0.53,0.08,0.21,0.8,0.29,0.21,0.32,0.95,0.02,0.02,0.39,0.49,0.78,0.38,0.19,0.2,0.43,0.48,0.74,0.6,0.76,0.66,0.3,0.94,0.25,0.89,0.92,0.76,0.82,0.44,0.86,0.19,0.45,0.43,0.11,0.42,0.48,0.28,0.99,0.99,0.97,0.51,0.88,0.92,0.71,0.9,0.04,0.48,0.76,0.29,0.63,0.39,0.5,0.13,0.85,0.73,0.06,0.9,0.63,0.43,0.13,0.98,0.72,0.39,0.46,0.81,0.7,0.52,0.54,0.08,0.2,0.94,0.03,0.29,0.99,0.43,0.14,0.52,0.49,0.9,0.85,0.33,0.22,0.31,0.08,0.38,0.42,0.91,0.11,0.25,0.72,0.68,0.57,0.64,0.46,0,0.44,0.15,0.83,0.81,0.95,0.45,0.91,0.02,0.9,0.88,0.3,0.64,0.63,0.92,0.75,0.59,0.77,0.3,0.79,0.29,0.11,0.78,0.61,0.44,0.44,0.52,0.49,0.12,0.88,0.36,0.96,0.5,0.78,0.44,0.24,0.23,0.59,0.72,0.77,0.55,0.88,0.79,0.01,0.59,0.79,0.23,0.71,1,0.58,0.25,0.21,0.61,0.82,0.19,0.18,0.39,0.04,0.58,0.96,0.78,0.39,0.12,0.81,0.41,0.36,0.91,0.92,0.19,0.79,0.89,0.46,0.51,0.83,0.41,0.42,0,0.85,0.1,0.9,0.64,0.34,0.35,0.16,0.1,0.98,0.43,0.39,0.98,0.72,0.39,0.52,0.06,0.41,0.19,0.69,0.15,0.56,0.26,0.7,0.96,0.22,0.66,0.64,0.34,0.56,0.41,0.44,0.38,0.51,0.39,0.72,0.72,0.58,0.41,0.12,0.2,0.76,0.59,0.39,0.77,0.29,0.9,0.11,0.52,0.26,0.5,0.45,0.59,0.82,0.83,0.58,0.51,0.21,0.46,0.3,0.06,0.94,0.52,0.57,0.62,1,0.71,0.07,0.05,0.93,0.23,0.15,0.66,0.07,0.08,0.09,0.14,0.69,0.08,0.9,0.36,0.15,0.32,0.45,0.22,0.88,0.76,0.91,0.19,0.29,0.79,0.83,0.82,0.36,0.81,0.77,0.96,0.38,0.79,0.53,0.92,0.7,0.43,0.9,0.47,0.75,0.64,0.54,0.57,0.84,0.12,0.12,0.81,0.93,0.98,0.94,0.05,0.47,0.8,0.61,0.56,0.73,0.77,0.37,0.41,0.85,0.19,0.86,0.77,0.19,0.25,0.06,0.83,0.19,0.46,0.99,0.94,0.06,0.78,0.27,0.88,0.57,0.73,0.71,0.94,0.29,0.99,0.87,0.5,0.58,0.47,0.4,0.83,0.92,0.73,0.27,0.06,0.93,0.5,0.18,0.36,0.75,0.71,0.98,0.34,0.16,0.03,0.01,0.26,0.45,0.41,0.72,0.52,0.3,0.74,0.17,0.01,0.96,0.14,0.86,0.54,0.49,0.13,0.4,0.6,0.16,0.32,0.74,0.17,0.56,0.55,0.17,0.42,0.81,0.57,0.23,0.49,0.13,0.29,0.7,0.78,0.41,0.9,0.92,0.03,0.43,0.72,0.97,0.9,0.92,0.26,0.57,0.38,0.64,0.96,0.63,0.27,0.13,0.45,0.02,0,0.73,0.82,0.44,0.98,0.33,0.01,0.02,0.19,0.71,0.01,0.27,0.79,0.29,0.16,0.39,0.22,0.89,0.29,0.32,0.73,0.44,0.89,0.04,0.23,0.19,0.7,0.06,0.85,0.17,0.21,0.82,0.75,0.38,0.51,0.79,0.77,0.98,0.33,0.87,0.46,0.48,0.21,0.06,0.9,0.35,0.3,0.89,0.66,0.47,0.08,0.55,0.37,0.1,0.32,0.71,0.65,0.57,0.83,0.29,0.04,0.22,0.08,0.22,0.09,0.18,0.24,0.99,0.56,0.54,0.69,0.82,0.24,0.36,0.37,0.99,0.6,0.96,0.2,0.56,0.29,0.38,0.17,0.99,0.59,0.16,0.83,0.42,0.21,0.18,0.28,0.45,0.35,0.92,0.17,0.04,0.27,0.66,0.56,0.26,0.93,0.16,0.99,0.52,0.94,0.42,0.55,0.69,0.6,0.83,0.2,0.61,0.21,0.2,0.06,0.04,0.57,0.99,0.83,0.8,0.49,0.11,0.78,0.9,0.44,0.36,0.75,0.21,0.84,0.38,0.63,0.63,0.1,0.12,0.91,0.23,0.93,0.29,0.14,0.15,0.91,0.94,0.08,0.45,0.89,0.78,0.2,0.61,0.89,0.52,0.81,0.4,0.09,0.4,0.13,0.24,0.72,0.76,0.07,0.26,0.6,0.83,0.32,0.79,0.29,0.69,0.05,0.85,0.06,0.1,0.76,0.18,0.04,0.41,0.09,0.82,0.8,0.5,0.82,0.39,0.72,0.65,0.87,0.2,0.79,0.54,0.46,0.24,0.3,0.33,0.39,0.86,0.8,0.18,0.27,0.15,0.36,0.83,0.67,0.53,0.14,0.92,0.65,0.04,0.98,0.81,0.04,0.9,0.41,0.26,0.93,0.42,0.91,0.64,0.24,0.11,0.33,0.66,0.16,0.44,0.83,0.27,0.39,0.72,0.27,0.82,0.1,0.29,0.75,0.68,0.11,0.02,0.94,0.7,0.38,0.11,0.28,0.18,0.75,0.86,0.13,0.82,0.8,0.67,0.3,0.68,0.56,0.28,0.19,0.04,0.71,0.09,0.73,0.13,0.28,0.31,0.89,0.13,0.19,0.51,0.89,0.98,0.27,0.76,0.4,0.16,0.5,0.69,0.77,0.63,0.71,0.98,0.26,0.21,0.13,0.18,0.42,0.66,0.74,0.47,0.33,0.17,0.69,0.14,0.48,0.58,0.22,0.02,0.17,0.76,0.55,0.8,0.84,0.05,0.97,0.05,0.46,0.92,0.98,0.81,0.03,0.69,0.95,0.73,0.1,0.23,0.87,0.61,0.48,0.37,0.73,0.04,0.62,0.65,0.17,0.29,0.04,0.72,0.59,0.35,0.49,0.5,0.34,0.79,0,0.02,0.13,0.15,0.24,0.95,0.62,0.35,0.1,0.45,0.83,0.18,0.01,0.67,0.03,0.96,0.11,0.28,0.91,0.97,0.97,0.05,0.02,0.43,0.64,0.02,0.51,0.05,0.61,0.8,0.69,0.57,0.54,0.18,0.33,0.97,0.05,0.69,0.52,0.65,0.91,0.16,0.09,0.02,0.13,0.36,0.37,0.26,0.27,0.51,0.28,0.1,0.73,0.14,0.19,0.31,0.64,0.76,0.07,0.28,0.29,0.52,0.31,0.52,0.49,0.18,0.42,0.07,0.54,0.27,0.12,0.13,0.9,0.62,0.88,0.4,0.14,0.01,0.95,0.44,0.14,0.74,0.67,0.95,0.33,0.17,0.28,0.62,0.04,0.37,0.72,0.41,0.8,0.47,0.85,0.57,0.5,0.78,0.62,0.53,0.7,0.64,0.89,0.19,0.25,0.36,0.89,0.15,0.98,0.01,0.38,0.63,0.25,0.65,0.72,0.08,0.09,0.49,0.53,0.55,0.07,0.52,0.66,0.13,0.61,0.57,0.49,0.33,0.51,0.44,0.44,0.13,0.75,0.77,0.26,0.7,0.79,0.64,0.15,0.05,0.79,0.02,0.5,0.49,0,0.07,0.78,0.13,0.12,0.24,0.4,0.63,0.48,0.15,0.41,0.94,0.12,0.31,0.14,0.56,0.57,0.55,0.55,0.63,0.6,0.84,0.02,0.19,0.76,0.65,0.17,0.67,0.45,0.1,0.8,0.07,0.23,0.83,0.12,0.95,0.54,0.57,0.58,0.23,0.74,0.87,0.35,0.83,0.47,0.15,0.11,0.61,0.33,0.32,0.83,0.05,0.2,0.22,0.71,0.83,0.57,0.64,0.66,0.5,0.79,0.49,0.73,0.38,0.02,0.18,0.08,0.74,0.71,0.38,0.07,0.88,0.44,0.09,0.66,0.49,0.67,0.65,0.96,0.33,0.08,0.92,0.29,0.13,0.83,0.79,0.44,0.85,0.56,0.91,0.03,0.76,0.88,0.4,0.25,0.69,0.03,0.6,0.45,0.55,0.8,0,0.5,0.27,0.51,0.01,0.67,0.05,0.47,0.2,0.63,0.38,0.15,0.26,0.55,0.47,0.93,0.58,0.89,0.24,0.68,0.5,0.85,0.98,0.27,0.17,0.98,0.48,0.74,0.85,0.83,0.29,0.01,0.51,0.97,0.33,0.38,0.14,0.58,0.22,0.99,0,0.03,0.54,0.69,0.04,0.01,0.97,0.94,0.98,0.82,0.62,0.05,0.65,0.36,0.86,0.1,0.73,0.14,0.89,0.04,0.27,0.99,0.53,0.3,0.71,0.3,0.02,0.83,0.91,0.13,0.34,0.69,0.45,0.73,0.79,0.43,0.84,0.75,0.23,0.19,0.82,0.24,0.04,0.46,0.42,0.56,0.8,0.73,0.6,0.89,0.11,0.39,0.68,0.03,0.01,0.13,0.41,0.32,0.3,0.71,0.75,0.41,0.23,0.46,0.98,0.33,0.47,0.9,0.46,0.69,0.36,0.87,0.56,0.36,0.24,0.33,0.43,0.19,0.94,0.44,0.18,0.52,0.96,0.01,0.24,0.13,0.03,0.39,0.71,0.82,0.84,0.37,0.61,0.67,0.66,0.55,0.92,0.83,1,0.44,0.99,0.9,0.1,0.51,0.61,0.21,0.08,0.27,0.64,0.58,0.11,0.6,0.39,0.24,0.52,0.33,0.48,0.9,0.41,0.13,0.36,0.81,0.26,0.33,0.72,0.58,0.57,0.87,0.86,0.91,0.96,0.8,0.98,0.61,0.28,0.08,0.7,0.22,0.24,0.97,0.48,0.45,0.26,0.01,0.24
# # 2024-10-07 14:20:41


from datetime import datetime, timedelta
import pytz
def unix_to_formatted_string_est(unix_timestamp):
    # Convert Unix timestamp to a UTC datetime object
    dt_utc = datetime.utcfromtimestamp(unix_timestamp)
    
    # Define the EST timezone
    est = pytz.timezone('America/New_York')
    
    # Localize the UTC datetime to EST
    dt_est = dt_utc.replace(tzinfo=pytz.utc).astimezone(est)
    
    # Format the datetime object into a string
    formatted_time = dt_est.strftime("%B %d, %Y %I:%M %p")  # 12-hour format
    return formatted_time

est = pytz.timezone('America/New_York')

# Get the current date and time in EST
current_date_est = datetime.now(est)

# Calculate the date 14 days ago
date_14_days_ago_est = current_date_est - timedelta(days=14)

# Format the dates as strings (optional)
current_date_str = current_date_est.strftime('%Y-%m-%d %H:%M:%S')
date_14_days_ago_str = date_14_days_ago_est.strftime('%Y-%m-%d %H:%M:%S')

# Print the results
print(f"Current Date (EST): {current_date_str}")
print(f"Date 14 Days Ago (EST): {date_14_days_ago_str}")