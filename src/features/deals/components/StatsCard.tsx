import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  valueColor?: string;
  bgColor?: string;
  dotColor?: string;
}

export default function StatsCard({
  label,
  value,
  icon,
  valueColor = "text-gray-600",
  bgColor,
  dotColor,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          </div>
          {icon ? (
            icon
          ) : bgColor && dotColor ? (
            <div
              className={`h-8 w-8 ${bgColor} rounded-full flex items-center justify-center`}
            >
              <div className={`h-3 w-3 ${dotColor} rounded-full`}></div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
