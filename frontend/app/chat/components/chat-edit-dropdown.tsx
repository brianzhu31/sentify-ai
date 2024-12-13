import { useUserSession } from "@/context/user-session-context";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Share2Icon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Ellipsis } from "lucide-react";
import { useChatHistory } from "@/context/chat-history-context";
import { RenameDialog } from "./rename-dialog";
import { useToast } from "@/components/ui/use-toast";
import { deleteChat, updateChatName } from "../actions/chat";

interface ChatEditDropdownProps {
  chatID: string;
  name: string;
}

export function ChatEditDropdown({ chatID, name }: ChatEditDropdownProps) {
  const { session } = useUserSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { chatHistory, setChatHistory } = useChatHistory();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  if (!session) {
    return null;
  }

  const handleDelete = async () => {
    const deleteChatResponse = await deleteChat(session.access_token, chatID);
    if (deleteChatResponse.success) {
      toast({
        description: deleteChatResponse.data.message,
      });

      const updatedChats = chatHistory.chats.filter(
        (chat) => chat.chat_id !== chatID
      );
      setChatHistory({ ...chatHistory, chats: updatedChats });

      if (pathname === `/chat/${chatID}`) {
        router.replace("/chat");
      } else {
        router.refresh();
      }
    } else {
      toast({
        variant: "error",
        description: deleteChatResponse.error || "An unexpected error occurred",
      });
    }
  };

  const handleRename = async (newName: string) => {
    const updateChatNameResponse = await updateChatName(
      session.access_token,
      chatID,
      newName
    );

    if (updateChatNameResponse.success) {
      const updatedChats = chatHistory.chats.map((chat) =>
        chat.chat_id === chatID ? { ...chat, name: newName } : chat
      );
      setChatHistory({ ...chatHistory, chats: updatedChats });

      toast({
        description: updateChatNameResponse.data.message,
      });
    }
    else {
      toast({
        variant: "error",
        description: updateChatNameResponse.error,
      });
    }
  };

  return (
    <DropdownMenu
      open={isMenuOpen}
      onOpenChange={(open) => setIsMenuOpen(open)}
    >
      <DropdownMenuTrigger asChild>
        <div className="flex absolute right-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`bg-slate-100 rounded-full transition-opacity ${
                    isMenuOpen
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Ellipsis size={20} />
                </div>
              </TooltipTrigger>
              <TooltipContent align="center">
                <p>Options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-32 absolute left-0 -translate-x-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3">
              <Share2Icon />
              <p>Share</p>
            </div>
          </DropdownMenuItem>
          <RenameDialog
            prevName={name}
            onRenameSubmit={handleRename}
            onClose={() => setIsMenuOpen(false)}
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Pencil1Icon />
                <p>Rename</p>
              </div>
            </DropdownMenuItem>
          </RenameDialog>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3" onClick={handleDelete}>
              <TrashIcon />
              <p>Delete</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
