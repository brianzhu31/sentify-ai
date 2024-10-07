"use client";

import { ReactNode } from "react";
import { UserSessionProvider } from "@/context/user-session-context";
import { CompaniesProvider } from "@/context/companies-context";
import { ChatHistoryProvider } from "./chat-history-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserSessionProvider>
      <CompaniesProvider>
        <ChatHistoryProvider>
          {children}
        </ChatHistoryProvider>
      </CompaniesProvider>
    </UserSessionProvider>
  );
}
