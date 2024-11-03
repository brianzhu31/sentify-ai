"use client";

import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";
import { UserDropdown } from "./user-dropdown";
import { useUserSession } from "@/context/user-session-context";
import Link from "next/link";

export function Navbar() {
  const { user } = useUserSession();
  return (
    <header className="sticky top-0 z-10 w-full bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4 w-full">
          <Link href="/">
            <p className="text-xl font-bold whitespace-nowrap">Market Sentry</p>
          </Link>
          <div className="hidden ml-8 sm:block lg:w-[60%] md:w-[75%] w-[85%]">
            <SearchBar />
          </div>
        </div>
        <div className="flex items-center gap-8">
          {user && (
            <Link href="/chat">
              <Button>Chat</Button>
            </Link>
          )}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
