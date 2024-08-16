"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUserSession } from "@/context/user-session-context";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import { logout } from "@/app/utils/auth";
import { fetchMenuList } from "@/lib/menu-list";
import axios from "axios";

interface MenuProps {
  isOpen: boolean | undefined;
}

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const { user, session } = useUserSession();
  const [menuList, setMenuList] = useState<any[]>([]);

  const handleLogout = async (e: any) => {
    e.preventDefault();
    const loginError = await logout();
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    const getMenuList = async () => {
      try {
        const data = await fetchMenuList(session.session.access_token);
        setMenuList(data);
      } catch (err) {
        console.log('Error fetching menu list:', err);
      }
    };

    getMenuList();
  }, [session]);

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          <div className="w-full">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 mb-1"
                    asChild
                  >
                    <Link href="/search">
                      <span className={cn(isOpen === false ? "" : "mr-4")}>
                        <Search size={18} />
                      </span>
                      <p
                        className={cn(
                          "max-w-[200px] truncate",
                          isOpen === false
                            ? "-translate-x-96 opacity-0"
                            : "translate-x-0 opacity-100"
                        )}
                      >
                        New Search
                      </p>
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">New Search</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          {menuList.map(({ group_label, menus }, index) => (
            <li className={cn("w-full", group_label ? "pt-5" : "")} key={index}>
              {(isOpen && group_label) || isOpen === undefined ? (
                <p className="text-m font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {group_label}
                </p>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(({ href, label, active, submenus }, index) =>
                submenus.length === 0 ? (
                  <div className="w-full" key={index}>
                    <TooltipProvider disableHoverableContent>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={active ? "secondary" : "ghost"}
                            className="w-full justify-start h-10 mb-1"
                            asChild
                          >
                            {isOpen ? (
                              <Link href={href}>
                                <p
                                  className={cn(
                                    "text-s max-w-[200px] truncate translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            ) : (
                              <p
                                className={cn(
                                  "text-s max-w-[200px] truncate -translate-x-96 opacity-0"
                                )}
                              >
                                {label}
                              </p>
                            )}
                          </Button>
                        </TooltipTrigger>
                        {isOpen === false && (
                          <TooltipContent side="right">{label}</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="w-full" key={index}>
                    <CollapseMenuButton
                      label={label}
                      active={active}
                      submenus={submenus}
                      isOpen={isOpen}
                    />
                  </div>
                )
              )}
            </li>
          ))}
          <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-center h-10 mt-5"
                  >
                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap",
                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                      )}
                    >
                      Sign out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Sign out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
