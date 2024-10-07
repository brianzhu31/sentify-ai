"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserSession } from "@/context/user-session-context";
import { useChatHistory } from "@/context/chat-history-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "./infinite-scroll";
import { Loader2 } from "lucide-react";
import { ChatHistorySublist } from "./chat-history-sublist";
import { fetchChats } from "../actions/chat";
import { ChatItem } from "@/types";
import { isToday, isWithinInterval, subDays } from "date-fns";


export function ChatHistoryContent() {
  const { session } = useUserSession();
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const { chatHistory, setChatHistory, pageNumber, setPageNumber } =
    useChatHistory();

  if (!session) {
    return null;
  }

  const fetchMoreChats = async () => {
    if (chatHistory.has_more) {
      setLoadingMore(true);

      setTimeout(async () => {
        const data = await fetchChats(session.access_token, pageNumber);
        console.log("chat history", data);
        setChatHistory({
          label: data.label,
          chats: [...chatHistory.chats, ...data.chats],
          has_more: data.has_more,
        });
        setPageNumber(pageNumber + 1);
        setLoadingMore(false);
      }, 500);
    }
  };

  const categorizeChats = (chats: ChatItem[]) => {
    const today: ChatItem[] = [];
    const yesterday: ChatItem[] = [];
    const last7Days: ChatItem[] = [];
    const last30Days: ChatItem[] = [];
    const older: ChatItem[] = [];

    chats.forEach((chat) => {
      const lastAccessedDate = new Date(chat.last_accessed);

      if (isToday(lastAccessedDate)) {
        today.push(chat);
      } else if (
        isWithinInterval(lastAccessedDate, {
          start: subDays(new Date(), 1),
          end: new Date(),
        })
      ) {
        yesterday.push(chat);
      } else if (
        isWithinInterval(lastAccessedDate, {
          start: subDays(new Date(), 7),
          end: subDays(new Date(), 1),
        })
      ) {
        last7Days.push(chat);
      } else if (
        isWithinInterval(lastAccessedDate, {
          start: subDays(new Date(), 30),
          end: subDays(new Date(), 7),
        })
      ) {
        last30Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, yesterday, last7Days, last30Days, older };
  };

  const { today, yesterday, last7Days, last30Days, older } = categorizeChats(
    chatHistory?.chats || []
  );

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 pr-2">
          <li className={cn("w-full", chatHistory.label ? "pt-5" : "")}>
            <ChatHistorySublist chatList={today} label="Today"/>
            <ChatHistorySublist chatList={yesterday} label="Yesterday"/>
            <ChatHistorySublist chatList={last7Days} label="Previous 7 Days"/>
            <ChatHistorySublist chatList={last30Days} label="Previous 30 Days"/>
            <ChatHistorySublist chatList={older} label="Older"/>
            <InfiniteScroll
              hasMore={chatHistory.has_more}
              isLoading={loadingMore}
              next={fetchMoreChats}
              threshold={0}
            >
              {chatHistory.has_more && (
                <div className="flex justify-center">
                  <Loader2 className="mt-2 mb-4 h-4 w-4 animate-spin" />
                </div>
              )}
            </InfiniteScroll>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
