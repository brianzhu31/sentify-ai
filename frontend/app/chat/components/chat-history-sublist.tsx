"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChatEditDropdown } from "./chat-edit-dropdown";
import { ChatItem } from "@/types";
import { RenameDialog } from "./rename-dialog";

interface ChatLinkProps {
  href: string;
  name: string;
  chatID: string;
}

export function ChatLink({ href, name, chatID }: ChatLinkProps) {
  const pathname = usePathname();
  const [newName, setNewName] = useState(name);

  const handleRenameSubmit = (updatedName: string) => {
    setNewName(updatedName);
  };

  return (
    <>
      <Button
        variant={href === pathname ? "secondary" : "ghost"}
        className="w-full justify-start h-10 mb-1"
        asChild
      >
        <Link href={href} className="relative group">
          <div className="flex justify-between items-center w-full">
            <p className="text-sm font-normal max-w-[200px] truncate">
              {newName}
            </p>
          </div>
          <ChatEditDropdown
            name={newName}
            chatID={chatID}
            onRename={handleRenameSubmit}
          />
        </Link>
      </Button>
    </>
  );
}

interface ChatHistorySublistProps {
  chatList: ChatItem[];
  label: string;
}

export function ChatHistorySublist({
  chatList,
  label,
}: ChatHistorySublistProps) {
  return (
    <>
      {chatList.length > 0 && (
        <>
          <h2 className="text-xs font-bold mt-4 ml-2 mb-2">{label}</h2>
          {chatList.map(({ chat_id, name, href }, index) => (
            <div className="w-full pr-2" key={index}>
              <ChatLink href={href} name={name} chatID={chat_id} />
            </div>
          ))}
        </>
      )}
    </>
  );
}
