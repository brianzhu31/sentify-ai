"use client";

import { ReactNode, useEffect, useState } from "react";
import { CompaniesProvider } from "@/context/companies-context";
// import { SearchBar } from "./components/search-bar";
// import { UserDropdown } from "../components/user-dropdown";
import { Navbar } from "../components/navbar";
import { UserSessionProvider } from "@/context/user-session-context";


interface CompaniesLayoutProps {
  children: ReactNode;
}

export default function CompaniesLayout({
  children,
}: CompaniesLayoutProps) {
  return (
    <UserSessionProvider>
      <CompaniesProvider>
        <CompaniesLayoutContent>{children}</CompaniesLayoutContent>
      </CompaniesProvider>
    </UserSessionProvider>
  );
}

const CompaniesLayoutContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-6 sm:px-8">{children}</main>
    </div>
  );
};
