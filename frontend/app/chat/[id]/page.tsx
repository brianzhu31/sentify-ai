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
import ArticleCard from "./components/article-card";
import { useToast } from "@/components/ui/use-toast";
import { Article } from "@/types";

export type Message = {
  role: string;
  content: string;
  sources?: Article[];
};

export type ChatSession = {
  chat_id: string;
  user_id: string;
  name: string;
  created_at: Date;
  last_accessed: Date;
  messages: Message[];
};

export type ArticleSourceMatch = {
  id: string;
  metadata: Article;
  score: number;
  values: number[];
};

export type SendMessageResponse = {
  message: string;
  sources: ArticleSourceMatch[];
  chat_id?: string;
};

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
    const stream = await fetchChatStream(
      session?.access_token,
      message,
      context,
      chatID
    );

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
      let context = await fetchRelevantArticles(
        firstMessage,
        session?.access_token
      );

      const streamedOutput = await getStream(firstMessage, context);
      if (streamedOutput?.toLowerCase().startsWith("no relevant data")) {
        context = [];
      }

      setResponseData("");
      setChatMessages((prevChatMessages: Message[]) => [
        ...prevChatMessages,
        {
          content: streamedOutput || "",
          role: "assistant",
          sources: context,
        },
      ]);

      const sendResponse = {
        message: streamedOutput || "",
        sources: context,
        chat_id: chatID,
      };
      console.log(sendResponse);
      setIsAssistantRunning(false);

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
          let context = await fetchRelevantArticles(
            message,
            session?.access_token
          );

          console.log("context....", context);

          const streamedOutput = await getStream(message, context);

          setResponseData("");

          if (streamedOutput?.toLowerCase().startsWith("no relevant data")) {
            context = [];
          }
          setChatMessages((prevChatMessages: Message[]) => [
            ...prevChatMessages,
            {
              content: streamedOutput || "",
              role: "assistant",
              sources: context,
            },
          ]);

          const sendResponse: SendMessageResponse = {
            message: streamedOutput || "",
            sources: context,
            chat_id: chatID,
          };
          console.log(sendResponse);

          await saveOutput(sendResponse, session?.access_token);
        } else if (response.status === "not accepted") {
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
    console.log("chat session", chatMessages);
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
    <>
      <div className="h-screen flex flex-col relative">
        <div className="flex-1 overflow-y-auto">
          <div
            ref={containerRef}
            className="flex flex-col w-full max-w-4xl mx-auto gap-6 p-6 rounded-lg bg-white"
          >
            {chatMessages &&
              chatMessages.map((message: Message, index: number) => (
                <div
                  key={index}
                  className="border-solid border-[1px] p-2 rounded-md"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      {message.role}
                    </p>
                    <p className="text-base text-gray-800">{message.content}</p>
                  </div>
                  {message?.sources && message?.sources.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                      {message.sources?.map((article, index) => (
                        <ArticleCard key={index} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            {responseData && (
              <div className="border-solid border-[1px] p-2 rounded-md">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  assistant
                </p>
                <p className="text-base text-gray-800">{responseData}</p>
              </div>
            )}
          </div>
        </div>
        <div className="pb-6">
          <div className="max-w-4xl mx-auto">
            <Input
              className="w-full h-12 text-sm rounded-lg"
              placeholder="Enter your message..."
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleSubmit}
              disabled={isAssistantRunning}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
