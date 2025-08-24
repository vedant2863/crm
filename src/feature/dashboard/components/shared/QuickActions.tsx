"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, Target, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "Add Contact",
      description: "Create a new contact",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      onClick: () => router.push("/contacts/new"), // navigate to new contact page
    },
    {
      label: "Create Deal",
      description: "Start a new deal",
      icon: <Target className="h-5 w-5 text-green-600" />,
      onClick: () => router.push("/deals/new"),
    },
    {
      label: "Add Task",
      description: "Create a new task",
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
      onClick: () => router.push("/tasks/new"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to help you stay productive
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {action.icon}
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-sm text-gray-600">
                  {action.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
