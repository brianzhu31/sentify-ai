"use server";

import { CompanyFull } from "@/types";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchAllCompaniesWithScore = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/full?score=true`);

    return {
      success: true,
      data: response.data as CompanyFull[]
    };
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      return {
        success: false,
        error: err.response.data.message
      };
    } else {
      return {
        success: false,
        error: "An unexpected error occurred"
      };
    }
  }
};
