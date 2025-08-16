"use client";

import {
  CheckLine,
  Contact,
  HeartHandshake,
  Home,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // ✅ for current route
import { useState } from "react";

// Menu items
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
  
  const pathname = usePathname();

  return (
    <Sidebar className="top-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                          isActive
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
