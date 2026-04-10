import NotesClient from "@/components/NotesClient";
import { getNotes } from "@/actions/notes";

export const metadata = {
  title: "Catatan Harian - Toko Obat MisAgro",
};

export default async function NotesPage() {
  const notes = await getNotes();
  return <NotesClient initialNotes={notes} />;
}
