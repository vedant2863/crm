"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "../type";

interface EditContactFormProps {
  contact: Contact;
  onClose: () => void;
  onContactUpdated: (updatedContact: Contact) => void;
}

export default function EditContactForm({
  contact,
  onClose,
  onContactUpdated,
}: EditContactFormProps) {
  const [formData, setFormData] = useState<Contact>(contact);

  useEffect(() => {
    setFormData(contact); // update form data if contact changes
  }, [contact]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContactUpdated(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg max-w-md w-full space-y-4"
      >
        <h2 className="text-xl font-semibold">Edit Contact</h2>

        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <Input
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder="Phone"
        />
        <Input
          name="company"
          value={formData.company || ""}
          onChange={handleChange}
          placeholder="Company"
        />
        <Input
          name="position"
          value={formData.position || ""}
          onChange={handleChange}
          placeholder="Position"
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
