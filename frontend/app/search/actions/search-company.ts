import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const searchCompany = async (
  ticker: string,
  days_ago: number,
  accessToken: string
): Promise<any> => {
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
    console.error('ERROR searching company',err);
    throw err;
  }
};
