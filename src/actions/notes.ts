"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" }
  });
  return notes.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString()
  }));
}

export async function addNote(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;

    if (!title) {
      throw new Error("Judul catatan tidak boleh kosong");
    }

    await prisma.note.create({
      data: {
        title,
        content: content || "",
        category: category || "UMUM",
        priority: priority || "NORMAL",
      }
    });

    revalidatePath("/notes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add note:", error);
    throw new Error(error.message || "Gagal menyimpan catatan");
  }
}

export async function toggleNoteDone(id: string) {
  try {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new Error("Catatan tidak ditemukan");

    await prisma.note.update({
      where: { id },
      data: { isDone: !note.isDone }
    });

    revalidatePath("/notes");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    throw new Error("Gagal mengubah status catatan");
  }
}

export async function deleteNote(id: string) {
  try {
    await prisma.note.delete({ where: { id } });
    revalidatePath("/notes");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    throw new Error("Gagal menghapus catatan");
  }
}

export async function updateNote(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;

    if (!title) {
      throw new Error("Judul catatan tidak boleh kosong");
    }

    await prisma.note.update({
      where: { id },
      data: {
        title,
        content: content || "",
        category: category || "UMUM",
        priority: priority || "NORMAL",
      }
    });

    revalidatePath("/notes");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Gagal mengupdate catatan");
  }
}
