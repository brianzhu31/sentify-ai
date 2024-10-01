"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { processMessage } from "./actions/chat";
import { useUserSession } from "@/context/user-session-context";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState("");
  const router = useRouter();
  const { session } = useUserSession();

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    if (e.key === "Enter" && message.trim() !== "") {
      try {
        const response = await processMessage(message, session?.access_token);

        if (response.status === "ok") {
          router.push(`/chat/${response.chat_id}`);
        }
  
        setMessage(""); // Clear the input after the message is processed
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  };
  

  return (
    <div className="h-[100vh] flex flex-col justify-end p-4">
      <Input
        className="w-96"
        placeholder="Type your message and press Enter..."
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleSubmit}
      />
    </div>
  );
}
