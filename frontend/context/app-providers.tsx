"use client";

import {
  ReactNode,
} from "react";
import { UserSessionProvider } from "@/context/user-session-context";
import { CompaniesProvider } from "@/context/companies-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserSessionProvider>
      <CompaniesProvider>
        {children}
      </CompaniesProvider>
    </UserSessionProvider>
  );
}
