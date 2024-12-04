"use server";

import axios from "axios";
import { PaginatedChatHistoryData } from "@/types";
import { SendMessageResponse } from "../[id]/page";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchChats = async (
  accessToken: string,
  pageNumber?: number
): Promise<PaginatedChatHistoryData> => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/chat/get_chats?page=${pageNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const deleteChat = async (accessToken: string, chatID: string) => {
  try {
    const response = await axios.delete(`${apiUrl}/api/chat/delete/${chatID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateChatName = async (
  accessToken: string,
  chatID: string,
  newName: string
) => {
  try {
    const response = await axios.put(
      `${apiUrl}/api/chat/rename/${chatID}`,
      {
        new_name: newName
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const processMessage = async (
  message: string,
  accessToken: string,
  chat_id?: string
) => {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/send`,
      {
        message: message,
        ...(chat_id && { chat_id: chat_id }),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const fetchChatSession = async (chatID: string, accessToken: string) => {
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
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const fetchRelevantArticles = async (
  message: string,
  chatID: string,
  accessToken: string
) => {
  try {
    const response = await axios.post(
      `${apiUrl}/api/chat/retrieve`,
      {
        message: message,
        chat_id: chatID
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const saveOutput = async (
  sendResponse: SendMessageResponse,
  accessToken: string
) => {
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
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
