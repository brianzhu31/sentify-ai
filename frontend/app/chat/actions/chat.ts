"use server";

import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function fetchRelevantArticles(message: string, accessToken: string) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/send`,
      {
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function saveOutput(message: any, accessToken: string) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/save_output`,
      message,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Error saving assistant output");
  }
}
