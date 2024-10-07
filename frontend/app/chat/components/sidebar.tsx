"use client";

import Link from "next/link";
import { useUserSession } from "@/context/user-session-context";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/useStore";
import { ChatHistoryContent } from "./chat-history";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { SidebarToggle } from "./sidebar-toggle";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChatBubbleIcon, HomeIcon } from "@radix-ui/react-icons";

export function Sidebar() {
  const { user } = useUserSession();
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-[260px]"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 shadow-md dark:shadow-zinc-800">
        <div className={sidebar?.isOpen ? "py-4 border-b" : ""}>
          {/* <HomeIcon width={24} height={24}/> */}
          <p
            className={cn(
              "text-m text-center font-semibold whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
              sidebar?.isOpen === false
                ? "-translate-x-96 opacity-0 hidden"
                : "translate-x-0 opacity-100"
            )}
          >
            Market Sentry
          </p>
        </div>
        {sidebar?.isOpen && (
          <ChatHistoryContent />
        )}
        <div className="mt-auto p-2 border-t">
          <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 mb-1"
                  asChild
                >
                  <Link href="/chat">
                    <span
                      className={cn(sidebar?.isOpen === false ? "" : "mr-4")}
                    >
                      <ChatBubbleIcon />
                    </span>
                    <p
                      className={cn(
                        "max-w-[200px] truncate",
                        sidebar?.isOpen === false
                          ? "-translate-x-96 opacity-0"
                          : "translate-x-0 opacity-100"
                      )}
                    >
                      New Chat
                    </p>
                  </Link>
                </Button>
              </TooltipTrigger>
              {sidebar?.isOpen === false && (
                <TooltipContent side="right">New Chat</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}
