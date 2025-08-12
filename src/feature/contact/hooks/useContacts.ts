import { useEffect, useState } from "react";
import { Contact } from "../type";


export default function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch("http://localhost:5000/api/contacts");
        const data = await res.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  return { contacts, loading };
}
