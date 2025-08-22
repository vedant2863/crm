import { useState } from "react";
import { Deal } from "../types/deal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateDealRequest } from "../services/dealService";

interface AddDealFormProps {
  onAdd: (deal: CreateDealRequest) => Promise<void>;
  onCancel: () => void;
}

export default function AddDealForm({ onAdd, onCancel }: AddDealFormProps) {
  const [newDeal, setNewDeal] = useState<CreateDealRequest>({
    title: "",
    value: 0,
    contactName: "",
    company: "",
    expectedCloseDate: "",
    notes: "",
    stage: "new",
    probability: 0,
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newDeal.title || newDeal.value <= 0 || !newDeal.contactName) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAdd({
        title: newDeal.title,
        value: Number(newDeal.value),
        contactName: newDeal.contactName,
        company: newDeal.company || undefined,
        expectedCloseDate: newDeal.expectedCloseDate || undefined,
        notes: newDeal.notes || undefined,
        stage: "new",
        probability: 0,
        priority: "medium",
      });

      // Reset form
      setNewDeal({
        title: "",
        value: 0,
        contactName: "",
        company: "",
        expectedCloseDate: "",
        notes: "",
        stage: "new",
        probability: 0,
        priority: "medium",
      });
    } catch (error) {
      console.error("Failed to create deal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Add New Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddDeal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Deal Title *</Label>
              <Input
                placeholder="e.g. Mobile App Development"
                value={newDeal.title}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Deal Value *</Label>
              <Input
                type="number"
                placeholder="e.g. 25000"
                value={newDeal.value}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, value: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Name *</Label>
              <Input
                placeholder="e.g. John Doe"
                value={newDeal.contactName}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, contactName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                placeholder="e.g. StartupXYZ"
                value={newDeal.company}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, company: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={newDeal.expectedCloseDate}
                onChange={(e) =>
                  setNewDeal({
                    ...newDeal,
                    expectedCloseDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add details about this deal..."
                value={newDeal.notes}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, notes: e.target.value })
                }
                rows={3}
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
              disabled={isSubmitting || !newDeal.title || newDeal.value <= 0 || !newDeal.contactName}
            >
              {isSubmitting ? "Adding..." : "Add Deal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
