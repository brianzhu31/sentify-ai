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

export type ArticleFullSource = {
  title: string;
  clean_url: string;
  media: string;
  published_date: number;
  text: string;
  ticker: string;
  url: string;
};

export type ArticleSourceMatch = {
  id: string;
  metadata: ArticleFullSource;
  score: number;
  values: number[];
};

export type SendMessageResponse = {
  message: string;
  sources: ArticleSourceMatch[];
  chat_id?: string;
};

const formatContent = (content: string) => {
  const parts = content.split(/(\*\*.*?\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ChatPage = () => {
  const { session } = useUserSession();
  const pathname = usePathname();
  const [responseData, setResponseData] = useState("");
  const [message, setMessage] = useState<string>("");
  const [isAssistantRunning, setIsAssistantRunning] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatID = pathname.split("/").pop() || "";

  const getChatSession = async () => {
    if (!session?.access_token) {
      return null;
    }
    const fetchChatSessionResponse = await fetchChatSession(
      chatID,
      session?.access_token
    );
    if (fetchChatSessionResponse.success) {
      setChatMessages(fetchChatSessionResponse.data.messages);
    } else {
      toast({
        variant: "error",
        description: fetchChatSessionResponse.error,
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
      const fetchRelevantArticlesResponse = await fetchRelevantArticles(
        firstMessage,
        chatID,
        session?.access_token
      );

      let context = fetchRelevantArticlesResponse.data;

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
        const processMessageResponse = await processMessage(
          message,
          session?.access_token,
          chatID
        );

        if (processMessageResponse.success) {
          setChatMessages((prevChatMessages: Message[]) => [
            ...prevChatMessages,
            {
              content: message,
              role: "user",
            },
          ]);

          if (processMessageResponse.data.status === "ok") {
            const fetchRelevantArticlesResponse = await fetchRelevantArticles(
              message,
              chatID,
              session?.access_token
            );

            if (fetchRelevantArticlesResponse.success) {
              let context = fetchRelevantArticlesResponse.data;

              const streamedOutput = await getStream(message, context);

              setResponseData("");

              if (
                streamedOutput?.toLowerCase().startsWith("no relevant data")
              ) {
                context = [];
              }

              context = context.map((article: ArticleFullSource) => ({
                ...(({ text, ticker, ...rest }) => rest)(article),
              }));
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

              const saveOutputResponse = await saveOutput(
                sendResponse,
                session?.access_token
              );
              if (!saveOutputResponse.success) {
                toast({
                  variant: "error",
                  description: saveOutputResponse.error,
                });
              }
            } else {
              toast({
                variant: "error",
                description: fetchRelevantArticlesResponse.error,
              });
            }
          } else if (processMessageResponse.data.status === "not accepted") {
            setResponseData(processMessageResponse.data.message);
          }
        } else {
          toast({
            variant: "error",
            description: processMessageResponse.error,
          });
        }
        setIsAssistantRunning(false);
      } catch (err: any) {
        setIsAssistantRunning(false);
        toast({
          variant: "error",
          description: "An unexpected error occurred.",
        });
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    getChatSession();
  }, [session]);

  useEffect(() => {
    if (chatMessages && chatMessages.length == 1) {
      loadUpFirstMessage();
    }
  }, [chatMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, responseData]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col w-full max-w-4xl mx-auto gap-6 p-6 rounded-lg bg-white">
          {chatMessages &&
            chatMessages.map((message: Message, index: number) => (
              <div
                key={index}
                className="border-solid border-[1px] p-2 rounded-md"
              >
                <div className="px-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    {message.role}
                  </p>
                  <p className="text-base text-gray-800 whitespace-pre-wrap break-words">
                    {formatContent(message.content)}
                  </p>
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
              <div className="px-2">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  assistant
                </p>
                <p className="text-base text-gray-800 whitespace-pre-wrap">
                  {formatContent(responseData)}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="pb-4 px-4">
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
  );
};

export default ChatPage;
