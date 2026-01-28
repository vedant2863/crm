"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Users, Search, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/feature/contact/components/StatsCard";
import AddContactForm from "@/feature/contact/components/AddContactForm";
import EditContactForm from "@/feature/contact/components/EditContactForm";
import ContactList from "@/feature/contact/components/ContactList";
import Pagination from "@/components/Pagination";
import { Contact, ModalState } from "@/feature/contact/type";
import {
  deleteContact,
  getContacts,
  updateContact,
} from "@/feature/contact/services/contactService";
import { usePaginatedContacts } from "@/hooks/usePaginatedContacts";

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
    page: 1,
    perPage: 5,
  });

  const { paginatedContacts, total } = usePaginatedContacts(contacts, filters);

  const [modal, setModal] = useState<ModalState>({ add: false, edit: null });

  const token = useMemo(() => {
    return session?.accessToken || session?.user?.id || "";
  }, [session]);

  /** Fetch contacts */
  const fetchContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getContacts(token);
      console.log("fetched contacts:", data);
      setContacts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  /** Initial load when authenticated */
  useEffect(() => {
    if (status === "authenticated") fetchContacts();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, fetchContacts]);

  /** Handle update */
  const handleUpdateContact = useCallback(
    async (updated: Contact) => {
      try {
        if (!token || typeof token !== "string") {
          console.error("No valid token available for deleting contact.");
          return;
        }
        await updateContact(updated, token);
        setContacts((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
        setModal((m) => ({ ...m, edit: null }));
      } catch (err) {
        console.error(err);
      }
    },
    [token]
  );

  /** Handle delete */
  const handleDeleteContact = async (id: string) => {
    if (!token || typeof token !== "string") {
      console.error("No valid token available for deleting contact.");
      return;
    }
    try {
      await deleteContact(id, token);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      if ((filters.page - 1) * filters.perPage >= contacts.length - 1) {
        setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const isLoading = status === "loading" || loading;
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Filter Skeleton */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>

        {/* Contact List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64" />
        </div>
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
        <Button onClick={() => setModal({ ...modal, add: true })}>
          <Plus className="h-4 w-4 mr-2" /> Add Contact
        </Button>
      </div>

      {/* Stats */}
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

      {/* Search + Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  searchTerm: e.target.value,
                  page: 1,
                }))
              }
              className="pl-10"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
            }
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

      {/* Modals */}
      {modal.add && (
        <AddContactForm
          onClose={() => setModal((m) => ({ ...m, add: false }))}
          onContactAdded={fetchContacts}
        />
      )}
      {modal.edit && (
        <EditContactForm
          contact={modal.edit}
          onClose={() => setModal((m) => ({ ...m, edit: null }))}
          onContactUpdated={handleUpdateContact}
        />
      )}

      {/* List + Pagination */}
      <ContactList
        contacts={paginatedContacts}
        onEdit={(c) => setModal({ ...modal, edit: c })}
        handleDeleteContact={handleDeleteContact}
      />
      <Pagination
        total={total}
        PerPage={filters.perPage}
        currentPage={filters.page}
        setCurrentPage={(p) => setFilters((f) => ({ ...f, page: p }))}
      />
    </div>
  );
}
