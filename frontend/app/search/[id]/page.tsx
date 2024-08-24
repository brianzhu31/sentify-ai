"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/context/user-session-context";
import { fetchSearchData } from "./actions/fetch-search";
import { usePathname } from "next/navigation";

export default function SearchIdPage() {
  const { session } = useUserSession();
  const pathname = usePathname();
  const [searchData, setSearchData] = useState<any>({});  

  useEffect(() => {
    if (!session) {
      return;
    }

    const getSearchData = async () => {
      try {
        const searchIdB64 = pathname.split('/').pop();
        const numberId = parseInt(atob(searchIdB64));
        const response = await fetchSearchData(numberId, session.access_token);
        setSearchData(response);
      } catch (err) {
        console.log("Error fetching search data:", err);
      }
    };

    getSearchData();
  }, []);

  return (
    <div className="max-h-[800px] overflow-y-auto">
      <p>{JSON.stringify(searchData, undefined, 2)}</p>
    </div>
  );
}
