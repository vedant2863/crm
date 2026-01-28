"use client";

import { useState, useCallback, useMemo } from "react";
import { Contact } from "@/feature/contact/type";
import { getContacts, deleteContact, updateContact } from "@/feature/contact/services/contactService";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface UseContactsReturn {
    contacts: Contact[];
    loading: boolean;
    error: string | null;
    fetchContacts: () => Promise<void>;
    handleDeleteContact: (id: string) => Promise<void>;
    handleUpdateContact: (updated: Contact) => Promise<void>;
}

export function useContacts(): UseContactsReturn {
    const { data: session } = useSession();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = useMemo(() => {
        return session?.accessToken || session?.user?.id || "";
    }, [session]);

    const fetchContacts = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getContacts(token);
            setContacts(data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch contacts");
            toast.error("Failed to fetch contacts");
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleDeleteContact = useCallback(async (id: string) => {
        if (!token) return;
        try {
            await deleteContact(id, token);
            setContacts((prev) => prev.filter((c) => c._id !== id));
            toast.success("Contact deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete contact");
        }
    }, [token]);

    const handleUpdateContact = useCallback(async (updated: Contact) => {
        if (!token) return;
        try {
            await updateContact(updated, token);
            setContacts((prev) =>
                prev.map((c) => (c._id === updated._id ? updated : c))
            );
            toast.success("Contact updated");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update contact");
        }
    }, [token]);

    return {
        contacts,
        loading,
        error,
        fetchContacts,
        handleDeleteContact,
        handleUpdateContact
    };
}
