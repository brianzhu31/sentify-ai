"use client";

import { ArticleSourceMatch } from "../[id]/page";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function fetchChatStream(
  accessToken: string,
  message: string,
  context: ArticleSourceMatch[],
  chat_id: string
) {
  const response = await fetch(`${apiUrl}/api/chat/inference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message, context, chat_id }),
  });

  if (!response.body) {
    throw new Error("Streaming not supported!");
  }

  return response.body;
}
