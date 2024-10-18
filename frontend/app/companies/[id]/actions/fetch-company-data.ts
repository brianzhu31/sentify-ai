"use server";

import axios from "axios";
import { CompanyFull, CompanyAnalytics } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchCompanyData = async (
  ticker: string
): Promise<CompanyFull> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/${ticker}`);
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const fetchAnalytics = async (
  ticker: string
): Promise<CompanyAnalytics> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/analytics/${ticker}`);
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
