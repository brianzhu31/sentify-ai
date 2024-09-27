"use server";

import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function fetchRelevantArticles(message: string) {
  try {
    const response = await axios.post(`${apiUrl}/api/chat/retrieve`, {
      message,
    });

    return response.data;
  } catch (error) {
    throw new Error("Error retrieving articles");
  }
}
