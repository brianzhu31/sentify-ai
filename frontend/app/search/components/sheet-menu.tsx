import Link from "next/link";
import { SearchHistoryData } from "@/types";
import { useUserSession } from "@/context/user-session-context";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchHistoryContent } from "./search-history";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { Search } from "lucide-react";

interface SheetMenuProps {
  searchHistory: SearchHistoryData;
}

export function SheetMenu({ searchHistory }: SheetMenuProps) {
  const { user } = useUserSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader className="flex items-center justify-center">
          <SheetTitle className="text-base font-semibold text-center">
            Market Sentry
          </SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        <SearchHistoryContent searchHistory={searchHistory} />
        <Button
          variant="outline"
          className="w-full justify-start h-10 mb-1"
          asChild
        >
          <Link href="/search">
            <span className={cn("mr-4")}>
              <Search size={18} />
            </span>
            <p
              className={cn("max-w-[200px] truncate translate-x-0 opacity-100")}
            >
              New Search
            </p>
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
