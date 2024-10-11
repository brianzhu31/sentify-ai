import re


def stock_queries(company_name: str):
    queries = [
        f"{company_name} stock performance",
        f"{company_name} market sentiment",
        f"{company_name} stock value",
        f"{company_name} controversies",
        f"{company_name} financial health",
        f"{company_name} revenue trends",
        f"{company_name} stock analysis",
        f"{company_name} market position",
        f"{company_name} legal issues",
        f"{company_name} market opportunities",
        f"{company_name} new product innovations",
        f"{company_name} customer reviews",
    ]
    return queries


def base_summarization_prompt(company_name: str, content: str):
    return f"""
I will give you a news article about {company_name}.
Summarize this article in one paragraph that is STRICTLY 10 sentences or less.
{content}
"""


def compress_base_prompt(company_name: str, title: str, summary: str):
    return f"""
You are a highly skilled financial expert and summarization and analysis assistant. I will give you a description about {company_name}.
1. Summarize only the most critical and specific *recent* information, events, or developments about {company_name} in 3 detailed sentences. Avoid historical data or long-term trends.
2. Assess the overall financial sentiment based on the information using: "VERY NEGATIVE", "NEGATIVE", "NEUTRAL", "POSITIVE", "VERY POSITIVE".
3. Evaluate the potential impact of this recent information on {company_name}'s market perception and future stock value using: "LOW", "MEDIUM", "HIGH".
Title: {title}
Description: {summary}

Please output in valid JSON in the following format:
{{
    "summary": str,
    "sentiment": str,
    "impact": str
}}
"""


def sentiment_summary_prompt(company_name: str, article_summaries: str):
    return f'''
You are a highly skilled financial expert and summarization and analysis assistant. I will give you news article summaries about {company_name}.

** Detailed Analysis **

Extract and compile both positive and negative *recent* information into detailed chunks. Each chunk should:
- Be up to 3 sentences long.
- Include specific statistics, key details, and relevant metrics from the past few months.
- Be quantifiable, providing clear figures or data where possible.
- Be actionable, offering insights that impact decision-making in the near term.
- Be relevant to the company's current market perception, sentiment, and future stock value.
- Record which article index each chunk came from.

For **Positive Information**, highlight strengths, opportunities, or favorable developments.  
For **Negative Information**, point out risks, concerns, or potential challenges.

Please output in valid JSON in the following format:
{{
    "positive": {{
        "info": str,
        "source": int
    }}[],
    "negative": {{
        "info": str,
        "source": int
    }}[]
}}

Article summaries:
{article_summaries}
'''


def query_validation_prompt_new(query: str):
    return f'''
You are a guardrail for a RAG chat bot.
Only accept queries that are related to finance, economics, or business topics.
Reject all irrelevant, inappropriate, or unethical queries.
If the query is acceptable, return only a short title that represents the query without any additional text.
If not, repond exactly with "error".
Query:
{query}
'''


def query_validation_prompt(query: str):
    return f'''
You are a guardrail for a RAG chat bot.
Reject all toxic or unethical queries by reponding exactly with "error".
Else, return only a short title that represents the query without any additional text.
Query:
{query}
'''


def query_to_date_range_prompt(current_date: str, earliest_date: str, query: str):
    return f'''
I want you to convert a user query into a date range to fetch data from.
Currently it is is {current_date}. I have data from {earliest_date} to {current_date}.
Try to give some extra leeway after the end date.
If the query does not specify a time frame, return exactly null for the start and end.
The dates should be in %Y-%m-%d %H:%M:%S format.
Please output in valid JSON in the following format:
{{
    "start": str,
    "end": str
}}
Query:
{query}
'''


def rag_system_prompt():
    return "You are a finance RAG chatbot. I will give you the chat history and extra context."


def rag_chat_prompt(chat_session_history: str, context: str, current_date: str, query: str):
    return f'''
Context:
{context}

Chat History:
{chat_session_history}

Current Date: {current_date}

Respond to the following query by using the information in the context and chat history, in 1 to 5 sentences.
If the query is a follow up to the messages in the chat history, provide an answer.
Else, if the query is independent and the context or chat history provided do not help answer it, just output: "No relevant data found based on your query. Please try something else."
Query: {query}
'''
