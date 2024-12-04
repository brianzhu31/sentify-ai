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


def sentiment_summary_prompt(company_name: str, summaries: str):
    return f'''
You are a summarization expert. When summarizing content, provide comprehensive and detailed summaries.

I will give you news article summaries about {company_name}.
Summarize all the information into a list of summary sections. Each summary section should:
- Include a header, that is either a general topic (e.g. "Financial Overview") OR a specific topic (e.g. "New Partnership with XYZ Corp"). You must include topics of both types.
- A summary of the header topic written in MULTIPLE, very detailed paragraphs.

The information you provide should:
- Focus on recent events, current situation, or near-future projections.
- Include specific statistics, key details, and relevant metrics from recently, where available.
- Be quantifiable, providing clear figures or data where possible.
- Be actionable, offering insights that impact decision-making in the near term.
- Be relevant to the company's current market perception, sentiment, and future stock value.
- Avoid discussing long-term past events or historical information not directly relevant to the present or future.

For each summary section, record all the article indices of where the information from

Please output in valid JSON in the following format:
{{
    "summary_sections": {{
        "header": str,
        "paragraphs": str[],
        "sources": int[]
    }}[]
}}

Article summaries:
{summaries}
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
I will give you a user query.
If the query is harmful or unethical, repond exactly with "error".
Else, return "ok".
Query:
{query}
'''


def query_to_date_range_prompt(current_date: str, earliest_date: str, query: str):
    return f'''
Given a user query, convert it into a date range, which will be used as a filter to fetch data from my database.
The current date is: {current_date}
My database has data from {earliest_date} to {current_date}.

Follow these guidelines:
- Give some extra leeway after the end date.
- If the query does not specify a time frame, return exactly null for the start and end.
- The dates should be in %Y-%m-%d %H:%M:%S format.

Please output in valid JSON in the following format:
{{
    "start": str,
    "end": str
}}

Examples:

Current date: 2024-11-25 17:00:00
User query: "What happened to Apple the past week?"
Output:
{{
    "start": "2024-11-18 00:00:00",
    "end": "2024-11-25 23:59:59"
}}

Current date: 2024-11-25 17:00:00
User query: "What happened to NVDA yesterday?"
Output:
{{
    "start": "2024-11-24 00:00:00",
    "end": "2024-11-24 23:59:59"
}}

Current date: 2024-11-25 17:00:00
User query: "How is TSLA performing this month?"
Output:
{{
    "start": "2024-11-01 00:00:00",
    "end": "2024-11-25 23:59:59"
}}

Here is the user query:
{query}
'''


def convert_to_standalone_query_prompt(chat_session_history: str, query: str):
    return f'''
You are given a chat history and the user's next query. Your task is to rephrase the user's query to be more detailed.
You also have to detect if the user's query is a follow up to one of the previous messages in the chat history.
If the user query is a follow-up to one of the messages in the chat history, rephrase it into an independent query that works as a standalone prompt.
Make sure to include additional context and details to make the rephrased query more comprehensive.

Output format:
Only return the query with no accompanying text.

Example:

Chat history:
User: Why did Company A's stock rise so much last week?

Assistant: Company A's stock experienced a huge rise due to the excitement surrounding it's recent product launches.

User query:
What are the new product launches?

Rephrased user query:
What are some of Company A's new product launches?

Heres the following inputs:

Chat history:
{chat_session_history}

User query:
{query}
'''


def rag_system_prompt():
    return '''
You are a specialized financial RAG chatbot.
Your role is to assist users with finance-related queries.

You will be given:
1. The current date.
2. Chat history between you and the user.
3. The user's query.
4. News article summaries, fetched from the vector database, that will help you answer the user's query.

The user's query will be either a new independent query or a follow up to previous messages.

Answer the query using the provided information. You may choose to use the news article summaries or not, depending on their relevance to the query. However:
If the query asks for present or real-time information, or any information outside the scope of what the LLM would know (e.g., past your knowledge cutoff), you must rely on the fetched news article summaries to provide an accurate response.
If the news article summaries still do not help answer the query, output exactly "No relevant data found based on your query. Please try something else."

Output format:
- For straightforward answers to queries, use a short paragraph
- For more detailed answers, combine short paragraphs with bullet points to improve readability
- The only markdown symbol you are allowed to use are double asterisks (**). Use this to bold key terms

'''


def rag_chat_prompt(chat_session_history: str, context: str, current_date: str, query: str):
    return f'''
News article summaries:
{context}

Chat History:
{chat_session_history}

Current Date: {current_date}

Answer the following user query:
User query:
{query}
'''
