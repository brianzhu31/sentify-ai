"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/context/user-session-context";
import { fetchSearchData } from "../actions/fetch-search";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { SearchData } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import SummaryCard from "./summary-card";
import ArticleCard from "./article-card";

import Image from "next/image";

export default function SearchContent() {
  const { session } = useUserSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!session) {
      return;
    }

    const getSearchData = async () => {
      try {
        setLoading(true);
        const searchId = pathname.split("/").pop();
        if (searchId) {
          const response = await fetchSearchData(
            searchId,
            session.access_token
          );
          setSearchData(response);
        } else {
          toast({
            variant: "error",
            description: `Search ${searchId} not found!`,
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

    getSearchData();
  }, [pathname, session]);

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Spinner className={cn("size-24")} strokeWidth={0.6}></Spinner>
      </div>
    );
  }

  if (!searchData) {
    return <></>;
  }

  return (
    <>
      <div className="flex m-16">
        <div className="mr-6">
          <div className="rounded-full overflow-auto min-w-[120px] min-h-[120px]">
            <Image
              src={`/icons/big/${searchData?.ticker}.svg`}
              width={180}
              height={180}
              alt={searchData?.ticker || ""}
            ></Image>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-5xl font-semibold">{searchData?.company_name}</p>
          <div className="flex items-center gap-2 border-solid border-[1px] py-1 px-4 rounded-lg self-start">
            <p className="text-lg">{searchData?.ticker}</p>
            <span className="text-lg">•</span>
            <p className="text-lg">{searchData?.exchange}</p>
            <div className="rounded-full overflow-auto">
              <Image
                src={`/icons/exchanges/${searchData?.exchange}.svg`}
                width={22}
                height={22}
                alt={searchData?.exchange || ""}
              ></Image>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-8 mb-8">
        <SummaryCard
          sentimentLabel="Positive"
          summaryPoints={searchData?.analysis_data?.positive_summaries}
        />
        <SummaryCard
          sentimentLabel="Negative"
          summaryPoints={searchData?.analysis_data?.negative_summaries}
        />
      </div>
      <div className="flex-col px-8">
        <p className="text-2xl mb-4">Article sources</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {searchData?.analysis_data?.sources &&
            searchData?.analysis_data?.sources.map((source, index) => (
              <ArticleCard key={index} article={source}/>
            ))}
        </div>
      </div>
    </>
  );
}
