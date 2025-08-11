"use client";

import { Bell, Search, User, LogOut, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow flex items-center px-4 py-4 justify-between">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <SidebarTrigger className="md:hidden">
          <Menu className="h-6 w-6 text-gray-700" />
        </SidebarTrigger>

        <p className="text-blue-700 font-bold text-lg">CRM System</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1 w-64">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search contacts, deals, tasks..."
          className="bg-transparent outline-none px-2 text-sm w-full"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="relative hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <User className="h-5 w-5 text-gray-600" />
            <span className="hidden md:inline text-sm text-gray-700">
              {session?.user?.name || "Profile"}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <div className="font-medium">{session?.user?.name}</div>
                <div className="text-gray-500">{session?.user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}
