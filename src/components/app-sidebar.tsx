"use client";

import {
  LayoutDashboard,
  Briefcase,
  Layers,
  StickyNote,
  CheckCircle2,
  Settings,
  LogOut,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

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
    title: "Leads",
    url: "/leads",
    icon: Briefcase,
  },
  {
    title: "Pipeline",
    url: "/pipeline",
    icon: Layers,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: StickyNote,
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

  const handleLogout = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <aside
      className="fixed left-0 top-16 bottom-0 w-[72px] border-r border-border bg-background/50 backdrop-blur-md z-30 flex flex-col items-center py-6 justify-between transition-all duration-300"
      style={{
        margin: "1rem 0 1rem 1rem",
        height: "calc(100vh - 6rem)",
        borderRadius: "1.5rem",
        boxShadow: "0 10px 30px oklch(from var(--foreground) l c h / 0.02)",
      }}
    >
      {/* Top Menu Items */}
      <div className="flex flex-col gap-5 w-full items-center">
        {items.map((item) => {
          const isActive = pathname === item.url || (item.url === "/leads" && pathname === "/deals");
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "h-11 w-11 flex items-center justify-center rounded-2xl transition-all duration-300 relative group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={item.title}
            >
              <item.icon className="h-5 w-5" />

              {/* Tooltip */}
              <span className="absolute left-16 scale-0 transition-all rounded-lg bg-popover border text-popover-foreground px-2 py-1 text-xs font-bold shadow-md group-hover:scale-100 whitespace-nowrap z-50">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Action (Logout) */}
      <button
        onClick={handleLogout}
        className="h-11 w-11 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-300 relative group"
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />

        {/* Tooltip */}
        <span className="absolute left-16 scale-0 transition-all rounded-lg bg-popover border text-popover-foreground px-2 py-1 text-xs font-bold shadow-md group-hover:scale-100 whitespace-nowrap z-50">
          Sign Out
        </span>
      </button>
    </aside>
  );
}
