"use client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Clock, UserPlus, DollarSign, CheckCircle } from "lucide-react";

type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
};

export default function RecentActivity({
  activities,
}: {
  activities: Activity[];
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "deal":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "task":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="mt-1">{getIcon(activity.type)}</div>
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
