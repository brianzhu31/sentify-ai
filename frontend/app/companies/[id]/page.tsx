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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SummaryCard from "./components/summary-card";
import ArticleCard from "./components/article-card";
import { CompanyFull, CompanyAnalytics, Article, PaginatedArticlesData } from "@/types";
import Image from "next/image";

export default function CompanyAnalyticsContent() {
  const pathname = usePathname();
  const ticker = pathname.split("/").pop();
  const router = useRouter();
  const [companyData, setCompanyData] = useState<CompanyFull | null>(null);
  const [companyAnalytics, setCompanyAnalytics] =
    useState<CompanyAnalytics | null>(null);
  const [paginatedArticles, setPaginatedArticles] = useState<PaginatedArticlesData | null>(null);
  const [articlePage, setArticlePage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const handlePreviousPage = async () => {
    const previousPage = Math.max(1, articlePage - 1);
    const articlesData = await fetchArticles(ticker, previousPage, 10);
    setPaginatedArticles(articlesData);
    setArticlePage(previousPage);
  }

  const handleNextPage = async () => {
    if (!paginatedArticles?.has_more) {
      return;
    }
    const nextPage = articlePage + 1;
    const articlesData = await fetchArticles(ticker, nextPage, 10);
    setPaginatedArticles(articlesData);
    setArticlePage(nextPage);
  }

  useEffect(() => {
    const getAllCompanyData = async () => {
      try {
        setLoading(true);
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
            description: `Search ${ticker} not found!`,
          });
        }
      } catch (err: any) {
        router.push("/search");
        setLoading(false);
        toast({
          variant: "error",
          description: err.message || "An unexpected error occurred",
        });
      } finally {
        setLoading(false);
      }
    };

    getAllCompanyData();
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Spinner className={cn("size-24")} strokeWidth={0.6}></Spinner>
      </div>
    );
  }

  if (!companyData && !companyAnalytics) {
    return <></>;
  }

  return (
    <div className="flex w-full min-h-screen justify-center">
      <div className="flex flex-col max-w-[1300px] py-16 gap-8">
        <div className="flex">
          <div className="mr-6">
            <div className="rounded-full overflow-auto min-w-[120px] min-h-[120px]">
              <Image
                src={`/icons/big/${companyData?.ticker}.svg`}
                width={180}
                height={180}
                alt={companyData?.ticker || ""}
              ></Image>
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
                <Image
                  src={`/icons/exchanges/${companyData?.exchange}.svg`}
                  width={22}
                  height={22}
                  alt={companyData?.exchange || ""}
                ></Image>
              </div>
            </div>
          </div>
        </div>
        <Card className={cn("flex-1 flex-grow rounded-md")}>
          <CardHeader>
            <CardTitle>Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{companyAnalytics?.overall_summary}</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <SummaryCard
            sentimentLabel="Positive"
            summaryPoints={companyAnalytics?.positive_summaries || []}
          />
          <SummaryCard
            sentimentLabel="Negative"
            summaryPoints={companyAnalytics?.negative_summaries || []}
          />
        </div>
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
