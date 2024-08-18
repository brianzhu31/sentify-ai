import axios from "axios";
import { SearchItem, SearchHistoryData } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

const isSearchIdInPathname = (pathname: string, href: string): boolean => {
  console.log(pathname, href)
  return pathname === href;
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
        active: isSearchIdInPathname(pathname, search.href),
      })),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
