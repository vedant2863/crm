import { Contact } from "../type";
import { Pencil, Trash2 } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <div className="p-4 bg-white shadow rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg">{contact.name}</h3>
        <p className="text-gray-600">{contact.email}</p>
        <p className="text-sm text-gray-500">{contact.company}</p>
        <span
          className={`px-2 py-1 text-xs rounded ${
            contact.status === "active"
              ? "bg-green-100 text-green-700"
              : contact.status === "inactive"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {contact.status}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(contact)}
          className="p-2 bg-blue-500 text-white rounded"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(contact._id!)}
          className="p-2 bg-red-500 text-white rounded"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
