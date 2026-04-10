"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  ClipboardList,
  Clock,
  AlertCircle,
  StickyNote
} from "lucide-react";
import styles from "@/app/notes/page.module.css";
import { addNote, toggleNoteDone, deleteNote, updateNote } from "@/actions/notes";

type NoteItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = [
  { value: "UMUM", label: "Umum" },
  { value: "HUTANG", label: "Hutang" },
  { value: "PIUTANG", label: "Piutang" },
  { value: "SERAH_TERIMA", label: "Serah Terima" },
  { value: "OPERASIONAL", label: "Operasional" },
];

const PRIORITIES = [
  { value: "LOW", label: "Rendah" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Penting" },
];

const CATEGORY_STYLE: Record<string, string> = {
  UMUM: styles.catUmum,
  HUTANG: styles.catHutang,
  PIUTANG: styles.catPiutang,
  SERAH_TERIMA: styles.catSerahTerima,
  OPERASIONAL: styles.catOperasional,
};

const CATEGORY_LABEL: Record<string, string> = {
  UMUM: "Umum",
  HUTANG: "Hutang",
  PIUTANG: "Piutang",
  SERAH_TERIMA: "Serah Terima",
  OPERASIONAL: "Operasional",
};

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: styles.priorityHigh,
  NORMAL: styles.priorityNormal,
  LOW: styles.priorityLow,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesClient({ initialNotes }: { initialNotes: NoteItem[] }) {
  const [notes] = useState<NoteItem[]>(initialNotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("SEMUA");

  // Summary stats
  const totalNotes = notes.length;
  const activeNotes = notes.filter((n) => !n.isDone).length;
  const doneNotes = notes.filter((n) => n.isDone).length;
  const urgentNotes = notes.filter((n) => n.priority === "HIGH" && !n.isDone).length;

  // Filter logic
  const filteredNotes = notes.filter((n) => {
    if (activeFilter === "SEMUA") return true;
    if (activeFilter === "AKTIF") return !n.isDone;
    if (activeFilter === "SELESAI") return n.isDone;
    return n.category === activeFilter;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (editingNote) {
        await updateNote(editingNote.id, formData);
      } else {
        await addNote(formData);
      }
      setIsModalOpen(false);
      setEditingNote(null);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan catatan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleDone(id: string) {
    try {
      await toggleNoteDone(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    try {
      await deleteNote(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus catatan");
    }
  }

  function openEdit(note: NoteItem) {
    setEditingNote(note);
    setIsModalOpen(true);
  }

  function openAdd() {
    setEditingNote(null);
    setIsModalOpen(true);
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="h1">Catatan Harian</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Tambah Catatan
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={`card ${styles.summaryCard}`}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconAll}`}>
            <ClipboardList size={22} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Total Catatan</div>
            <div className={styles.summaryValue}>{totalNotes}</div>
          </div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconActive}`}>
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Belum Selesai</div>
            <div className={styles.summaryValue}>{activeNotes}</div>
          </div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconDone}`}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Sudah Selesai</div>
            <div className={styles.summaryValue}>{doneNotes}</div>
          </div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconUrgent}`}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Penting / Urgent</div>
            <div className={styles.summaryValue}>{urgentNotes}</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        {["SEMUA", "AKTIF", "SELESAI", ...CATEGORIES.map((c) => c.value)].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f === "SEMUA"
              ? "Semua"
              : f === "AKTIF"
              ? "Belum Selesai"
              : f === "SELESAI"
              ? "Sudah Selesai"
              : CATEGORY_LABEL[f] || f}
          </button>
        ))}
      </div>

      {/* Notes Cards */}
      {filteredNotes.length === 0 ? (
        <div className={`card ${styles.emptyState}`}>
          <StickyNote size={48} className={styles.emptyIcon} />
          <h2 className="h2" style={{ marginBottom: "0.5rem" }}>
            {activeFilter === "SEMUA"
              ? "Belum Ada Catatan"
              : "Tidak Ada Catatan di Kategori Ini"}
          </h2>
          <p className="text-muted">
            {activeFilter === "SEMUA"
              ? "Klik \"Tambah Catatan\" untuk mulai mencatat aktivitas operasional, hutang piutang, dan serah terima kasir."
              : "Coba lihat filter lain atau buat catatan baru."}
          </p>
        </div>
      ) : (
        <div className={styles.notesGrid}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`card ${styles.noteCard} ${note.isDone ? styles.noteCardDone : ""}`}
            >
              {/* Priority color bar */}
              <div className={`${styles.notePriorityBar} ${PRIORITY_STYLE[note.priority] || styles.priorityNormal}`} />

              <div className={styles.noteBody}>
                <div className={styles.noteTopRow}>
                  <span className={styles.noteTitle}>{note.title}</span>
                  <span className={`${styles.badgeCategory} ${CATEGORY_STYLE[note.category] || styles.catUmum}`}>
                    {CATEGORY_LABEL[note.category] || note.category}
                  </span>
                </div>

                {note.content && (
                  <div className={styles.noteContent}>{note.content}</div>
                )}

                <div className={styles.noteFooter}>
                  <div className={styles.noteMeta}>
                    <span className={styles.noteDate}>{formatDate(note.createdAt)}</span>
                  </div>
                  <div className={styles.noteActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnCheck}`}
                      onClick={() => handleToggleDone(note.id)}
                      title={note.isDone ? "Tandai belum selesai" : "Tandai selesai"}
                    >
                      {note.isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEdit(note)}
                      title="Edit catatan"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(note.id)}
                      title="Hapus catatan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) { setIsModalOpen(false); setEditingNote(null); }}}>
          <div className={styles.modalContent}>
            <h2 className="h2" style={{ marginBottom: "1.5rem" }}>
              {editingNote ? "Edit Catatan" : "Catatan Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Judul Catatan</label>
                <input
                  required
                  type="text"
                  name="title"
                  className={styles.formInput}
                  placeholder="Contoh: Stok Semprotan hampir habis"
                  defaultValue={editingNote?.title || ""}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Deskripsi / Isi Catatan</label>
                <textarea
                  name="content"
                  className={styles.formTextarea}
                  placeholder="Detail catatan, instruksi, atau informasi tambahan..."
                  defaultValue={editingNote?.content || ""}
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kategori</label>
                  <select
                    name="category"
                    className={styles.formSelect}
                    defaultValue={editingNote?.category || "UMUM"}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Prioritas</label>
                  <select
                    name="priority"
                    className={styles.formSelect}
                    defaultValue={editingNote?.priority || "NORMAL"}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingNote(null);
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : editingNote ? "Update Catatan" : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
