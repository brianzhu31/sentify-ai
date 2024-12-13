import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChatHistoryContent } from "./chat-history";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { MenuIcon } from "lucide-react";

export function SheetMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="lg:hidden absolute top-4 left-4" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader className="flex items-center justify-center">
          <Link href="/">
            <SheetTitle className="text-base font-semibold text-center">
              Market Sentry
            </SheetTitle>
          </Link>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        <ChatHistoryContent />
        <Button
          variant="outline"
          className="w-full justify-start h-10 mb-1"
          asChild
        >
          <Link href="/chat">
            <span className={cn("mr-4")}>
              <ChatBubbleIcon />
            </span>
            <p
              className={cn("max-w-[200px] truncate translate-x-0 opacity-100")}
            >
              New Chat
            </p>
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
