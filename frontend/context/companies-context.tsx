"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { CompanyPartial } from "@/types";

interface CompaniesContextType {
  companies: CompanyPartial[];
}

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchAllCompaniesPartial = async (): Promise<CompanyPartial[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/partial`);
    const companiesData = response.data;

    return companiesData;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const CompaniesContext = createContext<CompaniesContextType | undefined>(
  undefined
);

export const CompaniesProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<CompanyPartial[]>([]);

  useEffect(() => {
    const getCompanies = async () => {
      try {
        const data = await fetchAllCompaniesPartial();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
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
