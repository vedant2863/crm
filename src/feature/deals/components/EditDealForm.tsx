"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Deal } from "../types/deal";
import { CreateDealRequest } from "../services/dealService";
import { DEAL_STAGES } from "../constants/deatstage";

interface EditDealFormProps {
  deal: Deal;
  onUpdate: (dealData: Partial<CreateDealRequest>) => Promise<void>;
  onCancel: () => void;
}

export default function EditDealForm({
  deal,
  onUpdate,
  onCancel,
}: EditDealFormProps) {
  const [editedDeal, setEditedDeal] = useState<Deal>({
    ...deal,
    expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editedDeal.title || editedDeal.value <= 0 || !editedDeal.contactName) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdate({
        title: editedDeal.title,
        value: Number(editedDeal.value),
        contactName: editedDeal.contactName,
        company: editedDeal.company || undefined,
        expectedCloseDate: editedDeal.expectedCloseDate || undefined,
        notes: editedDeal.notes || undefined,
        stage: editedDeal.stage,
        probability: editedDeal.probability,
      });
    } catch (error) {
      console.error("Failed to update deal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Deal Title *</Label>
              <Input
                placeholder="e.g. Mobile App Development"
                value={editedDeal.title}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, title: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Deal Value *</Label>
              <Input
                type="number"
                placeholder="e.g. 25000"
                value={editedDeal.value}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, value: Number(e.target.value) })
                }
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Name *</Label>
              <Input
                placeholder="e.g. John Doe"
                value={editedDeal.contactName}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, contactName: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                placeholder="e.g. StartupXYZ"
                value={editedDeal.company || ''}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, company: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editedDeal.stage}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, stage: e.target.value as Deal['stage'] })
                }
                disabled={isSubmitting}
              >
                {DEAL_STAGES.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editedDeal.probability}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, probability: Number(e.target.value) })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={editedDeal.expectedCloseDate}
                onChange={(e) =>
                  setEditedDeal({
                    ...editedDeal,
                    expectedCloseDate: e.target.value,
                  })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add details about this deal..."
                value={editedDeal.notes || ''}
                onChange={(e) =>
                  setEditedDeal({ ...editedDeal, notes: e.target.value })
                }
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !editedDeal.title || editedDeal.value <= 0 || !editedDeal.contactName}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
