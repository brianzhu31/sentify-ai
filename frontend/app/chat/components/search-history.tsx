"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserSession } from "@/context/user-session-context";
// import { useSearchHistory } from "@/context/search-history-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "./infinite-scroll";
import { Loader2 } from "lucide-react";
import { SearchEditDropdown } from "./search-edit-dropdown";
import { formatDateInUserTimezone } from "@/utils/time";
// import { fetchSearchHistory } from "../actions/fetch-search-history";

export function SearchHistoryContent() {
  const pathname = usePathname();
  const { session } = useUserSession();
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  if (!session) {
    return null;
  }

  const fetchMoreSearchHistory = async () => {
    // if (searchHistory.has_more) {
    //   setLoadingMore(true);

    //   setTimeout(async () => {
    //     const data = await fetchSearchHistory(session.access_token, pageNumber);
    //     setSearchHistory({
    //       label: data.label,
    //       searches: [...searchHistory.searches, ...data.searches],
    //       has_more: data.has_more,
    //     });
    //     setPageNumber(pageNumber + 1);
    //     setLoadingMore(false);
    //   }, 500);
    // }
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-4 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 pr-2">
          
        </ul>
      </nav>
    </ScrollArea>
  );
}
