"use server";

import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function processMessage(message: string, accessToken: string) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/send`,
      {
        message: message,
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

export async function fetchChatSession(chatID: string, accessToken: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/api/chat/get/${chatID}`,

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

export async function fetchRelevantArticles(
  message: string,
  accessToken: string
) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/retrieve`,
      {
        message: message,
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

export async function saveOutput(sendResponse: any, accessToken: string) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/save_output`,
      sendResponse,
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
