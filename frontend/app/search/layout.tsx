"use client";

import { SearchHistoryData } from "@/types";
import { ReactNode, useEffect, useState } from "react";
import { UserSessionProvider } from "@/context/user-session-context";
import { useUserSession } from "@/context/user-session-context";
import { Sidebar } from "./components/sidebar";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { fetchSearchHistory } from "./actions/fetch-search-history";
import { usePathname } from "next/navigation";

interface SearchLayoutProps {
  children: ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <UserSessionProvider>
      <SearchLayoutContent>{children}</SearchLayoutContent>
    </UserSessionProvider>
  );
}

function SearchLayoutContent({ children }: { children: ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryData>({
    label: "",
    searches: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const pathName = usePathname();
  const { session } = useUserSession();

  useEffect(() => {
    if (!session) {
      return;
    }

    const getSearchHistory = async () => {
      try {
        const data = await fetchSearchHistory(pathName, session.access_token);
        setSearchHistory(data);
      } catch (err) {
        console.log("Error fetching search history:", err);
      } finally {
        setLoading(false);
      }
    };

    getSearchHistory();
  }, [session, pathName]);

  return (
    <div className="flex min-h-screen">
      <div className="m-4">
        <SheetMenu searchHistory={searchHistory}></SheetMenu>
      </div>
      {!loading && searchHistory ? (
        <Sidebar searchHistory={searchHistory} />
      ) : (
        <div className="flex-1 flex justify-center items-center">
          Loading...
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
