
import dbConnect from "@/lib/dbConnect";
import Note, { INote } from "@/models/note";
import "@/models/deal";
import mongoose, { FilterQuery } from "mongoose";

interface GetNotesParams {
  userId: string;
  search?: string | null;
  dealId?: string | null;
}

export async function getNotes({ userId, search, dealId }: GetNotesParams) {
  await dbConnect();

  const query: FilterQuery<INote> = { userId };

  if (dealId) {
    query.dealId = new mongoose.Types.ObjectId(dealId);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const notes = await Note.find(query)
    .sort({ pinned: -1, updatedAt: -1 })
    .populate("dealId", "title company")
    .maxTimeMS(10_000)
    .lean();

  return notes;
}

export async function createNote(userId: string, data: Partial<INote>) {
  await dbConnect();
  const note = new Note({
    ...data,
    userId,
    dealId: data.dealId ? new mongoose.Types.ObjectId(data.dealId as unknown as string) : undefined,
  });
  await note.save();
  return note;
}

export async function updateNote(noteId: string, userId: string, data: Partial<INote>) {
  await dbConnect();
  const query = { _id: noteId, userId };

  const updateData: Record<string, unknown> = { ...data };
  if (data.dealId) {
    updateData.dealId = new mongoose.Types.ObjectId(data.dealId as unknown as string);
  } else if (data.dealId === null) {
    // To unlink from a deal
    updateData.dealId = undefined;
  }

  const note = await Note.findOneAndUpdate(query, updateData, { new: true }).maxTimeMS(10_000);
  if (!note) {
    throw new Error("NOT_FOUND");
  }
  return note;
}

export async function deleteNote(noteId: string, userId: string) {
  await dbConnect();
  const query = { _id: noteId, userId };
  const result = await Note.deleteOne(query).maxTimeMS(10_000);
  if (result.deletedCount === 0) {
    throw new Error("NOT_FOUND");
  }
  return true;
}
