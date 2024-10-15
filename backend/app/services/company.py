from managers.article_manager import ArticleManager
from managers.company_manager import CompanyManager
from lib.inference.batch import create_jsonl_batch_file, submit_batch, get_batch_results
from lib.inference.prompt import sentiment_summary_prompt
from typing import List


class SummaryCollection:

    def __init__(self, company_name: str, ticker: str, summaries: str):
        self.company_name: company_name
        self.ticker = ticker
        self.summaries = summaries


class CompaniesAnalyzer:

    def __init__(self, tickers: str = None):
        self.tickers = tickers
        self.summary_collections = []

    def generate_overall_summaries(self, time_period: int, tickers: List[str] = None):
        for ticker in tickers:
            company_query = CompanyManager.get_company_by_ticker(ticker=ticker)
            if not company_query:
                return
            company_name = company_query.company_name
            articles_for_ticker = ArticleManager.get_articles_by_ticker(
                ticker=ticker, time_period=time_period)
            summaries_text = ""

            for index, article in enumerate(articles_for_ticker):
                summaries_text += f"** Article {index} **\nTitle: {article.title}\nSummary: {article.compressed_summary}\n\n"

            summary_collection = SummaryCollection(
                company_name=company_name, ticker=ticker, summaries=summaries_text)
            self.summary_collections.append(summary_collection)

        create_jsonl_batch_file(
            objects=self.summary_collections,
            output_dir="files",
            file_name="summary_collections.jsonl",
            prompt_function=sentiment_summary_prompt,
            prompt_args=["company_name", "summaries"],
        )
        
        batch_id = submit_batch(
            filepath="files/summary_collections.jsonl",
            endpoint="/v1/chat/completions",
            job_description="companies analysis job",
        )

        summaries_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="companies_analysis.jsonl",
        )
