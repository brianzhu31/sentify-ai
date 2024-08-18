import axios from "axios";
import { SearchItem, SearchHistoryData } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

const isSearchIdInPathname = (pathname: string, searchId: number): boolean => {
  const match = pathname.match(/\/search\/(\d+)$/);

  if (match) {
    const extractedId = match[1];
    return extractedId === searchId.toString();
  }

  return false;
};

export const fetchSearchHistory = async (
  pathname: string,
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
        active: isSearchIdInPathname(pathname, search.search_id),
      })),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
