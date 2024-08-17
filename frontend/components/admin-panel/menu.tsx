"use client";

import Link from "next/link";
import { SearchHistoryData, SearchItem } from "@/types";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import { logout } from "@/utils/auth";


interface MenuProps {
  isOpen: boolean | undefined;
  searchHistory: SearchHistoryData;
}

export function Menu({ isOpen, searchHistory }: MenuProps) {

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout();
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          <div className="w-full">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 mb-1"
                    asChild
                  >
                    <Link href="/search">
                      <span className={cn(isOpen === false ? "" : "mr-4")}>
                        <Search size={18} />
                      </span>
                      <p
                        className={cn(
                          "max-w-[200px] truncate",
                          isOpen === false
                            ? "-translate-x-96 opacity-0"
                            : "translate-x-0 opacity-100"
                        )}
                      >
                        New Search
                      </p>
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">New Search</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <li className={cn("w-full", searchHistory.label ? "pt-5" : "")}>
            {(isOpen && searchHistory.label) || isOpen === undefined ? (
              <p className="text-m font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                {searchHistory.label}
              </p>
            ) : (
              <p className="pb-2"></p>
            )}
            {searchHistory &&
              searchHistory.searches &&
              searchHistory.searches.map(
                ({ href, label, active}, index) => (
                  <div className="w-full" key={index}>
                    <TooltipProvider disableHoverableContent>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={active ? "secondary" : "ghost"}
                            className="w-full justify-start h-10 mb-1"
                            asChild
                          >
                            {isOpen ? (
                              <Link href={href}>
                                <p
                                  className={cn(
                                    "text-s max-w-[200px] truncate translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            ) : (
                              <p
                                className={cn(
                                  "text-s max-w-[200px] truncate -translate-x-96 opacity-0"
                                )}
                              >
                                {label}
                              </p>
                            )}
                          </Button>
                        </TooltipTrigger>
                        {isOpen === false && (
                          <TooltipContent side="right">{label}</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              )}
          </li>
          <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-center h-10 mt-5"
                  >
                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap",
                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                      )}
                    >
                      Sign out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Sign out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
