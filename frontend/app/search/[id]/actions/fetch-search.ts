import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchSearchData = async (
  search_id: number,
  accessToken: string
): Promise<any> => {
  try {
    const response = await axios.get(`${apiUrl}/api/search/get_search/${search_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
