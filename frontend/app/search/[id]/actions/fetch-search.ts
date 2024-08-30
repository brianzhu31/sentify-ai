"use server";

import axios from "axios";
import { SearchData } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchSearchData = async (
  search_id: string,
  accessToken: string
): Promise<SearchData> => {
  try {
    const response = await axios.get(`${apiUrl}/api/search/get_search/${search_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
