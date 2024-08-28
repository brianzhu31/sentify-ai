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
        const searchIdB64 = pathname.split("/").pop();
        if (searchIdB64) {
          const numberId = parseInt(atob(searchIdB64));
          const response = await fetchSearchData(
            numberId,
            session.access_token
          );
          setSearchData(response);
        } else {
          throw new Error("Invalid URL: searchIdB64 is undefined");
        }
      } catch (err: any) {
        setLoading(false);
        if (err.response && err.response.data && err.response.data.message) {
          toast({
            variant: "error",
            description: err.response.data.message,
          });
        } else {
          toast({
            variant: "error",
            description: err.message || "An unexpected error occurred",
          });
        }
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
