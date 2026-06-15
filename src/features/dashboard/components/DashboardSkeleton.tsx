"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  status?: "loading" | "success" | "error";
  loading?: boolean;
}

export default function DashboardSkeleton({
  status,
  loading,
}: DashboardSkeletonProps) {
  if (status !== "loading" && !loading) {
    return null; // don’t render skeleton when not loading
  }

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
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg"
                  >
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
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                >
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
