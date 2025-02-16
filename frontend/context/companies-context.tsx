"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { CompanyPartial } from "@/types";
import { fetchAllCompaniesPartial } from "./actions/fetch-all-companies";
import { useToast } from "@/components/ui/use-toast";

interface CompaniesContextType {
  companies: CompanyPartial[];
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(
  undefined
);

export const CompaniesProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<CompanyPartial[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getCompanies = async () => {
      const fetchAllCompaniesPartialResponse = await fetchAllCompaniesPartial();
      if (fetchAllCompaniesPartialResponse.success) {
        if (fetchAllCompaniesPartialResponse.data) {
          setCompanies(fetchAllCompaniesPartialResponse.data);
        }
      } else {
        toast({
          variant: "error",
          description: fetchAllCompaniesPartialResponse.error,
        });
      }
    };

    getCompanies();
  }, []);

  return (
    <CompaniesContext.Provider value={{ companies }}>
      {children}
    </CompaniesContext.Provider>
  );
};

export const useCompanies = () => {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error("useCompanies must be used within a CompaniesProvider");
  }
  return context;
};
