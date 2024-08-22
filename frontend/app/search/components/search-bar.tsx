"use client";

import { useState, useEffect } from "react";
import { CompanyPartial } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { useCompanies } from "@/context/companies-context";

export function SearchBar() {
  const { companies } = useCompanies();
  const [query, setQuery] = useState<string>("");
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyPartial[]>(
    []
  );
  const [selectedCompany, setSelectedCompany] = useState<
    CompanyPartial | undefined
  >(undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedCompany(undefined);

    if (value) {
      const filtered = companies.filter(
        (company) =>
          company.company_name.toLowerCase().startsWith(value.toLowerCase()) ||
          company.aliases.some((alias) =>
            alias.toLowerCase().startsWith(value.toLowerCase())
          ) ||
          company.ticker.toLowerCase().startsWith(value.toLowerCase()) ||
          `${company.company_name} (${company.ticker})`
            .toLowerCase()
            .startsWith(value.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies([]);
    }
  };

  const handleSelectItem = (company: any) => {
    setQuery(`${company.company_name} (${company.ticker})`);
    setSelectedCompany(company);
    setFilteredCompanies([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && filteredCompanies.length > 0) {
      const firstCompany = filteredCompanies[0];
      setQuery(`${firstCompany.company_name} (${firstCompany.ticker})`);
      setSelectedCompany(firstCompany);
      setFilteredCompanies([]);
    }
  };

  return (
    <div className="relative lg:w-[50%] md:w-[65%] w-[80%]">
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search"
        className={cn(
          "h-12 rounded-lg",
          "border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black",
          "text-gray-900 placeholder-gray-500 transition-shadow shadow-sm focus:shadow-lg"
        )}
      />
      {query && filteredCompanies.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filteredCompanies.map((company) => (
            <div
              key={company.ticker}
              onClick={() => handleSelectItem(company)}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-3 transition-colors"
            >
              <div className="rounded-full overflow-hidden w-7 h-7">
                <Image
                  src={`/icons/small/${company.ticker}.svg`}
                  alt={`${company.ticker} icon`}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-800 text-sm font-medium">
                {company.company_name} ({company.ticker})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
