"use client";

import { useEffect, useState } from "react";
import {
  fetchComments,
  addComment,
  ClientComment,
} from "../services/enterprise-client-service";
import { Send, MessageSquare, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface CommentsSectionProps {
  entityId: string;
  entityType: "contact" | "deal" | "task";
}

export default function CommentsSection({
  entityId,
  entityType,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchComments(entityId);
        setComments(data);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      const added = await addComment(entityId, entityType, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t mt-4">
      <h4 className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
        <MessageSquare className="h-3.5 w-3.5 text-primary" /> Comments & Collaboration
      </h4>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="text-[11px] italic text-muted-foreground py-2">
              No comments yet. Write a note to collaborate.
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c._id}
                className="p-3 rounded-2xl bg-muted/30 border border-border/40 text-xs"
              >
                <div className="flex items-center justify-between gap-2 text-muted-foreground font-semibold mb-1">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-primary" />
                    <span className="text-foreground">{c.userName}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px]">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(c.createdAt).toLocaleDateString()} at{" "}
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-foreground/90 font-medium leading-relaxed leading-snug">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a comment or collaborator note..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="text-xs bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/20"
          disabled={submitting}
        />
        <Button
          type="submit"
          size="sm"
          className="font-bold flex items-center gap-1 px-3"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
