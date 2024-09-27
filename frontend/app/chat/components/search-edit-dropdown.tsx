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
import { Share2Icon, TrashIcon, DrawingPinIcon } from "@radix-ui/react-icons";
import { Ellipsis } from "lucide-react";
// import { deleteSearch } from "../actions/edit-search";
import { useSearchHistory } from "@/context/search-history-context";
import { useToast } from "@/components/ui/use-toast";

interface SearchEditDropdownProps {
  searchId: string;
}

export function SearchEditDropdown({ searchId }: SearchEditDropdownProps) {
  const { session } = useUserSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { searchHistory, setSearchHistory } = useSearchHistory();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  if (!session) {
    return null;
  }

  const handleDelete = async () => {
    // try {
    //   const response = await deleteSearch(session.access_token, searchId);
    //   toast({
    //     description: response.message,
    //   });

    //   const updatedSearches = searchHistory.searches.filter(
    //     (search) => search.search_id !== searchId
    //   );
    //   setSearchHistory({ ...searchHistory, searches: updatedSearches });

    //   if (pathname === `/search/${searchId}`) {
    //     router.replace("/search");
    //   } else {
    //     router.refresh();
    //   }
    // } catch (err: any) {
    //   toast({
    //     variant: "error",
    //     description: err.message || "An unexpected error occurred",
    //   });
    // }
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
      <DropdownMenuContent
        className="w-32 absolute left-0 -translate-x-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3">
              <Share2Icon></Share2Icon>
              <p>Share</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3" onClick={handleDelete}>
              <TrashIcon></TrashIcon>
              <p>Delete</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
