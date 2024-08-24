"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SearchBar } from "./components/search-bar";
import { Spinner } from "@/components/ui/spinner";

export default function SearchPage() {
  const [loading, setLoading] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-1">
        <Spinner className={cn("size-24")} strokeWidth={0.6}></Spinner>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SearchBar setLoading={setLoading}></SearchBar>
    </div>
  );
}
