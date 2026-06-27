import { ArrowUpDown, Edit, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Deal } from "@/features/deals";

interface LeadTableViewProps {
  sortedLeads: Deal[];
  selectedIds: string[];
  toggleSelectAll: () => void;
  toggleSelect: (id: string) => void;
  toggleSort: (field: "title" | "value" | "createdAt") => void;
  handleOpenDrawer: (lead: Deal) => void;
  handleOpenDialog: (lead: Deal) => void;
  handleDelete: (id: string) => void;
  DEAL_STAGES: { key: string; label: string; color: string }[];
}

export function LeadTableView({
  sortedLeads,
  selectedIds,
  toggleSelectAll,
  toggleSelect,
  toggleSort,
  handleOpenDrawer,
  handleOpenDialog,
  handleDelete,
  DEAL_STAGES,
}: LeadTableViewProps) {
  return (
    <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/20 font-bold uppercase tracking-wider text-muted-foreground/80">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={sortedLeads.length > 0 && selectedIds.length === sortedLeads.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-primary"
                />
              </th>
              <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("title")}>
                Lead <ArrowUpDown className="h-3.5 w-3.5 inline ml-1" />
              </th>
              <th className="p-4">Stage</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Source</th>
              <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("value")}>
                Value <ArrowUpDown className="h-3.5 w-3.5 inline ml-1" />
              </th>
              <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("createdAt")}>
                Updated <ArrowUpDown className="h-3.5 w-3.5 inline ml-1" />
              </th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sortedLeads.map((lead) => {
              const stageObj = DEAL_STAGES.find(s => s.key === lead.stage);
              const source = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
              const initial = lead.contactName ? lead.contactName.charAt(0).toUpperCase() : "L";

              return (
                <tr
                  key={lead._id}
                  className={cn(
                    "hover:bg-muted/15 cursor-pointer transition-colors group/row",
                    selectedIds.includes(lead._id) && "bg-primary/5"
                  )}
                  onClick={() => handleOpenDrawer(lead)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead._id)}
                      onChange={() => toggleSelect(lead._id)}
                      className="rounded border-gray-300 text-primary"
                    />
                  </td>
                  <td className="p-4 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-black truncate group-hover/row:text-primary transition-colors">{lead.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{lead.contactName} at {lead.company || "General"}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stageObj?.color ? undefined : "#94a3b8" }} />
                      {stageObj?.label || lead.stage}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase border",
                      lead.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                        lead.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-gray-500/10 text-gray-600 border-gray-500/20"
                    )}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-muted border text-[10px] font-bold">
                      {source}
                    </span>
                  </td>
                  <td className="p-4 font-black text-emerald-600">
                    ${lead.value.toLocaleString()}
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">
                    {new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenDialog(lead)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit Lead"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedLeads.length === 0 && (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No leads found</h3>
          <p className="text-muted-foreground">Adjust filters or create a new lead to populate table.</p>
        </div>
      )}
    </div>
  );
}
