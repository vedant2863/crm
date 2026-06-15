"use client";

import { useNotifications } from "../hooks/useNotifications";
import {
  Bell,
  UserPlus,
  Calendar,
  Briefcase,
  Check,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientNotification } from "../services/notification-client-service";

function getNotificationIcon(type: string) {
  switch (type) {
    case "lead":
      return { Icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    case "task":
      return { Icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" };
    case "deal":
      return { Icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    default:
      return { Icon: Bell, color: "text-muted-foreground", bg: "bg-muted/50" };
  }
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const router = useRouter();

  const handleNotificationClick = async (n: ClientNotification) => {
    if (!n.read) {
      await markRead(n._id);
    }
    // Route redirection based on notification source
    if (n.referenceType === "contact") {
      router.push("/contacts");
    } else if (n.referenceType === "deal") {
      router.push("/deals");
    } else if (n.referenceType === "task") {
      router.push("/tasks");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white px-0.5">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-2xl border bg-card/90 backdrop-blur-xl p-2 shadow-2xl"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="bg-border/60" />

        <div className="max-h-80 overflow-y-auto space-y-1 my-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="p-3 bg-muted/30 rounded-2xl mb-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-semibold">You&apos;re all caught up!</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const { Icon, color, bg } = getNotificationIcon(n.type);
              return (
                <DropdownMenuItem
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors focus:bg-muted/40",
                    !n.read ? "bg-primary/5 border-l-2 border-primary" : "opacity-75"
                  )}
                >
                  <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", bg, color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[9px] font-semibold text-muted-foreground/60 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
