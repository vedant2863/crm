"use client";

import { LogOut, User, Sun, Moon, LayoutDashboard, Briefcase, Layers, Users, CheckCircle2, StickyNote } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import NotificationDropdown from "@/features/notifications/components/NotificationDropdown";
import { useTheme } from "@/components/providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: Briefcase },
    { label: "Pipeline", href: "/pipeline", icon: Layers },
    { label: "Contacts", href: "/contacts", icon: Users },
    { label: "Follow-ups", href: "/follow-ups", icon: CheckCircle2 },
    { label: "Notes", href: "/notes", icon: StickyNote },
  ];

  return (
    <nav className="w-full h-16 bg-background/95 backdrop-blur-md border-b border-border z-40 flex items-center px-4 py-4 justify-between transition-all shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Logo />
      </div>

      {/* Centered Pill Navigation with Icons */}
      <div className="flex items-center border rounded-full p-0.5 sm:p-1 bg-muted/30 backdrop-blur-md border-border/40 max-w-[50vw] sm:max-w-none overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/leads" && pathname === "/deals");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "px-2 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5",
                isActive
                  ? "bg-card text-foreground shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <SearchBox />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300 rotate-0 scale-100" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300 rotate-0 scale-100" />
          )}
        </Button>

        <NotificationDropdown />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted transition-colors">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="hidden md:inline-block text-sm font-medium text-foreground">
                {session?.user?.name || "Profile"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

