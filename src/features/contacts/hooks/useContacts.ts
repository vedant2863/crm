"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Contact } from "@/features/contacts/types/type";
import {
  getContacts,
  deleteContact,
  updateContact,
} from "@/features/contacts/services/contact-client-service";

import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";
import { getSocketClient } from "@/lib/socket/socket-client";

interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  handleDeleteContact: (id: string) => Promise<void>;
  handleUpdateContact: (updated: Contact) => Promise<void>;
}

export function useContacts(): UseContactsReturn {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    return session?.user?.id || "";
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

  // Real-time Socket.IO synchronization for contacts
  useEffect(() => {
    if (typeof window === "undefined" || status !== "authenticated") return;

    const socket = getSocketClient();

    const joinRoom = () => {
      if (session?.user?.id) {
        socket.emit("join:pipeline", {
          userId: session.user.id,
          company: (session.user as { company?: string })?.company,
        });
      }
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const handleContactCreated = (payload: {
      contact: Contact;
      userId: string;
      userName: string;
    }) => {
      setContacts((prev) => [
        payload.contact,
        ...prev.filter((c) => c._id !== payload.contact._id),
      ]);
      if (payload.userId !== session?.user?.id && payload.userName) {
        toast(`👤 ${payload.userName} added contact: "${payload.contact.name}"`, {
          icon: "⚡",
        });
      }
    };

    const handleContactUpdated = (payload: {
      contact: Contact;
      userId: string;
      userName: string;
    }) => {
      setContacts((prev) =>
        prev.map((c) => (c._id === payload.contact._id ? payload.contact : c)),
      );
      if (payload.userId !== session?.user?.id && payload.userName) {
        toast(`🔄 ${payload.userName} updated contact: "${payload.contact.name}"`, {
          icon: "⚡",
        });
      }
    };

    const handleContactDeleted = (payload: {
      contactId: string;
      userId: string;
      userName: string;
    }) => {
      setContacts((prev) => prev.filter((c) => c._id !== payload.contactId));
      if (payload.userId !== session?.user?.id && payload.userName) {
        toast(`🗑️ ${payload.userName} deleted a contact`, { icon: "⚡" });
      }
    };

    socket.on("contact:created", handleContactCreated);
    socket.on("contact:updated", handleContactUpdated);
    socket.on("contact:deleted", handleContactDeleted);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("contact:created", handleContactCreated);
      socket.off("contact:updated", handleContactUpdated);
      socket.off("contact:deleted", handleContactDeleted);
    };
  }, [session, status]);

  const handleDeleteContact = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await deleteContact(id, token);
        setContacts((prev) => prev.filter((c) => c._id !== id));
        toast.success("Contact deleted");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete contact");
      }
    },
    [token],
  );

  const handleUpdateContact = useCallback(
    async (updated: Contact) => {
      if (!token) return;
      try {
        await updateContact(updated, token);
        setContacts((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
        toast.success("Contact updated");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update contact");
      }
    },
    [token],
  );

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    handleDeleteContact,
    handleUpdateContact,
  };
}
