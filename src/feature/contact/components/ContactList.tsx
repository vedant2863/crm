import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyContactState from "./EmptyContactState";
import ContactListItem from "./ContactListItem"; // Import the actual item component
import { Contact } from "../type";

interface ContactListProps {
  contacts: Contact[];
  handleDeleteContact: (id: string) => Promise<void>;
  onEdit: (contact: Contact) => void;
}

export default function ContactList({
  contacts,
  handleDeleteContact,
  onEdit,
}: ContactListProps) {
  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Contact List ({contacts.length})</CardTitle> */}
        <CardTitle>Contact List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <ContactListItem
                key={contact._id}
                contact={contact}
                handleDeleteContact={handleDeleteContact}
                onEditContact={onEdit}
              />
            ))
          ) : (
            <EmptyContactState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
