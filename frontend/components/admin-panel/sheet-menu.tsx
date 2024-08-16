import Link from "next/link";
import { useUserSession } from "@/context/user-session-context";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
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
        <p className="text-m flex justify-center items-center pb-2 pt-1">{user ? user.email : ""}</p>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
