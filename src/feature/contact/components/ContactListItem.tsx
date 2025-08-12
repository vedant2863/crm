import { Building, Edit, Eye, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactStatusBadge from "./ContactStatusBadge";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  status: string;
  lastContact: string;
  createdAt: string;
}

interface ContactListItemProps {
  key: string;
  contact: Contact;
}

export default function ContactListItem({ contact, key }: ContactListItemProps) {
  return (
    <div key={key} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{contact.name}</h3>
            <ContactStatusBadge status={contact.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:underline"
              >
                {contact.email}
              </a>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{contact.company}</span>
                {contact.position && <span>• {contact.position}</span>}
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{contact.location}</span>
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Last Contact: {new Date(contact.lastContact).toLocaleDateString()} •
            Added: {new Date(contact.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
