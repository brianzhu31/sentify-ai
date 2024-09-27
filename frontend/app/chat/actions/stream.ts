"use client";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function fetchChatStream(message: string, context: any) {
  const response = await fetch(`${apiUrl}/api/chat/inference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, context }),
  });

  if (!response.body) {
    throw new Error("Streaming not supported!");
  }

  return response.body;
}
