"use server";

import axios from "axios";
import { CompanyPartial, CompanyFull } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchAllCompaniesFull = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/full`);

    return {
      success: true,
      data: response.data as CompanyFull
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

export const fetchAllCompaniesPartial = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/all/partial`);

    return {
      success: true,
      data: response.data as CompanyPartial[]
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
