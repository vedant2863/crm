// components/DealList.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  ArrowRight,
  Target,
  Trash2,
} from "lucide-react";
import { Deal } from "../types/deal";
import { useState } from "react";
import { CreateDealRequest } from "../services/dealService";
import EditDealForm from "./EditDealForm";

interface DealListProps {
  stages: { key: string; label: string; color: string }[];
  getStageColor: (stage: string) => string;
  deals: Deal[];
  onUpdateDeal?: (id: string, dealData: Partial<CreateDealRequest>) => Promise<unknown>;
  onDeleteDeal?: (id: string) => Promise<void>;
}

export default function DealList({
  stages,
  deals,
  getStageColor,
  onUpdateDeal,
  onDeleteDeal,
}: DealListProps) {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const handleDelete = async (dealId: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await onDeleteDeal?.(dealId);
      } catch (error) {
        console.error("Failed to delete deal:", error);
        alert("Failed to delete deal. Please try again.");
      }
    }
  };

  const handleUpdate = async (dealData: Partial<CreateDealRequest>) => {
    if (editingDeal) {
      try {
        await onUpdateDeal?.(editingDeal._id, dealData);
        setEditingDeal(null);
      } catch (error) {
        console.error("Failed to update deal:", error);
        alert("Failed to update deal. Please try again.");
      }
    }
  };

  const getNextStage = (currentStage: string) => {
    const currentIndex = stages.findIndex(stage => stage.key === currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const handleStageAdvance = async (deal: Deal) => {
    const nextStage = getNextStage(deal.stage);
    if (nextStage && onUpdateDeal) {
      try {
        await onUpdateDeal(deal._id, { stage: nextStage.key });
      } catch (error) {
        console.error("Failed to advance deal stage:", error);
        alert("Failed to advance deal stage. Please try again.");
      }
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal List ({deals.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                {/* Left section */}
                <div className="flex-1">
                  {/* Title, Stage, Value */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{deal.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                        deal.stage
                      )}`}
                    >
                      {stages.find((s) => s.key === deal.stage)?.label}
                    </span>

                    <span className="text-lg font-bold text-green-600">
                      ${deal.value.toLocaleString()}
                    </span>
                  </div>

                  {/* Deal info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {deal.contactName} at {deal.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Close:{" "}
                        {new Date(
                          deal.expectedCloseDate ?? ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Probability: {deal.probability}%</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {deal.notes && (
                    <p className="text-sm text-gray-600 mb-2">{deal.notes}</p>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500">
                    Created: {new Date(deal.createdAt).toLocaleDateString()} •
                    Last Activity:{" "}
                    {new Date(deal.lastActivity ?? "").toLocaleDateString()}
                  </div>
                </div>

                {/* Right section: Actions */}
                <div className="flex items-center gap-2">
                  {/* View Deal */}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Edit Deal */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDeal(deal)}
                    disabled={!onUpdateDeal}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {/* Move Deal to Next Stage */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStageAdvance(deal)}
                    disabled={!onUpdateDeal || !getNextStage(deal.stage)}
                    title={getNextStage(deal.stage) ? `Move to ${getNextStage(deal.stage)?.label}` : "Already at final stage"}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* Delete Deal */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(deal._id)}
                    disabled={!onDeleteDeal}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {deals.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deals found</p>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Edit Deal Modal */}
        {editingDeal && (
          <div className="mt-6">
            <EditDealForm
              deal={editingDeal}
              onUpdate={handleUpdate}
              onCancel={() => setEditingDeal(null)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
