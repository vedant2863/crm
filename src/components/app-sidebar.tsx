"use client"
import {
  CheckLine,
  ChevronUp,
  Contact,
  HeartHandshake,
  Home,
  LogOut,
  Settings,
  User2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "./ui/button";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Contact,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: HeartHandshake,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckLine,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
  
    const handleLogout = async () => {
      await signOut({ callbackUrl: "/login" });
    };

  return (
    <Sidebar className="top-16">
      <SidebarHeader>
        <p className="text-lg font-semibold">Routes</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>{session?.user?.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>{session?.user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
