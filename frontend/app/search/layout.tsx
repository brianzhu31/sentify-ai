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
import { useSearchHistory } from "@/context/search-history-context";

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

  return (
    <div className="flex min-h-screen">
      <SheetMenu />
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1">{children}</div>
      <div className="absolute top-0 right-0 mt-4 mr-8">
        <UserDropdown></UserDropdown>
      </div>
    </div>
  );
};
