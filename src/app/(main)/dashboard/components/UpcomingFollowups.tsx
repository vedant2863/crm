
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowUpItemProps {
  title: string;
  priority: "low" | "medium" | "high";
  date: string;
  contact: string;
}

function FollowUpItem({ title, priority, date, contact }: FollowUpItemProps) {
  return (
    <div className="flex items-center justify-between border-b pb-2.5 last:border-none last:pb-0 text-xs">
      <div className="min-w-0">
        <h4 className="font-bold text-foreground truncate">{title}</h4>
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{date} • {contact}</p>
      </div>
      <span className={cn(
        "text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0",
        priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
          priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
            "bg-gray-500/10 text-gray-600 border-gray-500/20"
      )}>
        {priority}
      </span>
    </div>
  );
}

interface UpcomingFollowupsProps {
  followups: any[];
}

export function UpcomingFollowups({ followups }: UpcomingFollowupsProps) {
  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground">Upcoming Follow-ups</h3>
          <p className="text-[10px] text-muted-foreground">Don&apos;t let these slip</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border" onClick={() => window.location.href = "/follow-ups"}>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {followups && followups.length > 0 ? (
          followups.map((item: any) => (
            <FollowUpItem
              key={item.id}
              title={item.title}
              priority={item.priority}
              date={item.date}
              contact={item.contact}
            />
          ))
        ) : (
          <p className="text-[10px] text-muted-foreground italic py-2 text-center">No upcoming follow-ups</p>
        )}
      </div>
    </div>
  );
}
