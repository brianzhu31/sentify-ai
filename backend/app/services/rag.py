from lib.inference.prompt import (
    rag_chat_prompt,
    rag_system_prompt,
    query_validation_prompt_new,
    query_validation_prompt,
)
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

    def validate(self, query: str, is_new_chat: bool = False):
        max_len = 50
        if len(query) > max_len:
            return {
                "message": f"Query cannot exceed {max_len} characters.",
                "status": -1,
            }
        
        query_prompt = ""
        if is_new_chat:
            query_prompt = query_validation_prompt_new(query=query)
        else:
            query_prompt = query_validation_prompt(query=query)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": query_prompt}
            ],
            temperature=0,
        )
        
        print(response)

        output = response.choices[0].message.content
        if output == "error":
            return {
                "message": f"Please enter an appropriate finance related query.",
                "status": -1
            }

        return {"message": output, "status": 1}

    def retrieve(self, query: str):
        query_embedding = embed_texts([query])[0]
        print(query_embedding.tolist())

        index = pc.Index("company-info")
        matches = index.query(
            namespace="articles",
            vector=query_embedding.tolist(),
            top_k=5,
            include_metadata=True,
        )

        return matches.to_dict()["matches"]

    def inference(
        self, query: str, chat_session_history: str, relevant_articles: List[Dict]
    ):
        with app.app_context():
            # if len(relevant_articles) == 0:
            #     yield "No relevant data found based on your query. Please try something else.\n"
            #     return

            context = ""
            for article in relevant_articles:
                text = article["metadata"]["text"]
                context += f"Article:\n{text}\n\n"

            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": rag_system_prompt()},
                    {
                        "role": "user",
                        "content": rag_chat_prompt(
                            chat_session_history=chat_session_history,
                            context=context,
                            query=query,
                        ),
                    },
                ],
                temperature=0.5,
                max_tokens=250,
                stream=True,
            )

            for chunk in stream:
                try:
                    content_chunk = chunk.choices[0].delta.content
                    print(content_chunk)
                    yield (content_chunk).encode("utf-8")
                except:
                    pass
