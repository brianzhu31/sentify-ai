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


def base_summarization_prompt(company_name: str, article: str):
    return f"""
I will give you a news article about {company_name}.
Summarize this article in one paragraph that is STRICTLY 10 sentences or less.
{article}
"""


def compress_base_prompt(company_name: str, article_title: str, summary: str):
    return f"""
You are a highly skilled financial expert and summarization and analysis assistant. I will give you a description about {company_name}.
1. Summarize the most critical and specific information in 3 detailed sentences.
2. Assess the overall financial sentiment using: "VERY NEGATIVE", "NEGATIVE", "NEUTRAL", "POSITIVE", "VERY POSITIVE".
3. Evaluate the potential impact of the information on {company_name}'s market perception and future stock value using: "LOW", "MEDIUM", "HIGH".
Title: {article_title}
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
Positive Information: Extract and compile all positive information into detailed chunks of information. Each chunk should:
- Consist of multiple sentences (at least 1 and up to 2).
- Include specific statistics, key details, and relevant metrics.
- Be quantifiable, providing clear figures or data where possible.
- Be actionable, offering insights that could impact decision-making.
- Be relevant to the company's market perception, sentiment, and future stock value.
- Record which article index each chunk came from.

Negative Information: Extract and compile all negative information into detailed chunks. Each chunk should:
- Consist of multiple sentences (at least 1 and up to 2).
- Include specific statistics, key details, and relevant metrics.
- Be quantifiable, providing clear figures or data where possible.
- Be actionable, indicating potential concerns or risks.
- Be relevant to the company's market perception, sentiment, and future stock value.
- Record which article index each chunk came from.

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
