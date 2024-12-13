"use client";

import { useEffect, useState } from "react";
import {
  fetchAnalytics,
  fetchCompanyData,
  fetchArticles,
} from "./actions/fetch-company-data";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SummaryCard from "./components/summary-card";
import ArticleCard from "./components/article-card";
import { StockGraph } from "./components/stock-graph";
import {
  CompanyFull,
  CompanyAnalytics,
  Article,
  PaginatedArticlesData,
} from "@/types";
import SentimentScoreCard from "./components/sentiment-score-card";

export default function CompanyAnalyticsContent() {
  const pathname = usePathname();
  const ticker = pathname.split("/").pop() || "";
  const router = useRouter();
  const [companyData, setCompanyData] = useState<CompanyFull | null>(null);
  const [companyAnalytics, setCompanyAnalytics] =
    useState<CompanyAnalytics | null>(null);
  const [paginatedArticles, setPaginatedArticles] =
    useState<PaginatedArticlesData | null>(null);
  const [articlePage, setArticlePage] = useState<number>(1);
  const { toast } = useToast();

  const handlePreviousPage = async () => {
    const previousPage = Math.max(1, articlePage - 1);
    const fetchArticlesResponse = await fetchArticles(ticker, previousPage, 10);
    if (fetchArticlesResponse.data) {
      setPaginatedArticles(fetchArticlesResponse.data);
    }
    setArticlePage(previousPage);
  };

  const handleNextPage = async () => {
    if (!paginatedArticles?.has_more) {
      return;
    }
    const nextPage = articlePage + 1;
    const fetchArticlesResponse = await fetchArticles(ticker, nextPage, 10);
    if (fetchArticlesResponse.data) {
      setPaginatedArticles(fetchArticlesResponse.data);
    }
    setArticlePage(nextPage);
  };

  useEffect(() => {
    const getAllCompanyData = async () => {
      if (ticker) {
        const fetchAnalyticsResponse = await fetchAnalytics(ticker);
        if (fetchAnalyticsResponse.data) {
          setCompanyAnalytics(fetchAnalyticsResponse.data);
        }

        const fetchCompanyDataResponse = await fetchCompanyData(ticker);
        if (fetchCompanyDataResponse.data) {
          setCompanyData(fetchCompanyDataResponse.data);
        }

        const fetchArticlesData = await fetchArticles(ticker, articlePage, 10);
        if (fetchArticlesData.data) {
          setPaginatedArticles(fetchArticlesData.data);
        }
      } else {
        toast({
          variant: "error",
          description: `Company ${ticker} not found!`,
        });
      }
    };

    getAllCompanyData();
  }, [pathname]);

  if (!companyData && !companyAnalytics) {
    return <></>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center px-8">
      <div className="flex flex-col max-w-[1300px] gap-8">
        <div className="flex flex-row gap-6 sm:gap-8">
          <div>
            <img
              className="rounded-full min-w-[100px]"
              src={`/icons/big/${companyData?.ticker}.svg`}
              alt={companyData?.ticker || ""}
              width="220"
              height="220"
            />
          </div>
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="flex flex-col gap-4">
              <p className="text-3xl md:text-4xl lg:text-5xl font-semibold">
                {companyData?.company_name}
              </p>
              <div className="flex items-center gap-2 border-solid border-[1px] py-1 px-4 rounded-lg self-start">
                <p className="text-sm lg:text-md">{companyData?.ticker}</p>
                <span className="text-sm">•</span>
                <p className="text-sm lg:text-md">{companyData?.exchange}</p>
                <div>
                  <img
                    className="rounded-full min-w-5"
                    src={`/icons/exchanges/${companyData?.exchange}.svg`}
                    alt={companyData?.exchange || ""}
                  />
                </div>
              </div>
            </div>
            <div className="md:ml-auto hidden sm:block">
              <SentimentScoreCard score={companyAnalytics?.score || 3} />
            </div>
          </div>
          
        </div>
        <div className="md:ml-auto block sm:hidden">
            <SentimentScoreCard score={companyAnalytics?.score || 3} />
          </div>
        <StockGraph ticker={ticker} companyData={companyData} />
        {companyAnalytics?.summary_sections.map((summarySection, index) => (
          <SummaryCard summarySection={summarySection} key={index} />
        ))}
        <div className="flex-col">
          <p className="text-2xl mb-4">Article sources</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {paginatedArticles &&
              paginatedArticles.articles.map(
                (article: Article, index: number) => (
                  <ArticleCard key={index} article={article} />
                )
              )}
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={articlePage <= 1}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!paginatedArticles?.has_more}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
