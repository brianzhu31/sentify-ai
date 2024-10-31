"use server";

import axios from "axios";
import { CompanyPartial, CompanyFull } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchAllCompaniesFull = async (): Promise<CompanyFull[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/full`);
    const companiesData = response.data;

    return companiesData;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const fetchAllCompaniesPartial = async (): Promise<CompanyPartial[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/partial`);
    const companiesData = response.data;

    return companiesData;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
