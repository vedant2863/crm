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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle>Deal Pipeline</CardTitle>
        <CardDescription>Number of deals by stage</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={{
            count: {
              label: "Deals",
              color: "var(--primary)",
            },
          }}
          className="aspect-square max-h-[300px] min-h-[200px] w-full lg:aspect-video"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <XAxis
              dataKey="stage"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              className="text-[10px]"
            />
            <YAxis tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>

        {/* Summary Stats Below Chart */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalPipelineDeals}
            </div>
            <div className="text-xs text-muted-foreground">Total Deals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${totalPipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
