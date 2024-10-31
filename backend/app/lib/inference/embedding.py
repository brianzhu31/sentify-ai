from typing import List, Dict
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

OPENAI_KEY = os.getenv("OPENAI_KEY")

client = OpenAI(api_key=OPENAI_KEY)


def embed_texts(texts: List[str]):
    model = "text-embedding-3-small"
    response = client.embeddings.create(input=texts, model=model)
    embeddings = [item.embedding for item in response.data]

    return embeddings


def check_article_relevance(
    article_embedding: List[int], query_embeddings: List[List[int]]
):
    if article_embedding is None or query_embeddings is None:
        return False
    threshold = 0.5
    similarities = cosine_similarity([article_embedding], query_embeddings)
    return np.any(similarities[0] >= threshold)


def filter_similar_texts(values, threshold=0.9):
    embeddings = embed_texts(values, model="text-embedding-ada-002")

    similarity_matrix = cosine_similarity(embeddings)

    unique_indices = []
    used_indices = set()
    similar_text_pairs = []

    for i, value in enumerate(values):
        if i in used_indices:
            continue

        unique_indices.append(i)
        used_indices.add(i)

        for j in range(i + 1, len(values)):
            if similarity_matrix[i][j] > threshold:
                used_indices.add(j)
                similar_text_pairs.append(
                    (values[i], values[j], similarity_matrix[i][j])
                )

    return unique_indices
