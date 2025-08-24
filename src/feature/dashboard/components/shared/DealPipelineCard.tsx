"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PipelineData = {
  stage: string;
  count: number;
};

type DealPipelineCardProps = {
  chartData: PipelineData[];
  totalPipelineDeals: number;
  totalPipelineValue: number;
};

export default function DealPipelineCard({
  chartData,
  totalPipelineDeals,
  totalPipelineValue,
}: DealPipelineCardProps) {
  return (
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
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
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
  );
}
