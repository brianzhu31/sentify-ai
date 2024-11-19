"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";
import { UserDropdown } from "./user-dropdown";
import { useUserSession } from "@/context/user-session-context";
import Link from "next/link";
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";

export function Navbar() {
  const { user } = useUserSession();
  const [showSearch, setShowSearch] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-10 w-full bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {!showSearch ? (
          <>
            <div className="flex items-center gap-4 w-full">
              <Link href="/">
                <p className="text-xl font-bold whitespace-nowrap">
                  Market Sentry
                </p>
              </Link>
              <div className="hidden ml-8 sm:block lg:w-[60%] md:w-[75%] w-[85%] mr-4">
                <SearchBar />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="block sm:hidden p-2 text-gray-700 hover:text-gray-900"
                onClick={() => setShowSearch(true)}
              >
                <MagnifyingGlassIcon width={28} height={28} />
              </button>
              {user && (
                <Link href="/chat">
                  <Button>Chat</Button>
                </Link>
              )}
              <UserDropdown />
            </div>
          </>
        ) : (
          <div className="flex w-full items-center">
            <div className="flex-grow">
              <SearchBar />
            </div>
            <button
              className="p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setShowSearch(false)}
            >
              <Cross1Icon width={28} height={28} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
