"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "./components/search-bar";
import { Loading } from "./components/loading";

export default function SearchPage() {
  const [loading, setLoading] = useState<boolean>(false);

  if (loading) {
    return (
      <Loading loading={loading} />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SearchBar setLoading={setLoading}></SearchBar>
    </div>
  );
}
