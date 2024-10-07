"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { processMessage } from "./actions/chat";
import { useUserSession } from "@/context/user-session-context";
import { useChatHistory } from "@/context/chat-history-context";
import { useRouter } from "next/navigation";
import { ChatItem } from "@/types";

export default function ChatPage() {
  const { chatHistory, setChatHistory, pageNumber, setPageNumber } =
    useChatHistory();
  const [message, setMessage] = useState<string>("");
  const [isMessageSent, setIsMessageSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const { session } = useUserSession();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!session?.access_token) {
      return null;
    }
    if (isMessageSent) {
      return;
    }
    if (e.key === "Enter" && message.trim() !== "") {
      try {
        setIsMessageSent(true);
        setMessage("");
        setErrorMessage("");
        const response = await processMessage(message, session?.access_token);

        if (response.status === "ok") {
          setMessage("");
          const newChatSession: ChatItem = {
            chat_id: response.chat_id,
            name: response.chat_name,
            href: `/chat/${response.chat_id}`,
            last_accessed: response.timestamp,
          };
          setChatHistory({
            ...chatHistory,
            chats: [newChatSession, ...chatHistory.chats],
          });
          router.push(`/chat/${response.chat_id}`);
        } else {
          setIsMessageSent(false);
          setErrorMessage(response.message);
        }
      } catch (error) {
        setIsMessageSent(false);
        console.error("Error processing message:", error);
      }
    }
  };

  return (
    <div className="h-[100vh] flex flex-col justify-end p-4">
      <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
        {errorMessage && (
          <div>
            <p className="font-semibold">assistant</p>
            <p className="border-2 border-solid">{errorMessage}</p>
          </div>
        )}
      </div>
      <Input
        className="w-96"
        placeholder="Enter message"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleSubmit}
        disabled={isMessageSent}
      />
    </div>
  );
}
