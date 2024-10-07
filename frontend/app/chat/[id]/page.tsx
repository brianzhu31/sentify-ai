"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { fetchChatStream } from "../actions/stream";
import {
  saveOutput,
  fetchRelevantArticles,
  fetchChatSession,
} from "../actions/chat";
import { useUserSession } from "@/context/user-session-context";
import { Input } from "@/components/ui/input";
import { processMessage } from "../actions/chat";
import { useToast } from "@/components/ui/use-toast";

export type ArticleSource = { 
  article_title: string;
  clean_url: string;
  media: string;
  published_date: Date;
  text: string;
  ticker: string;
  url: string;
}

export type Message = {
  role: string;
  content: string;
  sources?: ArticleSource[];
}

export type ChatSession = {
  chat_id: string;
  user_id: string;
  name: string;
  created_at: Date;
  last_accessed: Date;
  messages: Message[];
}

export type ArticleSourceMatch = {
  id: string;
  metadata: ArticleSource;
  score: number;
  values: number[];
}

export type SendMessageResponse = {
  message: string;
  sources: ArticleSourceMatch[];
  chat_id?: string;
}

const ChatPage = () => {
  const { session } = useUserSession();
  const pathname = usePathname();
  const [responseData, setResponseData] = useState("");
  const [message, setMessage] = useState<string>("");
  const [isAssistantRunning, setIsAssistantRunning] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const chatID = pathname.split("/").pop() || "";

  const getChatSession = async () => {
    if (!session?.access_token) {
      return null;
    }
    try {
      const fetchedChatSessionData = await fetchChatSession(
        chatID,
        session?.access_token
      );
      console.log(fetchedChatSessionData);
      setChatMessages(fetchedChatSessionData.messages);
    } catch (err: any) {
      toast({
        variant: "error",
        description: err.message,
      });
    }
  };

  const getStream = async (message: string, context: ArticleSourceMatch[]) => {
    if (!session?.access_token) {
      return;
    }
    if (isAssistantRunning) {
      return;
    }
    const stream = await fetchChatStream(session?.access_token, message, context, chatID);

    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");

    setResponseData("");
    let output = "";

    let done = false;
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      const chunk = decoder.decode(value || new Uint8Array(), {
        stream: true,
      });
      setResponseData((prev) => prev + chunk);
      output += chunk;
    }

    return output;
  };

  const loadUpFirstMessage = async () => {
    if (!session?.access_token) {
      return;
    }
    if (isAssistantRunning) {
      return;
    }

    const firstMessage = chatMessages[0]?.content;

    if (firstMessage) {
      setIsAssistantRunning(true);
      const context = await fetchRelevantArticles(
        firstMessage,
        session?.access_token
      );

      const streamedOutput = await getStream(firstMessage, context);
      setIsAssistantRunning(false);

      setResponseData("");
      setChatMessages((prevChatMessages: Message[]) => [
        ...prevChatMessages,
        {
          content: streamedOutput || "",
          role: "assistant",
          sources: context
        },
      ]);

      const sendResponse = {
        message: streamedOutput || "",
        sources: context,
        chat_id: chatID,
      };
      console.log(sendResponse);

      await saveOutput(sendResponse, session?.access_token);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!session?.access_token) {
      return;
    }
    if (e.key === "Enter" && message.trim() !== "") {
      setMessage("");
      setResponseData("");
      setIsAssistantRunning(true);
      try {
        const response = await processMessage(
          message,
          session?.access_token,
          chatID
        );

        setChatMessages((prevChatMessages: Message[]) => [
          ...prevChatMessages,
          {
            content: message,
            role: "user",
          },
        ]);

        if (response.status === "ok") {

          const context = await fetchRelevantArticles(
            message,
            session?.access_token
          );

          console.log("context....", context);

          const streamedOutput = await getStream(message, context);

          setResponseData("");
          setChatMessages((prevChatMessages: Message[]) => [
            ...prevChatMessages,
            {
              content: streamedOutput || "",
              role: "assistant",
              sources: context
            },
          ]);

          const sendResponse: SendMessageResponse = {
            message: streamedOutput || "",
            sources: context,
            chat_id: chatID,
          };
          console.log(sendResponse);

          await saveOutput(sendResponse, session?.access_token);
        }
        else if (response.status == "not accepted") {
          setResponseData(response.message);
        }
        setIsAssistantRunning(false);

      } catch (error) {
        setIsAssistantRunning(false);
        console.error("Error processing message:", error);
      }
    }
  };

  useEffect(() => {
    getChatSession();
  }, [session]);

  useEffect(() => {
    console.log("chat session", chatMessages)
    if (chatMessages && chatMessages.length == 1) {
      loadUpFirstMessage();
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responseData]);

  return (
    <div className="h-[100vh] flex flex-col p-4">
      <div ref={containerRef} className="flex flex-col gap-4 overflow-y-auto flex-grow">
        {chatMessages &&
          chatMessages.map((message: Message, index: number) => (
            <div key={index}>
              <p className="font-semibold">{message.role}</p>
              <p className="border-2 border-solid">{message.content}</p>
            </div>
          ))}
        {responseData && (
          <div>
            <p className="font-semibold">assistant</p>
            <p className="border-2 border-solid">{responseData}</p>
          </div>
        )}
      </div>
      <Input
        className="w-96"
        placeholder="Enter message"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleSubmit}
        disabled={isAssistantRunning}
      />
    </div>
  );
};

export default ChatPage;
