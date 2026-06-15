"use client";

import { LogOut, User, Sun, Moon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border z-40 flex items-center px-4 py-4 justify-between transition-all">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle trigger */}
        <SidebarTrigger />
        <Logo />
      </div>

      {/* Search */}
      <div className="hidden md:block">
        <SearchBox />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
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

