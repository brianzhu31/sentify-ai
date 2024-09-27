"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { fetchChatStream } from "../actions/stream";
import { saveOutput, fetchRelevantArticles } from "../actions/chat";
import { useUserSession } from "@/context/user-session-context";

const ChatPage = () => {
  const [responseData, setResponseData] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useUserSession();
  const pathname = usePathname();

  useEffect(() => {
    const getStream = async () => {
      try {
        const context = await fetchRelevantArticles(message, session?.access_token);
      } catch (e: any) {
        console.log(e)
      }

      console.log("context", context);
      const stream = await fetchChatStream(message, context.data); // Get the stream

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
        sources: context.data,
        chat_id: context.chat_id,
      };

      const finalOutput = await saveOutput(sendResponse, session?.access_token);
    };

    const message = searchParams.get("message");
    console.log(message)
    if (message) {
        getStream();
        router.replace(pathname);
    }
  }, []);

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
