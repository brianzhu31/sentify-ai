"use server";

import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const deleteSearch = async (accessToken: string, searchId: string) => {
  try {
    const response = await axios.delete(`${apiUrl}/api/search/delete/${searchId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    return response.data;
  }
  catch(err) {
    throw err;
  }
};
