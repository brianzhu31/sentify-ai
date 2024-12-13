"use server";

import axios from "axios";
import { CompanyFull, CompanyAnalytics, PaginatedArticlesData, TimeSeries, StockPriceData } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchCompanyData = async (
  ticker: string
) => {
  try {
    const response = await axios.get(`${apiUrl}/api/company/${ticker}`);
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

export const fetchAnalytics = async (
  ticker: string
) => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/company/analytics/${ticker}`
    );
    return {
      success: true,
      data: response.data as CompanyAnalytics
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

export const fetchTimeSeries = async (ticker: string) => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/company/stock/time_series/${ticker}`
    );
    return {
      success: true,
      data: response.data as TimeSeries
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

export const fetchStockPrice = async (ticker: string) => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/company/stock/price/${ticker}`
    );
    return {
      success: true,
      data: response.data as StockPriceData
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

export const fetchArticles = async (
  ticker: string,
  page: number,
  limit: number
) => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/article/${ticker}?page=${page}&limit=${limit}`
    );
    return {
      success: true,
      data: response.data as PaginatedArticlesData
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
