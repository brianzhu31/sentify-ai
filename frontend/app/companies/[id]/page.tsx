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
import Image from "next/image";
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
    const articlesData = await fetchArticles(ticker, previousPage, 10);
    setPaginatedArticles(articlesData);
    setArticlePage(previousPage);
  };

  const handleNextPage = async () => {
    if (!paginatedArticles?.has_more) {
      return;
    }
    const nextPage = articlePage + 1;
    const articlesData = await fetchArticles(ticker, nextPage, 10);
    setPaginatedArticles(articlesData);
    setArticlePage(nextPage);
  };

  useEffect(() => {
    const getAllCompanyData = async () => {
      try {
        if (ticker) {
          const analyticsData = await fetchAnalytics(ticker);
          setCompanyAnalytics(analyticsData);

          const companyData = await fetchCompanyData(ticker);
          setCompanyData(companyData);

          const articlesData = await fetchArticles(ticker, articlePage, 10);
          setPaginatedArticles(articlesData);
        } else {
          toast({
            variant: "error",
            description: `Company ${ticker} not found!`,
          });
        }
      } catch (err: any) {
        router.push("/companies");
        toast({
          variant: "error",
          description: err.message || "An unexpected error occurred",
        });
      }
    };

    getAllCompanyData();
  }, [pathname]);

  if (!companyData && !companyAnalytics) {
    return <></>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center">
      <div className="flex flex-col max-w-[1300px] gap-8">
        <div className="flex">
          <div className="mr-6">
            <div className="rounded-full overflow-auto min-w-[120px] min-h-[120px]">
              <Image
                src={`/icons/big/${companyData?.ticker}.svg`}
                width={180}
                height={180}
                alt={companyData?.ticker || ""}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-5xl font-semibold">
              {companyData?.company_name}
            </p>
            <div className="flex items-center gap-2 border-solid border-[1px] py-1 px-4 rounded-lg self-start">
              <p className="text-lg">{companyData?.ticker}</p>
              <span className="text-lg">•</span>
              <p className="text-lg">{companyData?.exchange}</p>
              <div className="rounded-full overflow-auto">
                <img
                  src={`/icons/exchanges/${companyData?.exchange}.svg`}
                  alt={companyData?.exchange || ""}
                />
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <SentimentScoreCard score={companyAnalytics?.score || 3} />
          </div>
        </div>
        <div>
          <StockGraph ticker={ticker} companyData={companyData} />
        </div>
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
