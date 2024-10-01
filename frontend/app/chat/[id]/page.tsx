"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { fetchChatStream } from "../actions/stream";
import {
  saveOutput,
  fetchRelevantArticles,
  fetchChatSession,
} from "../actions/chat";
import { useUserSession } from "@/context/user-session-context";

const ChatPage = () => {
  const [responseData, setResponseData] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useUserSession();
  const pathname = usePathname();
  const hasRun = useRef(false);

  useEffect(() => {
    const getStream = async () => {
      if (!session?.access_token) {
        console.log("Session or access token not available.");
        return;
      }

      if (hasRun.current) {
        return; // Prevent running twice
      }
      hasRun.current = true; // Mark as run after the first execution

      const chatID = pathname.split("/").pop();
      const chatSession = await fetchChatSession(chatID, session?.access_token);

      console.log("chat session", chatSession);

      if (chatSession.length > 1) {
        return;
      }

      const firstMessage = chatSession[0].content;
      const context = await fetchRelevantArticles(
        firstMessage,
        session?.access_token
      );

      console.log(context);

      const stream = await fetchChatStream(firstMessage, context); // Get the stream

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");

      // Reset the output on new message
      setResponseData("");
      let output = "";

      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        const chunk = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });

        // Append new chunk to the output
        setResponseData((prev) => prev + chunk);
        output += chunk;
      }

      const sendResponse = {
        message: output,
        sources: context,
        chat_id: chatID,
      };
      console.log(sendResponse);

      await saveOutput(sendResponse, session?.access_token);
    };

    getStream();
  }, [session]);

  return (
    <div>
      <h1>Chat</h1>
      <div>
        <p>Response:</p>
        <pre>{responseData}</pre>
      </div>
    </div>
  );
};

export default ChatPage;
