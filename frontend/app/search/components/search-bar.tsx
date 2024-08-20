"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CompanySelection } from "@/types";

const companies: CompanySelection[] = [
  {
    company_name: "Amazon.com Inc",
    alias: "Amazon",
    ticker: "AMZN",
  },
  {
    company_name: "Microsoft Corp",
    alias: "Microsoft",
    ticker: "MSFT",
  },
  {
    company_name: "Tesla Inc",
    alias: "Tesla",
    ticker: "TSLA",
  },
  {
    company_name: "Alphabet Inc",
    alias: "Google",
    ticker: "GOOG",
  },
  {
    company_name: "Netflix Inc",
    alias: "Netflix",
    ticker: "NFLX",
  },
  {
    company_name: "Apple Inc",
    alias: "Apple",
    ticker: "AAPL",
  },
  {
    company_name: "Nvidia Corp",
    alias: "Nvidia",
    ticker: "NVDA",
  }
];

export function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const [filteredCompanies, setFilteredCompanies] = useState<CompanySelection[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanySelection | undefined>(undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedCompany(undefined);

    if (value) {
      const filtered = companies
        .filter(
          (company) =>
            
            company.company_name.toLowerCase().startsWith(value.toLowerCase()) ||
            company.alias.toLowerCase().startsWith(value.toLowerCase()) ||
            company.ticker.toLowerCase().startsWith(value.toLowerCase()) ||
            `${company.company_name} (${company.ticker})`.toLowerCase().startsWith(value.toLowerCase())
        )
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
    if (e.key === 'Enter' && filteredCompanies.length > 0) {
      const firstCompany = filteredCompanies[0];
      setQuery(`${firstCompany.company_name} (${firstCompany.ticker})`);
      setSelectedCompany(firstCompany);
      setFilteredCompanies([]);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search"
        className={cn("h-12 w-[800px] rounded-2xl")}
      />
      {query && filteredCompanies.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-2xl shadow-lg max-h-48 overflow-y-auto">
          {filteredCompanies.map((company) => (
            <li
              key={company.ticker}
              onClick={() => handleSelectItem(company)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {company.company_name} ({company.ticker})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
