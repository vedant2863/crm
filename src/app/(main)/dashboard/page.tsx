"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  totalTasks: number;
  totalRevenue: number;
  conversionRate: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  pipelineStats: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  taskStats: Record<string, number>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalTasks: 0,
    totalRevenue: 0,
    conversionRate: 0,
    recentActivities: [],
    pipelineStats: [],
    taskStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations for better performance
  const chartData = useMemo(() => {
    return stats.pipelineStats.map(stat => ({
      stage: stat.stage.charAt(0).toUpperCase() + stat.stage.slice(1),
      count: stat.count,
      value: stat.value
    }));
  }, [stats.pipelineStats]);

  const activeDeals = useMemo(() => {
    return stats.pipelineStats
      .filter(s => !['won', 'lost'].includes(s.stage.toLowerCase()))
      .reduce((sum, s) => sum + s.count, 0);
  }, [stats.pipelineStats]);

  const totalPipelineValue = useMemo(() => {
    return stats.pipelineStats.reduce((sum, stat) => sum + stat.value, 0);
  }, [stats.pipelineStats]);

  const totalPipelineDeals = useMemo(() => {
    return stats.pipelineStats.reduce((sum, stat) => sum + stat.count, 0);
  }, [stats.pipelineStats]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchStats]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Recent Activity Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deal Pipeline Chart Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full mb-4" />
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg">
                    <Skeleton className="h-4 w-4 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-5" />
                  <div className="text-left flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || "User"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s what&apos;s happening with your CRM today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              {activeDeals} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Pipeline Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Number of deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Number of Deals",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis 
                  dataKey="stage" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  name="Deals"
                />
              </BarChart>
            </ChartContainer>
            
            {/* Summary Stats Below Chart */}
            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[hsl(var(--chart-1))]">
                  {totalPipelineDeals}
                </div>
                <div className="text-xs text-muted-foreground">Total Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[hsl(var(--chart-2))]">
                  ${totalPipelineValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => {
                const getIcon = (type: string) => {
                  switch (type) {
                    case "contact":
                      return <Users className="h-4 w-4 text-blue-600" />;
                    case "deal":
                      return <Target className="h-4 w-4 text-green-600" />;
                    case "task":
                      return (
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                      );
                    default:
                      return <Calendar className="h-4 w-4 text-gray-600" />;
                  }
                };

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    {getIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you stay productive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Add Contact</div>
                <div className="text-sm text-gray-600">
                  Create a new contact
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Target className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Create Deal</div>
                <div className="text-sm text-gray-600">Start a new deal</div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Add Task</div>
                <div className="text-sm text-gray-600">Create a new task</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
