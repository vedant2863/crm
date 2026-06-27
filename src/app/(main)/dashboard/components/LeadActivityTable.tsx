import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadActivityTableProps {
  recentMovements: any[];
}

export function LeadActivityTable({ recentMovements }: LeadActivityTableProps) {
  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground">Lead Activity</h3>
          <p className="text-[10px] text-muted-foreground">Recent lead movements</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border" onClick={() => window.location.href = "/leads"}>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead>
            <tr className="border-b uppercase font-bold tracking-wider text-muted-foreground/80">
              <th className="pb-2">Name</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Time</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {recentMovements.map((act: any) => {
              const initial = act.description ? act.description.charAt(0).toUpperCase() : "L";
              const isWon = act.description.toLowerCase().includes("won") || act.description.toLowerCase().includes("completed");
              const isQualified = act.description.toLowerCase().includes("qualified");

              return (
                <tr key={act.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-2.5 font-bold flex items-center gap-2 max-w-[120px]">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px] shrink-0">
                      {initial}
                    </div>
                    <span className="truncate">{act.description.split(" added")[0].split(" moved")[0].split(" Task")[0].split(" contact")[0].split(":")[0]}</span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{act.dateStr || "Recent"}</td>
                  <td className="py-2.5 text-muted-foreground">{act.timeStr || ""}</td>
                  <td className="py-2.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                      isWon ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        isQualified ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                          "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    )}>
                      {isWon ? "Won" : isQualified ? "Qualified" : "New"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-black text-foreground">
                    {act.value ? `$${act.value.toLocaleString()}` : "-"}
                  </td>
                </tr>
              );
            })}
            {recentMovements.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted-foreground italic">No recent movements</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
