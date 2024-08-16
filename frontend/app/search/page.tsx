"use client";

import { UserSessionProvider } from "@/context/user-session-context";
import { Sidebar } from "./components/sidebar";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";

export default function Search() {
  return (
    <UserSessionProvider>
      <div className="m-4">
        <SheetMenu></SheetMenu>
      </div>
      <div className="flex-1 flex min-h-screen justify-center items-center">
        <Sidebar></Sidebar>
      </div>
    </UserSessionProvider>
  );
}
