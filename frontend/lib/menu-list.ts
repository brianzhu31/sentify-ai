import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Search,
} from "lucide-react";
import axios from "axios";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const fetchMenuList = async (accessToken: string): Promise<Group[]> => {
  try {
    const response = await axios.get(`${apiUrl}/api/search/search_history`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Accordion
// {
//   href: "",
//   label: "Posts",
//   active: pathname.includes("/posts"),
//   icon: SquarePen,
//   submenus: [
//     {
//       href: "/posts",
//       label: "All Posts",
//       active: pathname === "/posts",
//     },
//     {
//       href: "/posts/new",
//       label: "New Post",
//       active: pathname === "/posts/new",
//     },
//   ],
// },
