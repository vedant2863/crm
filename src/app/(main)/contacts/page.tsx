"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Users, Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "@/feature/contact/components/StatsCard";
import AddContactForm from "@/feature/contact/components/AddContactForm";
import EditContactForm from "@/feature/contact/components/EditContactForm";
import ContactList from "@/feature/contact/components/ContactList";
import Pagination from "@/components/Pagination";
import { useContacts } from "@/feature/contact/hooks/useContacts";
import { usePaginatedContacts } from "@/hooks/usePaginatedContacts";
import { Skeleton } from "@/components/ui/skeleton";
import { ModalState } from "@/feature/contact/type";

function ContactsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const { status } = useSession();
  const { contacts, loading, fetchContacts, handleDeleteContact, handleUpdateContact } = useContacts();

  // UI state
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
    page: 1,
    perPage: 5,
  });

  const { paginatedContacts, total } = usePaginatedContacts(contacts, filters);
  const [modal, setModal] = useState<ModalState>({ add: false, edit: null });

  useEffect(() => {
    if (status === "authenticated") fetchContacts();
  }, [status, fetchContacts]);

  if (status === "loading" || loading) {
    return <ContactsSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to manage your contacts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database and relationships.
          </p>
        </div>
        <Button onClick={() => setModal({ ...modal, add: true })} className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Contacts"
          value={contacts.length}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          label="Active"
          value={contacts.filter((c) => c.status === "active").length}
          valueColor="text-emerald-600"
          bgColor="bg-emerald-100 dark:bg-emerald-900/20"
          dotColor="bg-emerald-500"
        />
        <StatsCard
          label="Prospects"
          value={contacts.filter((c) => c.status === "prospect").length}
          valueColor="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/20"
          dotColor="bg-blue-500"
        />
        <StatsCard
          label="Inactive"
          value={contacts.filter((c) => c.status === "inactive").length}
          valueColor="text-muted-foreground"
          bgColor="bg-muted"
          dotColor="bg-muted-foreground"
        />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            className="pl-9 bg-background"
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={filters.status}
            onValueChange={(val) => setFilters((f) => ({ ...f, status: val, page: 1 }))}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Modals */}
      {modal.add && (
        <AddContactForm
          onClose={() => setModal((m) => ({ ...m, add: false }))}
          onContactAdded={() => {
            fetchContacts();
            setModal((m) => ({ ...m, add: false }));
          }}
        />
      )}
      {modal.edit && (
        <EditContactForm
          contact={modal.edit}
          onClose={() => setModal((m) => ({ ...m, edit: null }))}
          onContactUpdated={(c) => {
            handleUpdateContact(c);
            setModal((m) => ({ ...m, edit: null }));
          }}
        />
      )}

      {/* List + Pagination */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <ContactList
          contacts={paginatedContacts}
          onEdit={(c) => setModal({ ...modal, edit: c })}
          handleDeleteContact={handleDeleteContact}
        />
        <div className="p-4 border-t">
          <Pagination
            total={total}
            perPage={filters.perPage}
            currentPage={filters.page}
            setCurrentPage={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      </div>
    </div>
  );
}
