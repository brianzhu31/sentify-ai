import Link from "next/link";
import { useUserSession } from "@/context/user-session-context";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

export function SheetMenu() {
  const { user } = useUserSession();
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold">
            {user ? user.email : ""}
          </SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
