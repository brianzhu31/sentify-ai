"use client";

import { ReactNode, useEffect, useState } from "react";
import { CompaniesProvider } from "@/context/companies-context";

interface CompaniesLayoutProps {
  children: ReactNode;
}

export default function CompaniesLayout({ children }: CompaniesLayoutProps) {
  return (
    <CompaniesProvider>
      <SearchLayoutContent>{children}</SearchLayoutContent>
    </CompaniesProvider>
  );
}

const SearchLayoutContent = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};
