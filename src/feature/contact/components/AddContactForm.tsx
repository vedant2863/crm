"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contact } from "../type";

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

  // If initialData changes (e.g., opening form for different contact), update state
  useEffect(() => {
    setNewContact({
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
  }, [initialData]);
  const [loading, setLoading] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target as HTMLFormElement);

      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const company = formData.get("company") as string;
      const position = formData.get("position") as string;
      const location = formData.get("location") as string;

      // Example: send data to API
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });


      if (!res.ok) {
        throw new Error("Failed to add contact");
      }

      onContactAdded();
      setNewContact({
        _id: "",
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        location: "",
        status: "active",
        lastContact: "",
        createdAt: "",
      });
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Contact</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              placeholder="Full Name *"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email *"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              required
            />
            <Input
              name="phone"
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact({ ...newContact, phone: e.target.value })
              }
            />
            <Input
              name="company"
              placeholder="Company"
              value={newContact.company}
              onChange={(e) =>
                setNewContact({ ...newContact, company: e.target.value })
              }
            />
            <Input
              name="position"
              placeholder="Position/Title"
              value={newContact.position}
              onChange={(e) =>
                setNewContact({ ...newContact, position: e.target.value })
              }
            />
            <Input
              name="location"
              placeholder="Location"
              value={newContact.location}
              onChange={(e) =>
                setNewContact({ ...newContact, location: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Contact"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
