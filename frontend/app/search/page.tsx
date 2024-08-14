"use client";

import { UserSessionProvider } from "@/context/user-session-context";
import { Sidebar } from "./components/sidebar";

export default function Search() {
  return (
    <UserSessionProvider>
      <div className="flex-1 flex min-h-screen justify-center items-center">
        <Sidebar></Sidebar>
      </div>
    </UserSessionProvider>
  );
}
