"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics, fetchCompanyData } from "./actions/fetch-company-data";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import SummaryCard from "./components/summary-card";
import ArticleCard from "./components/article-card";
import { CompanyFull, CompanyAnalytics } from "@/types";
import Image from "next/image";

export default function CompanyAnalyticsContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [companyData, setCompanyData] = useState<CompanyFull | null>(null);
  const [companyAnalytics, setCompanyAnalytics] =
    useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const getAllCompanyData = async () => {
      try {
        setLoading(true);
        const ticker = pathname.split("/").pop();
        if (ticker) {
          const analyticsData = await fetchAnalytics(ticker);
          setCompanyAnalytics(analyticsData);

          const companyData = await fetchCompanyData(ticker);
          setCompanyData(companyData);
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
      <div className="flex flex-col max-w-[1400px] py-16 gap-8">
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
          {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {searchData?.analysis_data?.sources &&
            searchData?.analysis_data?.sources.map((source, index) => (
              <ArticleCard key={index} article={source} />
            ))}
        </div> */}
        </div>
      </div>
    </div>
  );
}
