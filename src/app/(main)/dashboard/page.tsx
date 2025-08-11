"use client";

import { useState, useEffect } from "react";
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

interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo purposes
    // In a real app, you'd fetch this from your API
    const fetchStats = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStats({
            totalContacts: 156,
            totalDeals: 42,
            totalRevenue: 125000,
            conversionRate: 23.5,
            recentActivities: [
              {
                id: "1",
                type: "contact",
                description: "New contact added: John Smith from ABC Corp",
                timestamp: "2 minutes ago"
              },
              {
                id: "2",
                type: "deal",
                description: "Deal moved to negotiation stage",
                timestamp: "15 minutes ago"
              },
              {
                id: "3",
                type: "task",
                description: "Task completed: Follow up with lead",
                timestamp: "1 hour ago"
              }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchStats();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading dashboard...</div>
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
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">+7 from last month</p>
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
        {/* Deal Pipeline Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Overview of deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New</span>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-200 h-2 w-16 rounded" />
                  <span className="text-sm text-gray-600">12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contacted</span>
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-200 h-2 w-12 rounded" />
                  <span className="text-sm text-gray-600">8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Negotiation</span>
                <div className="flex items-center gap-2">
                  <div className="bg-orange-200 h-2 w-8 rounded" />
                  <span className="text-sm text-gray-600">5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Won</span>
                <div className="flex items-center gap-2">
                  <div className="bg-green-200 h-2 w-20 rounded" />
                  <span className="text-sm text-gray-600">17</span>
                </div>
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
