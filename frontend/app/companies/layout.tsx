"use client";

import { ReactNode, useEffect, useState } from "react";
import { CompaniesProvider } from "@/context/companies-context";

interface CompaniesLayoutProps {
  children: ReactNode;
}

export default function CompaniesLayout({ children }: CompaniesLayoutProps) {
  return (
    <CompaniesProvider>
      <CompaniesLayoutContent>{children}</CompaniesLayoutContent>
    </CompaniesProvider>
  );
}

const CompaniesLayoutContent = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};
