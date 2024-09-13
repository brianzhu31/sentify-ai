from typing import List, Dict
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

OPENAI_KEY = os.getenv("OPENAI_KEY")

miniLM_model = SentenceTransformer("sentence-transformers/paraphrase-MiniLM-L6-v2")


def embed_texts(
    texts: List[str], model: str = "sentence-transformers/paraphrase-MiniLM-L6-v2"
):
    embeddings = []
    if model == "sentence-transformers/paraphrase-MiniLM-L6-v2":
        model = SentenceTransformer("sentence-transformers/paraphrase-MiniLM-L6-v2")
        embeddings = miniLM_model.encode(texts, normalize_embeddings=True)
    elif model in [
        "text-embedding-3-small",
        "text-embedding-3-large",
        "text-embedding-ada-002",
    ]:
        client = OpenAI(api_key=OPENAI_KEY)
        response = client.embeddings.create(input=texts, model=model)

        embeddings = [item.embedding for item in response.data]

    return embeddings


def check_article_relevance(
    article_embedding: List[int], query_embeddings: List[List[int]]
):
    threshold = 0.5
    similarities = cosine_similarity([article_embedding], query_embeddings)
    return np.any(similarities[0] >= threshold)
