"use server";

import axios from "axios";
import { SearchItem } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const searchCompany = async (
  ticker: string,
  days_ago: number,
  accessToken: string
): Promise<SearchItem> => {
  try {
    const response = await axios.post(
      `${apiUrl}/api/search/search_company`,
      { ticker: ticker, days_ago: days_ago },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data
  } catch (err) {
    throw err;
  }
};
