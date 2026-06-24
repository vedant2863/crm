/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Plus, Edit, Trash2, Sparkles, RefreshCw, Mail, Copy } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Deal } from "@/features/deals";
import toast from "react-hot-toast";

interface LeadDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLead: Deal | null;
  handleOpenDialog: (lead: Deal) => void;
  handleDelete: (id: string) => void;
  DEAL_STAGES: { key: string; label: string; color: string }[];
  aiSummary: any;
  setAiSummary: (summary: any) => void;
  aiSummaryLoading: boolean;
  generateSummary: () => void;
  aiEmail: any;
  setAiEmail: (email: any) => void;
  aiEmailLoading: boolean;
  generateEmail: () => void;
  emailPurpose: string;
  setEmailPurpose: (purpose: string) => void;
  emailTone: string;
  setEmailTone: (tone: string) => void;
}

export function LeadDetailDrawer({
  open,
  onOpenChange,
  selectedLead,
  handleOpenDialog,
  handleDelete,
  DEAL_STAGES,
  aiSummary,
  setAiSummary,
  aiSummaryLoading,
  generateSummary,
  aiEmail,
  setAiEmail,
  aiEmailLoading,
  generateEmail,
  emailPurpose,
  setEmailPurpose,
  emailTone,
  setEmailTone,
}: LeadDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto rounded-l-3xl p-6 flex flex-col gap-6">
        {selectedLead && (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">
                <Plus className="h-3 w-3 shrink-0" /> Lead Overview
              </div>
              <SheetTitle className="text-2xl font-black tracking-tight text-foreground">
                {selectedLead.title}
              </SheetTitle>
              <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {selectedLead.contactName} at {selectedLead.company || "General"}
              </SheetDescription>
            </SheetHeader>

            {/* Action Buttons Row */}
            <div className="flex gap-2.5">
              <Button
                onClick={() => handleOpenDialog(selectedLead)}
                className="flex-1 rounded-full font-bold h-10 text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Details
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedLead._id)}
                className="rounded-full font-bold h-10 text-xs px-4"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Deal Value</span>
                <span className="text-base font-black text-emerald-600">${selectedLead.value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Stage</span>
                <span className="font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {DEAL_STAGES.find(s => s.key === selectedLead.stage)?.label || selectedLead.stage}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Priority</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border inline-block mt-0.5",
                  selectedLead.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                    selectedLead.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                      "bg-gray-500/10 text-gray-600 border-gray-500/20"
                )}>
                  {selectedLead.priority}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Source</span>
                <span className="px-2 py-0.5 rounded-full bg-muted border text-[9px] font-bold inline-block mt-0.5">
                  {selectedLead.tags && selectedLead.tags.length > 0 ? selectedLead.tags[0] : "Other"}
                </span>
              </div>
              {selectedLead.expectedCloseDate && (
                <div className="col-span-2">
                  <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Expected Close Date</span>
                  <span className="font-bold">{new Date(selectedLead.expectedCloseDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
            </div>

            {/* Lead Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</h3>
              <div className="p-4 border rounded-2xl bg-card text-xs text-foreground min-h-[60px] whitespace-pre-wrap leading-relaxed">
                {selectedLead.notes || "No notes provided for this lead."}
              </div>
            </div>

            {/* Gemini AI Lead Summary Widget */}
            <div className="border border-primary/20 rounded-2xl bg-primary/5 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" /> AI Lead Summary
                </div>
                {!aiSummary && (
                  <Button
                    size="sm"
                    onClick={generateSummary}
                    disabled={aiSummaryLoading}
                    className="rounded-full text-[10px] h-7 px-3"
                  >
                    {aiSummaryLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1.5" />
                    )}
                    Analyze Lead
                  </Button>
                )}
              </div>

              {aiSummaryLoading && (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              )}

              {aiSummary && (
                <div className="space-y-4 text-xs">
                  {/* Score and Priority badges */}
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Risk Score</span>
                      <span className={cn(
                        "text-sm font-black",
                        aiSummary.riskScore > 70 ? "text-rose-500" :
                          aiSummary.riskScore > 40 ? "text-amber-500" :
                            "text-emerald-500"
                      )}>
                        {aiSummary.riskScore}/100
                      </span>
                    </div>
                    <div className="h-8 border-l border-border/40" />
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Suggested Priority</span>
                      <span className={cn(
                        "font-black uppercase text-[10px]",
                        aiSummary.suggestedPriority === "high" ? "text-rose-500" :
                          aiSummary.suggestedPriority === "medium" ? "text-amber-500" :
                            "text-emerald-500"
                      )}>
                        {aiSummary.suggestedPriority}
                      </span>
                    </div>
                  </div>

                  {/* Summary Content */}
                  <div className="space-y-1 bg-card/65 p-3 border rounded-xl">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block">AI Evaluation</span>
                    <p className="text-muted-foreground leading-relaxed font-medium">{aiSummary.summary}</p>
                  </div>

                  {/* Next Action */}
                  <div className="space-y-1 bg-primary/10 p-3 rounded-xl border border-primary/20">
                    <span className="text-[9px] text-primary font-black uppercase tracking-wider block">Next Best Action</span>
                    <p className="text-primary font-bold">{aiSummary.nextBestAction}</p>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setAiSummary(null)}
                    className="text-[9px] text-muted-foreground hover:text-foreground h-6 px-2 self-start rounded-md"
                  >
                    Clear Summary
                  </Button>
                </div>
              )}
            </div>

            {/* Gemini AI Email Generator Widget */}
            <div className="border border-violet-500/20 rounded-2xl bg-violet-500/5 p-4 flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-xs font-black text-violet-600 uppercase tracking-wider">
                <Mail className="h-4 w-4" /> AI Email Generator
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Purpose</label>
                  <select
                    value={emailPurpose}
                    onChange={(e) => setEmailPurpose(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-background"
                  >
                    <option value="Follow-up">Follow-up</option>
                    <option value="Introduction">Introduction</option>
                    <option value="Demo Scheduling">Schedule Demo</option>
                    <option value="Proposal Review">Proposal Review</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Tone</label>
                  <select
                    value={emailTone}
                    onChange={(e) => setEmailTone(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-background"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>
              </div>

              {!aiEmail && (
                <Button
                  onClick={generateEmail}
                  disabled={aiEmailLoading}
                  className="rounded-full text-[10px] h-8 bg-violet-600 hover:bg-violet-700 text-white font-bold"
                >
                  {aiEmailLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                  ) : (
                    <Mail className="h-3 w-3 mr-1.5" />
                  )}
                  Generate Draft
                </Button>
              )}

              {aiEmailLoading && (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              {aiEmail && (
                <div className="space-y-3 text-xs mt-1">
                  <div className="space-y-1 bg-card/65 p-3 border rounded-xl">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                      <span className="text-[9px] text-muted-foreground font-black uppercase">Subject Line</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiEmail.subject);
                          toast.success("Subject copied!");
                        }}
                        className="text-[9px] text-violet-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <p className="font-bold text-foreground">{aiEmail.subject}</p>
                  </div>

                  <div className="space-y-1 bg-card/65 p-3 border rounded-xl">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                      <span className="text-[9px] text-muted-foreground font-black uppercase">Email Body</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiEmail.body);
                          toast.success("Body copied!");
                        }}
                        className="text-[9px] text-violet-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={8}
                      value={aiEmail.body}
                      className="w-full text-xs font-mono bg-transparent border-none focus:outline-none resize-none"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setAiEmail(null)}
                    className="text-[9px] text-muted-foreground hover:text-foreground h-6 px-2 self-start rounded-md"
                  >
                    Clear Email
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
