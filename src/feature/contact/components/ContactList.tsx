import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ContactListItem from "./ContactListItem";
import EmptyContactState from "./EmptyContactState";
import { Contact } from "../type";

interface ContactListProps {
  contacts: Contact[];
}

export default function ContactList({ contacts }: ContactListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact List ({contacts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <ContactListItem key={contact.id} contact={contact} />
            ))
          ) : (
            <EmptyContactState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
