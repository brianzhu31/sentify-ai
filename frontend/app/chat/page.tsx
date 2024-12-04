"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { processMessage } from "./actions/chat";
import { useUserSession } from "@/context/user-session-context";
import { useChatHistory } from "@/context/chat-history-context";
import { useRouter } from "next/navigation";
import { ChatItem } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export default function ChatPage() {
  const { chatHistory, setChatHistory, pageNumber, setPageNumber } =
    useChatHistory();
  const [message, setMessage] = useState<string>("");
  const [isMessageSent, setIsMessageSent] = useState<boolean>(false);
  const router = useRouter();
  const { session } = useUserSession();
  const { toast } = useToast();

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
          toast({
            variant: "error",
            description: response.message,
          });
          setIsMessageSent(false);
        }
      } catch (err: any) {
        setIsMessageSent(false);
        toast({
          variant: "error",
          description: err.message,
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex flex-col gap-2 py-4">
          <p className="text-center text-3xl font-semibold">
            What can I help you with?
          </p>
          <p className="text-center text-sm text-gray-600">
            Ask finance related questions
          </p>
        </div>
        <div className="w-full max-w-2xl px-4">
          <Input
            className="w-full h-12 backdrop-blur-sm"
            placeholder="Enter message"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleSubmit}
            disabled={isMessageSent}
          />
        </div>
      </div>
    </div>
  );
}
