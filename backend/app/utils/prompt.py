import re


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    text = re.sub(r"\n+", " ", text)
    return text


def get_relevant_articles_prompt(company_name: str, article_previews: str) -> list:
    return [
        {
            "role": "system",
            "content": "You are a highly skilled financial expert.",
        },
        {
            "role": "user",
            "content": f"""
I have a collection of news article previews about {company_name}. For each preview, it has an index number, a title, and excerpt. I need you to:

1. Remember the preview's index number.
2. Read through each preview's title and excerpt.
3. Based on the sample information you read from title and excerpt, just PREDICT if the rest of the article's content will be relevant to {company_name}'s current market perception/sentiment or future stock value.
4. If the answer to step 3 is yes, then store that article's index into a list.

Please give your output in valid JSON in this format:
{{
    "data": int[]
}}

Here are the article previews:\n{article_previews}
        """,
        },
    ]


def get_analysis_prompt(
    company_name: str, articles_content: str, relevant_articles: list
) -> list:
    return [
        {
            "role": "system",
            "content": "You are a highly skilled financial expert and summarization and analysis assistant.",
        },
        {
            "role": "user",
            "content": f"""
I have a collection of news articles about {company_name}. I need you to:

1. Read through the provided text containing the articles.
2. For each article that that you read, create a json object with four properties: the article's index, the article's title, a market sentiment score using the terms: "VERY NEGATIVE", "NEGATIVE", "NEUTRAL", "POSITIVE", "VERY POSITIVE" and an impact score using the terms "LOW", "MEDIUM", "HIGH" to judge how much the article could affect {company_name}'s market perception and future stock value. Ensure that every article from the list of indexes has been rated: {relevant_articles}.
3. List out zero to fifteen key positve summary points and zero to fifteen negative summary points, that will directly impact {company_name}'s current market perception/sentiment or its future stock value. Consider factors such as recent market performance, public relations, product launches, controversies, and general sentiment when summarizing. Ensure each bullet point is detailed, concise, and covers a distinct piece of information. Also make sure to include SOME statistics and direct quotes from the articles in your summary points.
4. For each key point, return the index of the article that this key point originates from.
5. Create a 5-10 sentence paragraph overall summary of everything that you read.

Important Context:
- Do not let past reports heavily affect your rating. Also do not use summary points on any of these past reports. Instead, focus more on the present and future.

Please give your output in valid JSON in this format:
{{
    "ratings": {{
                "index": int,
                "title": str,
                "sentiment": str,
                "impact": "str
    }}[],
    "positive": {{
            summary: str,
            source: int
    }}[],
    "negative": {{
            summary: str,
            source: int
    }}[],
    "overall_summary": str
}}

Here are the articles:

{articles_content}
""",
        },
    ]
