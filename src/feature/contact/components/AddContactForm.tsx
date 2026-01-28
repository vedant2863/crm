"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Contact } from "../type";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AddContactFormProps {
  onClose: () => void;
  onContactAdded: () => void;
  initialData?: Contact;
}

export default function AddContactForm({
  onClose,
  onContactAdded,
  initialData,
}: AddContactFormProps) {
  const [newContact, setNewContact] = useState<Contact>({
    _id: initialData?._id ?? "",
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    company: initialData?.company ?? "",
    position: initialData?.position ?? "",
    location: initialData?.location ?? "",
    status: initialData?.status ?? "active",
    lastContact: initialData?.lastContact ?? "",
    createdAt: initialData?.createdAt ?? "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNewContact(initialData);
    }
  }, [initialData]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Simple validation
      if (!newContact.name || !newContact.email) {
        toast.error("Name and Email are required");
        return;
      }

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });

      if (!res.ok) {
        throw new Error("Failed to add contact");
      }

      toast.success("Contact added successfully");
      onContactAdded();
      onClose();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContact(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <Dialog open={true} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your CRM. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddContact} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="John Doe" value={newContact.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" value={newContact.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" value={newContact.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" placeholder="Acme Inc." value={newContact.company} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" name="position" placeholder="Marketing Manager" value={newContact.position} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="New York, NY" value={newContact.location} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
