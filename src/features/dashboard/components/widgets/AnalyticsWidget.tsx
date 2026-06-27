"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardAnalytics } from "../../hooks/useDashboardAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3, ListTodo, DollarSign } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];

export default function AnalyticsWidget({ className }: { className?: string }) {
  const { data, loading, error } = useDashboardAnalytics();
  const [activeTab, setActiveTab] = useState("forecast");

  if (loading) {
    return (
      <Card className={cn("border shadow-sm rounded-2xl p-6 space-y-4", className)}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-[350px] w-full rounded-xl flex-1" />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("border shadow-sm rounded-2xl p-6 text-center text-destructive bg-destructive/5", className)}>
        Failed to load analytics charts data. Please try again later.
      </Card>
    );
  }

  // Calculate total forecast revenue
  const totalForecastValue = data.forecastData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card className={cn("border shadow-sm rounded-2xl overflow-hidden transition-all duration-300", className)}>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20 border-b pb-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Workspace Analytics
          </CardTitle>
          <CardDescription>
            Interactive insights into your pipeline, revenue forecasts, and tasks
          </CardDescription>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-auto bg-background/50 border">
            <TabsTrigger value="forecast" className="text-xs uppercase tracking-wider font-bold">
              Forecast
            </TabsTrigger>
            <TabsTrigger value="deals" className="text-xs uppercase tracking-wider font-bold">
              Stages
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs uppercase tracking-wider font-bold">
              Tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs value={activeTab} className="w-full">
          {/* 1. REVENUE FORECAST TAB */}
          <TabsContent value="forecast" className="space-y-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 shrink-0">
              <div className="p-3 rounded-xl border bg-card/50 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Projected Revenue</p>
                  <p className="text-lg font-extrabold text-foreground">${totalForecastValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl border bg-card/50 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Forecast Horizon</p>
                  <p className="text-lg font-extrabold text-foreground">Next 6 Months</p>
                </div>
              </div>
              <div className="p-3 rounded-xl border bg-card/50 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Weighted Model</p>
                  <p className="text-xs font-semibold text-foreground">Value × Probability %</p>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.forecastData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    className="text-[11px] fill-muted-foreground font-semibold"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                    className="text-[11px] fill-muted-foreground font-semibold"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number | string) => [`$${Number(value).toLocaleString()}`, "Expected Revenue"]}
                    labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* 2. DEALS STAGES TAB */}
          <TabsContent value="deals" className="space-y-4 outline-none">
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stageData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    className="text-[11px] fill-muted-foreground font-semibold"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                    className="text-[11px] fill-muted-foreground font-semibold"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number | string, _name: string, props: { payload?: { count?: number } }) => [
                      `$${Number(value).toLocaleString()} (${props.payload?.count ?? 0} deals)`,
                      "Total Valuation",
                    ]}
                    labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                    {data.stageData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* 3. TASKS TAB */}
          <TabsContent value="tasks" className="space-y-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Priority Breakdown */}
              <div className="p-4 rounded-2xl border bg-card/30 flex flex-col justify-between min-h-[280px]">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-1">
                    <ListTodo className="h-4 w-4 text-primary" /> Task Priority Distribution
                  </h4>
                  <p className="text-[11px] text-muted-foreground mb-2">Breakdown of assigned tasks by priority level</p>
                </div>
                <div className="flex-1 min-h-[200px] flex items-center justify-center">
                  {data.taskData.priorityData.every(d => d.value === 0) ? (
                    <p className="text-xs italic text-muted-foreground">No tasks available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.taskData.priorityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.taskData.priorityData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span className="text-[11px] font-semibold text-muted-foreground">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Task Status Breakdown */}
              <div className="p-4 rounded-2xl border bg-card/30 flex flex-col justify-between min-h-[280px]">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-1">
                    <ListTodo className="h-4 w-4 text-emerald-500" /> Task Status Distribution
                  </h4>
                  <p className="text-[11px] text-muted-foreground mb-2">Breakdown of assigned tasks by workflow status</p>
                </div>
                <div className="flex-1 min-h-[200px] flex items-center justify-center">
                  {data.taskData.statusData.every(d => d.value === 0) ? (
                    <p className="text-xs italic text-muted-foreground">No tasks available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.taskData.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.taskData.statusData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span className="text-[11px] font-semibold text-muted-foreground">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
