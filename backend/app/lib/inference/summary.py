import aiohttp
import json
from lib.inference.prompt import (
    base_summarization_prompt,
    compress_base_prompt,
    sentiment_summary_prompt,
)
from lib.inference.external_api import call_model_api_async
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv(".env.local")

GENAI_KEY = os.getenv("GENAI_KEY")
OPENAI_KEY = os.getenv("OPENAI_KEY")


async def generate_base_summary(
    session: aiohttp.ClientSession, company_name: str, article: str
):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
    body = {
        "contents": [
            {
                "parts": [{"text": base_summarization_prompt(company_name, article)}],
            }
        ],
        "generation_config": {"maxOutputTokens": 300, "temperature": 0.2, "topP": 0.9},
    }
    headers = {"x-goog-api-key": GENAI_KEY}

    inference_output = await call_model_api_async(session, url, body, headers)

    try:
        summary = inference_output["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        summary = ""

    return summary


async def compress_base_summary(
    session: aiohttp.ClientSession, company_name: str, article_title: str, summary: str
):
    url = "https://api.openai.com/v1/chat/completions"
    body = {
        "model": "gpt-4o-mini",
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "top_p": 0.9,
        "messages": [
            {
                "role": "user",
                "content": compress_base_prompt(company_name, article_title, summary),
            }
        ],
    }

    headers = {"Authorization": f"Bearer {OPENAI_KEY}"}

    inference_output = await call_model_api_async(session, url, body, headers)

    try:
        json_output = json.loads(
            inference_output["choices"][0]["message"]["content"])
    except (KeyError, IndexError, json.JSONDecodeError):
        json_output = {}

    return json_output


async def generate_sentiment_summaries(
    session: aiohttp.ClientSession, company_name: str, article_summaries: str
):
    url = "https://api.openai.com/v1/chat/completions"
    body = {
        "model": "gpt-4o-mini",
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "top_p": 0.9,
        "messages": [
            {
                "role": "user",
                "content": sentiment_summary_prompt(company_name, article_summaries),
            }
        ],
    }

    headers = {"Authorization": f"Bearer {OPENAI_KEY}"}

    inference_output = await call_model_api_async(session, url, body, headers)

    try:
        json_output = json.loads(inference_output["choices"][0]["message"]["content"])
    except (KeyError, IndexError, json.JSONDecodeError):
        json_output = {}

    return json_output


def sentiment_to_int_score(sentiment: str):
    mapping = {
        "VERY NEGATIVE": 1,
        "NEGATIVE": 2,
        "NEUTRAL": 3,
        "POSITIVE": 4,
        "VERY POSITIVE": 5,
    }
    return mapping.get(sentiment, 3)


def impact_to_int_score(impact: str):
    mapping = {"LOW": 1, "MEDIUM": 3, "HIGH": 5}
    return mapping.get(impact, 1)

