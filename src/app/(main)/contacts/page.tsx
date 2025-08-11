"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  status: "active" | "inactive" | "prospect";
  lastContact: string;
  createdAt: string;
}

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    location: "",
  });

  // Mock data for demo purposes
  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        setContacts([
          {
            id: "1",
            name: "John Smith",
            email: "john.smith@abc.com",
            phone: "+1 (555) 123-4567",
            company: "ABC Corporation",
            position: "Marketing Manager",
            location: "New York, NY",
            status: "active",
            lastContact: "2024-01-10",
            createdAt: "2024-01-01",
          },
          {
            id: "2",
            name: "Sarah Johnson",
            email: "sarah.j@techstart.com",
            phone: "+1 (555) 987-6543",
            company: "TechStart Inc",
            position: "CEO",
            location: "San Francisco, CA",
            status: "prospect",
            lastContact: "2024-01-08",
            createdAt: "2024-01-05",
          },
          {
            id: "3",
            name: "Mike Davis",
            email: "mike.davis@enterprise.com",
            phone: "+1 (555) 456-7890",
            company: "Enterprise Solutions",
            position: "Sales Director",
            location: "Chicago, IL",
            status: "active",
            lastContact: "2024-01-09",
            createdAt: "2023-12-15",
          },
          {
            id: "4",
            name: "Emily Chen",
            email: "emily.chen@innovate.co",
            phone: "+1 (555) 321-0987",
            company: "Innovate Co",
            position: "Product Manager",
            location: "Austin, TX",
            status: "inactive",
            lastContact: "2023-12-20",
            createdAt: "2023-11-10",
          },
        ]);
        setLoading(false);
      }, 1000);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || contact.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      status: "prospect",
      lastContact: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setContacts([contact, ...contacts]);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      location: "",
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "prospect":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading contacts...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">
            You need to be logged in to access contacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer and prospect contacts
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prospects</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contacts.filter((c) => c.status === "prospect").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">
                  {contacts.filter((c) => c.status === "inactive").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Email *"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Phone Number"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                />
                <Input
                  placeholder="Company"
                  value={newContact.company}
                  onChange={(e) =>
                    setNewContact({ ...newContact, company: e.target.value })
                  }
                />
                <Input
                  placeholder="Position/Title"
                  value={newContact.position}
                  onChange={(e) =>
                    setNewContact({ ...newContact, position: e.target.value })
                  }
                />
                <Input
                  placeholder="Location"
                  value={newContact.location}
                  onChange={(e) =>
                    setNewContact({ ...newContact, location: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Contact</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{contact.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {contact.status.charAt(0).toUpperCase() +
                          contact.status.slice(1)}
                      </span>
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
                          {contact.position && (
                            <span>• {contact.position}</span>
                          )}
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
                      Last Contact:{" "}
                      {new Date(contact.lastContact).toLocaleDateString()} •
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
            ))}

            {filteredContacts.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contacts found</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
