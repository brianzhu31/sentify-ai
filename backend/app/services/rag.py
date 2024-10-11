from lib.inference.prompt import (
    rag_chat_prompt,
    rag_system_prompt,
    query_validation_prompt_new,
    query_validation_prompt,
    query_to_date_range_prompt,
)
from typing import List, Dict
from lib.inference.embedding import embed_texts
from lib.utils import (
    unix_to_formatted_string_est,
    convert_est_string_to_utc,
    datetime_to_unix,
)
import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

# from config import app
import json
from datetime import datetime, timedelta
import pytz


load_dotenv(".env.local")

OPENAI_KEY = os.getenv("OPENAI_KEY")
client = OpenAI(api_key=OPENAI_KEY)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=PINECONE_API_KEY)


class RAGEngine:

    def validate(self, query: str, is_new_chat: bool = False):
        max_len = 150
        if len(query) > max_len:
            return {
                "message": f"Query cannot exceed {max_len} characters.",
                "status": -1,
            }

        print("is new", is_new_chat)

        query_prompt = ""
        if is_new_chat:
            query_prompt = query_validation_prompt_new(query=query)
        else:
            query_prompt = query_validation_prompt(query=query)

        print(query_prompt)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": query_prompt}],
            temperature=0,
            max_tokens=50,
        )

        print(response)

        output = response.choices[0].message.content
        if output.lower() == "error":
            return {
                "message": f"Please enter an appropriate finance related query.",
                "status": -1,
            }

        return {"message": output, "status": 1}

    def retrieve(self, query: str):
        est = pytz.timezone("America/New_York")
        current_date_est = datetime.now(est)
        earliest_date = current_date_est - timedelta(days=14)
        current_date_str = current_date_est.strftime("%Y-%m-%d %H:%M:%S")
        earliest_date_str = earliest_date.strftime("%Y-%m-%d %H:%M:%S")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": query_to_date_range_prompt(
                        current_date=current_date_str,
                        earliest_date=earliest_date_str,
                        query=query,
                    ),
                }
            ],
            temperature=0,
        )
        inference_output = response.choices[0].message.content

        date_range = json.loads(inference_output)
        start_date = date_range["start"]
        end_date = date_range["end"]
        print("start date", start_date)
        print("end date", end_date)
        metadata_filter = None
        if start_date is not None and end_date is not None:
            start_date = convert_est_string_to_utc(start_date)
            end_date = convert_est_string_to_utc(end_date)
            unix_start_date = datetime_to_unix(start_date)
            unix_end_date = datetime_to_unix(end_date)
            print("unix start date", unix_start_date)
            print("unix end date", unix_end_date)
            metadata_filter = {
                "$and": [
                    {"published_date": {"$gte": unix_start_date}},
                    {"published_date": {"$lte": unix_end_date}},
                ]
            }

        query_embedding = embed_texts([query])[0]

        index = pc.Index("company-info")
        query_params = {
            "namespace": "articles",
            "vector": query_embedding,
            "top_k": 6,
            "include_metadata": True,
        }

        if metadata_filter is not None:
            query_params["filter"] = metadata_filter

        matches = index.query(**query_params)
        sorted_matches = sorted(
            matches.to_dict()["matches"], key=lambda x: x["score"], reverse=True
        )

        returned_context = []
        threshold = 0.5
        max_returns = 4
        count = 0
        for match in sorted_matches:
            if match["score"] >= threshold:
                returned_context.append(match["metadata"])
            count += 1
            if count >= max_returns:
                break

        return returned_context

    def inference(
        self, query: str, chat_session_history: str, relevant_articles: List[Dict]
    ):
        # with app.app_context():
        # if len(relevant_articles) == 0:
        #     yield "No relevant data found based on your query. Please try something else.\n"
        #     return

        est = pytz.timezone("America/New_York")
        current_date_est = datetime.now(est)
        current_date_str = current_date_est.strftime("%B %d, %Y %I:%M %p") + " EST"

        context = ""
        for article in relevant_articles:
            article_title = article["article_title"]
            article_content = article["text"]
            unix_timestamp = article["published_date"]
            article_published_date = (
                unix_to_formatted_string_est(unix_timestamp) + " EST"
            )
            context += f"Published date: {article_published_date}\nArticle title: {article_title}\nArticle summary:\n{article_content}\n\n"

        prompt = rag_chat_prompt(
            chat_session_history=chat_session_history,
            context=context,
            current_date=current_date_str,
            query=query,
        )
        print(prompt)

        stream = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": rag_system_prompt()},
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.7,
            max_tokens=250,
            stream=True,
        )

        for chunk in stream:
            try:
                content_chunk = chunk.choices[0].delta.content
                yield (content_chunk).encode("utf-8")
            except:
                pass
