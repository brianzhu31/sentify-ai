import axios from "axios";
import { SearchItem, SearchHistoryData } from "@/types";

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

    return {
      ...response.data,
      searches: response.data.searches.map((search: SearchItem) => ({
        ...search
      })),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
