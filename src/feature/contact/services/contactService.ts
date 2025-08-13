import { Contact } from "@/feature/contact/type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getContacts(token: string): Promise<Contact[]> {
  const res = await fetch(`${API_URL}/api/contacts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.contacts;
}

export async function updateContact(contact: Contact, token: string) {
  const res = await fetch(`${API_URL}/api/contacts/${contact._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contact),
  });
  return res.json();
}

export async function deleteContact(id: string, token: string) {
  await fetch(`${API_URL}/api/contacts/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
