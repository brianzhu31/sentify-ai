from lib.inference.prompt import rag_chat_prompt
from typing import List, Dict
from lib.inference.embedding import embed_texts
import os
from dotenv import load_dotenv
from openai import OpenAI
from config import app, pc

load_dotenv(".env.local")

OPENAI_KEY = os.getenv("OPENAI_KEY")

client = OpenAI(api_key=OPENAI_KEY)


class RAGEngine:
    def __init__(self, query: str):
        self.query: str = query

    def retrieve(self):
        query_embedding = embed_texts([self.query])[0]
        print(query_embedding.tolist())
        
        index = pc.Index("company-info")
        matches = index.query(
            namespace="articles",
            vector=query_embedding.tolist(),
            top_k=5,
            include_metadata=True
        )
        
        return matches.to_dict()["matches"]

    def inference(self, relevant_articles: List[Dict]):
        with app.app_context():
            if len(relevant_articles) == 0:
                yield "No relevant data found based on your query. Please try something else.\n"
                return

            context = ""
            for article in relevant_articles:
                text = article["metadata"]["text"]
                context += f"Article:\n{text}\n\n"

            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": rag_chat_prompt(context=context, query=self.query),
                    }
                ],
                temperature=0.5,
                stream=True
            )

            for chunk in stream:
                try:
                    content_chunk = chunk.choices[0].delta.content
                    print(content_chunk)
                    yield (content_chunk).encode('utf-8')
                except:
                    pass
