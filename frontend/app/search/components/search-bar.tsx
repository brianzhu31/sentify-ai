"use client";

import React, { useState, useEffect } from "react";
import { CompanyPartial } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/context/companies-context";
import { useUserSession } from "@/context/user-session-context";
import { DaysSelect } from "./days-select";
import { searchCompany } from "../actions/search-company";
import { useToast } from "@/components/ui/use-toast";

interface SearchBarProps {
  setLoading: (loading: boolean) => void;
}

export function SearchBar({ setLoading }: SearchBarProps) {
  const { session } = useUserSession();
  const { companies } = useCompanies();
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [daysAgo, setDaysAgo] = useState<number | null>(null);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyPartial[]>(
    []
  );
  const { toast } = useToast();

  const createFiltered = (value: string) => {
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
    setFilteredCompanies(filtered)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (value) {
      createFiltered(value);
    } else {
      setFilteredCompanies([]);
    }
  };

  const handleInputClick = (event: React.MouseEvent<HTMLElement>) => {
    createFiltered(query);
  }

  const getSearchResponse = async (ticker: string) => {
    if (daysAgo === null) {
      toast({
        variant: "error",
        description: "Please select a time frame.",
      });
    } else {
      if (session?.access_token) {
        try {
          setLoading(true);
          const response = await searchCompany(
            ticker,
            daysAgo,
            session.access_token
          );
          router.push(`/search/${response.search_id_b64}`);
        } catch (err: any) {
          setLoading(false);
          console.log('error__', err)
          toast({
            variant: "error",
            description: err.response.data.message,
          });
        }
      } else {
        console.error("Missing ticker or access token.");
      }
    }
  };

  const handleSelectItem = (company: any) => {
    setQuery(`${company.company_name} (${company.ticker})`);
    setFilteredCompanies([]);
    getSearchResponse(company.ticker);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && filteredCompanies.length > 0) {
      const firstCompany = filteredCompanies[0];
      setQuery(`${firstCompany.company_name} (${firstCompany.ticker})`);
      setFilteredCompanies([]);
      getSearchResponse(firstCompany.ticker);
    }
  };

  return (
    <div className="flex gap-2 lg:w-[60%] md:w-[75%] w-[85%]">
      <div className="relative w-full">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onClick={handleInputClick}
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
      <DaysSelect setDaysAgo={setDaysAgo} />
    </div>
  );
}
