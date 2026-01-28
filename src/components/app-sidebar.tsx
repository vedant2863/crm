"use client";

import {
  CheckCircle2,
  Users,
  Briefcase,
  LayoutDashboard,
  Settings,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: Briefcase,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckCircle2,
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
    <Sidebar className="top-16 border-r border-border bg-sidebar/50">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-11 px-4 rounded-xl transition-all duration-300 ${isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-bold uppercase tracking-widest text-[10px]">{item.title}</span>
                      </Link>
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

