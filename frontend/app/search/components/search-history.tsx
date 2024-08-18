"use client";

import Link from "next/link";
import { SearchHistoryData, SearchItem } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateInUserTimezone } from "@/utils/time";

interface MenuProps {
  searchHistory: SearchHistoryData;
}

export function SearchHistoryContent({ searchHistory }: MenuProps) {
  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-4 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 pr-2">
          <li className={cn("w-full", searchHistory.label ? "pt-5" : "")}>
            <p className="text-m font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
              {searchHistory.label}
            </p>
            {searchHistory &&
              searchHistory.searches &&
              searchHistory.searches.map(
                ({ href, ticker, active, created_at }, index) => (
                  <div className="w-full pr-2" key={index}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className="w-full justify-start h-10 mb-1"
                      asChild
                    >
                      <Link href={href}>
                        <div className="flex justify-between items-center w-full">
                          <p
                            className={cn(
                              "text-sm max-w-[200px] truncate translate-x-0 opacity-100"
                            )}
                          >
                            {ticker}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateInUserTimezone(created_at)}
                          </p>
                        </div>
                      </Link>
                    </Button>
                  </div>
                )
              )}
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
