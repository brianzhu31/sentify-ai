"use server";

import { ReactNode } from "react";
import { CompaniesProvider } from "@/context/companies-context";
import { Navbar } from "../components/navbar";
import { UserSessionProvider } from "@/context/user-session-context";


interface CompaniesLayoutProps {
  children: ReactNode;
}

export default async function CompaniesLayout ({ children }: CompaniesLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-6 sm:px-8">{children}</main>
    </div>
  );
};
