// components/PipelineBoard.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Building, Calendar } from "lucide-react";
import { Deal } from "../types/deal";

interface Stage {
  key: string;
  label: string;
}

interface PipelineBoardProps {
  stages: Stage[];
  deals: Deal[];
}

export default function PipelineBoard({ stages, deals }: PipelineBoardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {stages.slice(0, -2).map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage.key);

        return (
          <Card key={stage.key} className="min-h-96">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {stage.label}
              </CardTitle>
              <div className="text-xs text-gray-500">
                {stageDeals.length} deals • $
                {stageDeals
                  .reduce((sum, deal) => sum + deal.value, 0)
                  .toLocaleString()}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {stageDeals.map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">
                    {deal.title}
                  </h4>
                  <p className="text-lg font-bold text-green-600 mb-2">
                    ${deal.value.toLocaleString()}
                  </p>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{deal.contactName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{deal.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {deal.expectedCloseDate
                          ? new Date(
                              deal.expectedCloseDate
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {deal.probability}%
                    </span>
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No deals in this stage
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
