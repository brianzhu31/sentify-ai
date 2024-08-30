"use server";

import axios from "axios";
import { SearchHistoryData } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchSearchHistory = async (
  accessToken: string,
  pageNumber?: number
): Promise<SearchHistoryData> => {
  try {
    const response = await axios.get(`${apiUrl}/api/search/search_history?page=${pageNumber}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
