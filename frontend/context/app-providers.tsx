"use client";

import { ReactNode } from "react";
import { UserSessionProvider } from "@/context/user-session-context";
import { CompaniesProvider } from "@/context/companies-context";
import { SearchHistoryProvider } from "./search-history-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserSessionProvider>
      <CompaniesProvider>
        <SearchHistoryProvider>
          {children}
        </SearchHistoryProvider>
      </CompaniesProvider>
    </UserSessionProvider>
  );
}
