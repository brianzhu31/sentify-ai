"use server";

import { CompanyFull } from "@/types";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchAllCompaniesWithScore = async (): Promise<CompanyFull[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/full?score=true`);
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
