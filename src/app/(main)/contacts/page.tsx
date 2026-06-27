"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Filter, Table, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatsCard from "@/features/contacts/components/StatsCard";
import AddContactForm from "@/features/contacts/components/AddContactForm";
import EditContactForm from "@/features/contacts/components/EditContactForm";
import ContactList from "@/features/contacts/components/ContactList";
import ContactStatusBadge from "@/features/contacts/components/ContactStatusBadge";
import Pagination from "@/components/Pagination";
import { useContacts, ModalState } from "@/features/contacts";
import { usePaginated } from "@/hooks/usePaginated";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/auth-client";

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
  );
}

export default function ContactsPage() {
  const { status } = useSession();
  const {
    contacts,
    loading,
    fetchContacts,
    handleDeleteContact,
    handleUpdateContact,
  } = useContacts();

  // UI state
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
    page: 1,
    perPage: 5,
  });

  const { paginatedContacts, total } = usePaginated(contacts, filters, [
    "name",
    "email",
    "phone",
    "company",
    "position",
  ]);
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
          <p className="text-muted-foreground">
            Please log in to manage your contacts.
          </p>
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
        <Button
          onClick={() => setModal({ ...modal, add: true })}
          className="shadow-lg hover:shadow-xl transition-all"
        >
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
        <div className="w-full md:w-48 text-left">
          <Select
            value={filters.status}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, status: val, page: 1 }))
            }
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
        <div className="flex items-center gap-1 border p-1 rounded-full bg-muted/30 shrink-0 self-stretch md:self-auto justify-center">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-full h-8"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-full h-8"
          >
            <Table className="h-4 w-4" />
          </Button>
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
        {viewMode === "list" ? (
          <ContactList
            contacts={paginatedContacts}
            onEdit={(c) => setModal({ ...modal, edit: c })}
            handleDeleteContact={handleDeleteContact}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/20 font-bold uppercase tracking-wider text-muted-foreground/80">
                  <th className="p-4">Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Company & Position</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedContacts.map((contact) => {
                  const initial = contact.name ? contact.name.charAt(0).toUpperCase() : "C";
                  return (
                    <tr key={contact._id} className="hover:bg-muted/15 transition-colors group/row">
                      <td className="p-4 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {initial}
                        </div>
                        <span className="text-foreground font-black group-hover/row:text-primary transition-colors">{contact.name}</span>
                      </td>
                      <td className="p-4">
                        <ContactStatusBadge status={contact.status} />
                      </td>
                      <td className="p-4">
                        <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                      </td>
                      <td className="p-4">
                        {contact.phone ? (
                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {contact.company ? (
                          <span>{contact.company} {contact.position && `• ${contact.position}`}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModal({ ...modal, edit: contact })}
                            className="hover:bg-primary/5 hover:text-primary border-border/50 h-7"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 hover:text-destructive h-7"
                            onClick={() => handleDeleteContact(contact._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedContacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground font-medium">
                      No contacts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
