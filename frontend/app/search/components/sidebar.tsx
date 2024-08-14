"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PanelsTopLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/useStore";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { createClient } from "@/utils/supabase/client";
import { useUserSession } from "@/app/context/user-session-context";

export function Sidebar() {
  const { user, session } = useUserSession();
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const supabase = createClient();

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <p
          className={cn(
            "text-m pl-7 whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
            sidebar?.isOpen === false
              ? "-translate-x-96 opacity-0 hidden"
              : "translate-x-0 opacity-100"
          )}
        >
          {user ? user.email : ""}
        </p>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
