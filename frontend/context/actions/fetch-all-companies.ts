"use server";

import axios from "axios";
import { CompanyPartial } from "@/types";

export const fetchAllCompaniesFull = async (apiUrl: string): Promise<CompanyPartial[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/full`);
    const companiesData = response.data;

    return companiesData;
  } catch (err) {
    throw err;
  }
};

export const fetchAllCompaniesPartial = async (apiUrl: string): Promise<CompanyPartial[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/partial`);
    const companiesData = response.data;

    return companiesData;
  } catch (err) {
    throw err;
  }
};