"use client";

import { ReactNode, useEffect, useState } from "react";
import AppProviders from "@/context/app-providers";
import { Sidebar } from "./components/sidebar";
import { SheetMenu } from "./components/sheet-menu";
import { UserDropdown } from "./components/user-dropdown";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <AppProviders>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </AppProviders>
  );
}

const ChatLayoutContent = ({ children }: { children: ReactNode }) => {

  return (
    <div className="flex min-h-screen">
      <SheetMenu />
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1">{children}</div>
      <div className="absolute top-0 right-0 mt-4 mr-8">
        <UserDropdown></UserDropdown>
      </div>
    </div>
  );
};
