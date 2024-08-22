import { useUserSession } from "@/context/user-session-context";
import { useState } from "react";
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
import { Share2Icon, TrashIcon, DrawingPinIcon, DrawingPinFilledIcon } from "@radix-ui/react-icons";
import { Ellipsis } from "lucide-react";

export function SearchEditDropdown() {
  const { user } = useUserSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // await deleteSearch();
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsMenuOpen(open)}>
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
      <DropdownMenuContent className="w-32 absolute left-0 -translate-x-1" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3">
              <DrawingPinIcon></DrawingPinIcon>
              <p>Pin</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3">
              <Share2Icon></Share2Icon>
              <p>Share</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3">
              <TrashIcon></TrashIcon>
              <p>Delete</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
