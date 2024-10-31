"use client";

import { CompaniesTable } from "./components/companies-table";

export default function CompaniesPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="p-16">
        <p className="text-5xl font-bold">All Companies</p>
      </div>
      <div className="w-full max-w-[1300px]">
        <CompaniesTable />
      </div>
    </div>
  );
}
