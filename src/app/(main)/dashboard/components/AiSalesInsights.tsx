/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AiSalesInsightsProps {
  aiProvider: string | null;
  aiNoKey: boolean;
  aiError: boolean;
  aiInsights: any;
  aiLoading: boolean;
  aiRefreshCount: number;
  AI_REFRESH_LIMIT: number;
  fetchAiInsights: (force?: boolean) => void;
}

export function AiSalesInsights({
  aiProvider,
  aiNoKey,
  aiError,
  aiInsights,
  aiLoading,
  aiRefreshCount,
  AI_REFRESH_LIMIT,
  fetchAiInsights,
}: AiSalesInsightsProps) {
  return (
    <div className="border border-primary/20 rounded-3xl bg-primary/5 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> AI Sales Insights
          </div>
          {aiProvider && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {aiProvider}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Refresh counter badge */}
          {!aiNoKey && (
            <span className={cn(
              "text-[9px] font-black px-1.5 py-0.5 rounded-full border",
              aiRefreshCount >= AI_REFRESH_LIMIT
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-muted text-muted-foreground border-border/40"
            )}>
              {aiRefreshCount >= AI_REFRESH_LIMIT ? "Limit reached" : `${AI_REFRESH_LIMIT - aiRefreshCount} left`}
            </span>
          )}
          <button
            onClick={() => fetchAiInsights(true)}
            disabled={aiLoading || aiRefreshCount >= AI_REFRESH_LIMIT}
            className={cn(
              "p-1 rounded-full transition-colors border",
              aiRefreshCount >= AI_REFRESH_LIMIT
                ? "text-muted-foreground/30 border-border/20 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={aiRefreshCount >= AI_REFRESH_LIMIT ? "Refresh limit reached (5/5)" : `Refresh Insights (${AI_REFRESH_LIMIT - aiRefreshCount} remaining)`}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", aiLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {aiLoading && (
        <div className="space-y-2 py-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      )}

      {/* No API Key Banner */}
      {!aiLoading && aiNoKey && (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">No API Key Configured</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
              AI service is unavailable. Add{" "}
              <code className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">GEMINI_API_KEY</code>{" "}
              to your <code className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">.env</code> file to enable AI insights.
            </p>
          </div>
        </div>
      )}

      {/* AI Error Banner */}
      {!aiLoading && !aiNoKey && aiError && (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">AI Service Error</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
              The AI provider encountered an error or your rolling quota was exceeded. Please try again later.
            </p>
          </div>
        </div>
      )}

      {!aiLoading && !aiNoKey && !aiError && aiInsights && (
        <div className="space-y-4 text-xs">
          {/* Health Score */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Health Score</span>
              <span className="text-primary font-black">{aiInsights.healthScore}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${aiInsights.healthScore}%` }} />
            </div>
          </div>

          {/* Observations */}
          {aiInsights.observations && aiInsights.observations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Observations</span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground font-medium pl-1">
                {aiInsights.observations.map((obs: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary block">Recommendations</span>
              <ul className="list-disc list-inside space-y-1 text-primary font-bold pl-1">
                {aiInsights.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
