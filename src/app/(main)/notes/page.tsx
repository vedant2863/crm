"use client";


import { useEffect, useState, useCallback } from "react";

import {
  Pin,
  Trash2,
  Edit,
  Plus,
  Search,
  Calendar,
  Link2,
  StickyNote,
  AlertCircle,
  Table,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

interface Note {
  _id: string;
  title?: string;
  content: string;
  pinned: boolean;
  dealId?: {
    _id: string;
    title: string;
    company?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  _id: string;
  title: string;
  company?: string;
}

export default function NotesPage() {
  const { status } = useSession();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [notes, setNotes] = useState<Note[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pinned: false,
    dealId: "",
  });

  const fetchNotes = useCallback(async () => {
    try {
      const url = `/api/notes?search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [searchTerm]);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch("/api/deals?limit=100");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err: any) {
      console.error("Error loading leads for dropdown:", err);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      Promise.all([fetchNotes(), fetchDeals()]).finally(() =>
        setLoading(false),
      );
    }
  }, [status, fetchNotes, fetchDeals]);

  const handleOpenDialog = (note: Note | null = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title || "",
        content: note.content,
        pinned: note.pinned,
        dealId: note.dealId?._id || "",
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: "",
        content: "",
        pinned: false,
        dealId: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    const payload = {
      title: formData.title || undefined,
      content: formData.content,
      pinned: formData.pinned,
      dealId: formData.dealId || null, // null will clear it on the server
    };

    try {
      let res;
      if (editingNote) {
        res = await fetch(`/api/notes/${editingNote._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save note");

      toast.success(editingNote ? "Note updated" : "Note created");
      setDialogOpen(false);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      toast.success("Note deleted");
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      toast.success(note.pinned ? "Note unpinned" : "Note pinned");
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to update note");
    }
  };

  if (status === "loading" || (loading && notes.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please log in to access notes.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Notes</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchNotes}>Try Again</Button>
        </div>
      </div>
    );
  }

  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">
            Keep track of client discussions and lead context.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Note
        </Button>
      </div>

      {/* Search & Toggle row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card border rounded-3xl p-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex items-center gap-1 border p-1 rounded-full bg-muted/30 shrink-0 self-stretch md:self-auto justify-center">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-full h-8"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-full h-8"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <>
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Pin className="h-3 w-3 fill-current rotate-45" /> Pinned Notes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          <div className="space-y-3">
            {pinnedNotes.length > 0 && otherNotes.length > 0 && (
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Notes
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {otherNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>

            {notes.length === 0 && (
              <div className="text-center py-20 bg-card border rounded-2xl border-dashed">
                <StickyNote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No notes found</h3>
                <p className="text-muted-foreground">
                  Create notes to keep details structured.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/20 font-bold uppercase tracking-wider text-muted-foreground/80">
                  <th className="p-4 w-10">Pin</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Content</th>
                  <th className="p-4">Linked Lead</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-left">
                {notes.map((note) => {
                  return (
                    <tr key={note._id} className="hover:bg-muted/15 transition-colors group/row">
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePin(note)}
                          className={cn(
                            "p-1 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-primary transition-all",
                            note.pinned && "text-primary hover:text-primary/80"
                          )}
                        >
                          <Pin className={cn("h-4 w-4 rotate-45", note.pinned && "fill-current")} />
                        </button>
                      </td>
                      <td className="p-4 font-bold text-foreground max-w-[150px] truncate">
                        {note.title || <span className="text-muted-foreground italic font-normal">Untitled</span>}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-[300px] truncate">
                        {note.content}
                      </td>
                      <td className="p-4">
                        {note.dealId ? (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                            {note.dealId.title}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {new Date(note.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(note)}
                            className="hover:bg-primary/5 hover:text-primary border-border/50 h-7"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 hover:text-destructive h-7"
                            onClick={() => handleDelete(note._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {notes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground font-medium">
                      No notes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit Note" : "Create Note"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Meeting notes, Product feedback..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                rows={4}
                required
                placeholder="Type your note content here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full text-sm p-3 rounded-2xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dealId">Link to Lead (Optional)</Label>
              <select
                id="dealId"
                value={formData.dealId}
                onChange={(e) =>
                  setFormData({ ...formData, dealId: e.target.value })
                }
                className="w-full text-sm p-3 rounded-2xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Unlinked (General Note)</option>
                {deals.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} {d.company ? `(${d.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                id="pinned"
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) =>
                  setFormData({ ...formData, pinned: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="pinned" className="cursor-pointer">
                Pin this note to the top
              </Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <div className="group relative bg-card border rounded-3xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col gap-3 min-h-[140px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm text-foreground">
          {note.title || "Untitled Note"}
        </h3>
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${note.pinned ? "text-primary fill-current rotate-0" : "text-muted-foreground rotate-45"}`}
            title={note.pinned ? "Unpin Note" : "Pin Note"}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit Note"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            title="Delete Note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed flex-1">
        {note.content}
      </p>

      {/* Footer Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 mt-1 text-[10px] text-muted-foreground">
        {/* Linked Lead Info */}
        {note.dealId ? (
          <div className="flex items-center gap-1 max-w-[60%] text-primary font-bold">
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="truncate" title={note.dealId.title}>
              {note.dealId.title}{" "}
              {note.dealId.company ? `(${note.dealId.company})` : ""}
            </span>
          </div>
        ) : (
          <span className="italic opacity-50">General Note</span>
        )}

        {/* Date */}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
