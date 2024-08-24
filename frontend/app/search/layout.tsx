"use client";

import { SearchHistoryData, CompanyPartial } from "@/types";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUserSession } from "@/context/user-session-context";
import AppProviders from "@/context/app-providers";
import { Sidebar } from "./components/sidebar";
import { SheetMenu } from "./components/sheet-menu";
import { Spinner } from "@/components/ui/spinner";
import { UserDropdown } from "./components/user-dropdown";
import { fetchSearchHistory } from "./actions/fetch-search-history";

interface SearchLayoutProps {
  children: ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <AppProviders>
      <SearchLayoutContent>{children}</SearchLayoutContent>
    </AppProviders>
  );
}

const SearchLayoutContent = ({ children }: { children: ReactNode }) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryData>({
    label: "",
    searches: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const { session } = useUserSession();

  useEffect(() => {
    if (!session) {
      return;
    }

    const getSearchHistory = async () => {
      try {
        const data = await fetchSearchHistory(pathname, session.access_token);
        setSearchHistory(data);
      } catch (err) {
        console.log("Error fetching search history:", err);
      } finally {
        setLoading(false);
      }
    };

    getSearchHistory();
  }, [session, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-1">
        <Spinner className={cn("size-24")} strokeWidth={0.6}></Spinner>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SheetMenu searchHistory={searchHistory}></SheetMenu>
      <div className="hidden lg:block">
        {searchHistory && <Sidebar searchHistory={searchHistory} />}
      </div>
      <div className="flex-1">{children}</div>
      <div className="absolute top-0 right-0 mt-4 mr-8">
        <UserDropdown></UserDropdown>
      </div>
    </div>
  );
};
