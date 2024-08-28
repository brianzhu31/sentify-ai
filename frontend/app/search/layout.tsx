"use client";

import { ReactNode, useEffect, useState } from "react";
import AppProviders from "@/context/app-providers";
import { Sidebar } from "./components/sidebar";
import { SheetMenu } from "./components/sheet-menu";
import { UserDropdown } from "./components/user-dropdown";

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
