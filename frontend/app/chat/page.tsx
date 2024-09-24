"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { fetchChatStream } from "./actions/chat";
import { fetchRelevantArticles } from "./actions/retrieve";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState("");

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    if (e.key === "Enter" && message.trim() !== "") {
      try {
        const context = await fetchRelevantArticles(message);

        console.log("context", context);
        const stream = await fetchChatStream(message, context); // Get the stream

        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");

        // Reset the output on new message
        setResponseData("");

        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
          
          // Append new chunk to the output
          setResponseData((prev) => prev + chunk);
        }

        setMessage(""); // Clear the input after the message is processed
      } catch (error) {
        console.error("Error streaming message:", error);
      }
    }
  };

  return (
    <div className="h-[100vh] flex flex-col justify-end p-4">
      <div className="mb-4 p-4 bg-gray-100 rounded-lg overflow-y-auto max-h-[80vh]">
        {/* Ensure the preformatted text wraps and doesn’t overflow horizontally */}
        <pre className="whitespace-pre-wrap break-words max-w-full overflow-x-auto">
          {responseData}
        </pre>
      </div>
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
