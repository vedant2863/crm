import { memo } from "react";
import { Building, Edit, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactStatusBadge from "./ContactStatusBadge";
import { Contact } from "../types/type";

interface ContactListItemProps {
  contact: Contact;
  handleDeleteContact: (id: string) => Promise<void>;
  onEditContact: (contact: Contact) => void;
}

const ContactListItem = memo(function ContactListItem({
  contact,
  handleDeleteContact,
  onEditContact,
}: ContactListItemProps) {
  return (
    <div className="border rounded-2xl p-5 hover:bg-muted/40 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 group/item relative overflow-hidden bg-card/45 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-bold text-foreground truncate">{contact.name}</h3>
            <ContactStatusBadge status={contact.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              <a
                href={`mailto:${contact.email}`}
                className="text-primary hover:underline truncate"
              >
                {contact.email}
              </a>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-primary hover:underline truncate"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 min-w-0">
                <Building className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{contact.company} {contact.position && `• ${contact.position}`}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{contact.location}</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-[10px] text-muted-foreground/80 font-semibold uppercase tracking-wider">
            Last Contact: {new Date(contact.lastContact).toLocaleDateString()} •
            Added: {new Date(contact.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditContact(contact)}
            className="hover:bg-primary/5 hover:text-primary border-border/50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 hover:text-destructive"
            onClick={() => {
              handleDeleteContact(contact._id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
})

export default ContactListItem;
