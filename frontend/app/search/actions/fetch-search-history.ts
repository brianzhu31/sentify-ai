import axios from "axios";
import { SearchItem, SearchHistoryData } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchSearchHistory = async (
  pathName: string,
  accessToken: string
): Promise<SearchHistoryData> => {
  try {
    const response = await axios.get(`${apiUrl}/api/search/search_history`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("fetch");

    return {
      ...response.data,
      searches: response.data.searches.map((search: SearchItem) => ({
        ...search,
        active: pathName.includes(search.search_id.toString()),
      })),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
