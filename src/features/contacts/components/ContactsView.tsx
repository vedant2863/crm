"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Filter, UserCheck, UserPlus, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddContactForm from "./AddContactForm";
import EditContactForm from "./EditContactForm";
import ContactList from "./ContactList";
import Pagination from "@/components/Pagination";
import { useContacts } from "../hooks/useContacts";
import { ModalState, Contact } from "../types/type";
import { usePaginated } from "@/hooks/usePaginated";
import { useSession } from "@/lib/auth/auth-client";
import {
  PageHeader,
  MetricCard,
  SearchInput,
  ViewToggle,
  LoadingSkeleton,
  AuthRequired,
  StatusBadge,
  ConfirmDialog,
} from "@/components/common";

export function ContactsView() {
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
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") fetchContacts();
  }, [status, fetchContacts]);

  if (status === "loading" || loading) {
    return <LoadingSkeleton type="page" />;
  }

  if (status === "unauthenticated") {
    return <AuthRequired description="Please log in to manage your contacts." />;
  }

  const activeCount = contacts.filter((c) => c.status === "active").length;
  const prospectCount = contacts.filter((c) => c.status === "prospect").length;
  const inactiveCount = contacts.filter((c) => c.status === "inactive").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <PageHeader
        title="Contacts"
        description="Manage your customer database and relationships."
        actions={
          <Button
            onClick={() => setModal({ ...modal, add: true })}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Contacts"
          value={contacts.length}
          icon={Users}
          accent="primary"
          subtitle="All records"
        />
        <MetricCard
          label="Active"
          value={activeCount}
          icon={UserCheck}
          accent="emerald"
          subtitle="Active relationships"
        />
        <MetricCard
          label="Prospects"
          value={prospectCount}
          icon={UserPlus}
          accent="blue"
          subtitle="Potential leads"
        />
        <MetricCard
          label="Inactive"
          value={inactiveCount}
          icon={UserX}
          accent="default"
          subtitle="Dormant contacts"
        />
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <SearchInput
          placeholder="Search contacts by name, email, company..."
          value={filters.searchTerm}
          onChange={(val) =>
            setFilters((f) => ({
              ...f,
              searchTerm: val,
              page: 1,
            }))
          }
          className="w-full md:max-w-md"
        />

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="w-48 text-left">
            <Select
              value={filters.status}
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, status: val, page: 1 }))
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
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

          <ViewToggle<"list" | "table">
            mode={viewMode}
            onChange={setViewMode}
            options={[
              { value: "list", label: "Cards" },
              { value: "table", label: "Table" },
            ]}
          />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteContactId}
        onOpenChange={(open) => !open && setDeleteContactId(null)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (deleteContactId) {
            await handleDeleteContact(deleteContactId);
            setDeleteContactId(null);
          }
        }}
      />

      {/* List + Pagination */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {viewMode === "list" ? (
          <ContactList
            contacts={paginatedContacts}
            onEdit={(c) => setModal({ ...modal, edit: c })}
            handleDeleteContact={async (id) => setDeleteContactId(id)}
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
                        <StatusBadge status={contact.status} />
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
                            onClick={() => setDeleteContactId(contact._id)}
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

export default ContactsView;
