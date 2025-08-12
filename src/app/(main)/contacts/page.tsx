"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Users, Search, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/feature/contact/components/StatsCard";
import AddContactForm from "@/feature/contact/components/AddContactForm";
import ContactList from "@/feature/contact/components/ContactList";
import { Contact } from "@/feature/contact/type";

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ Fetch contacts from API
  useEffect(() => {
    if (status === "authenticated") {
      fetchContacts();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              session?.accessToken || session?.user?.id
            }`,
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Failed to fetch contacts", {
          cause: new Error(errorText),
        });
      }
      const data = await res.json();

      // Ensure we got an array
      if (!Array.isArray(data.contacts)) {
        console.error("API did not return an array:", data);
        throw new Error("API did not return an array");
      }

      setContacts(data.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    fetchContacts();
    setShowAddForm(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || contact.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">
            You need to be logged in to access contacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer and prospect contacts
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
        <StatsCard
          label="Total Contacts"
          value={contacts.length}
          icon={<Users className="h-8 w-8 text-blue-600" />}
        />
        <StatsCard
          label="Active"
          value={contacts.filter((c) => c.status === "active").length}
          valueColor="text-green-600"
          bgColor="bg-green-100"
          dotColor="bg-green-600"
        />
        <StatsCard
          label="Prospects"
          value={contacts.filter((c) => c.status === "prospect").length}
          valueColor="text-blue-600"
          bgColor="bg-blue-100"
          dotColor="bg-blue-600"
        />
        <StatsCard
          label="Inactive"
          value={contacts.filter((c) => c.status === "inactive").length}
          valueColor="text-gray-600"
          bgColor="bg-gray-100"
          dotColor="bg-gray-600"
        />
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Form */}
      {showAddForm && (
        <AddContactForm
          onClose={() => setShowAddForm(false)}
          onContactAdded={handleAddContact}
        />
      )}

      {/* Contacts List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <ContactList contacts={filteredContacts} />
      )}
    </div>
  );
}
