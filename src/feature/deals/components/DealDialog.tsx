"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateDealRequest } from "../services/dealService";
import { Deal } from "../types/deal";
import { Loader2 } from "lucide-react";
import { DEAL_STAGES } from "../constants/deatstage";

interface DealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateDealRequest) => Promise<void>;
    initialData?: Deal | null;
}

export function DealDialog({ open, onOpenChange, onSubmit, initialData }: DealDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        title: "",
        value: 0,
        stage: "new",
        contactName: "",
        company: "",
        probability: 10,
        expectedCloseDate: "",
        notes: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                value: initialData.value,
                stage: initialData.stage,
                contactName: initialData.contactName,
                company: initialData.company || "",
                probability: initialData.probability,
                expectedCloseDate: initialData.expectedCloseDate ? new Date(initialData.expectedCloseDate).toISOString().split('T')[0] : "",
                notes: initialData.notes || "",
            });
        } else {
            setFormData({
                title: "",
                value: 0,
                stage: "new",
                contactName: "",
                company: "",
                probability: 10,
                expectedCloseDate: "",
                notes: "",
            });
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Deal" : "Create New Deal"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Update your deal information and tracking." : "Add a new potential deal to your pipeline."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Deal Title <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Enterprise License"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">Deal Value ($) <span className="text-destructive">*</span></Label>
                            <Input
                                id="value"
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="contactName"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Acme Corp"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stage">Stage</Label>
                            <Select
                                value={formData.stage}
                                onValueChange={(val: any) => setFormData({ ...formData, stage: val })}
                            >
                                <SelectTrigger id="stage">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEAL_STAGES.map(stage => (
                                        <SelectItem key={stage.key} value={stage.key}>{stage.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="probability">Probability (%)</Label>
                            <Input
                                id="probability"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.probability}
                                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expectedCloseDate">Expected Close</Label>
                            <Input
                                id="expectedCloseDate"
                                type="date"
                                value={formData.expectedCloseDate}
                                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Background info, next steps..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Deal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
