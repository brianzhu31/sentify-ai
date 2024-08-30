"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/context/user-session-context";
import { fetchSearchData } from "./actions/fetch-search";
import { usePathname } from "next/navigation";
import { SearchData } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

export default function SearchIdPage() {
  const { session } = useUserSession();
  const pathname = usePathname();
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

  return (
    <div className="h-[100vh] p-16 overflow-y-auto">
      <pre className="whitespace-pre-wrap break-words">
        {JSON.stringify(searchData, undefined, 2)}
      </pre>
    </div>
  );
}
