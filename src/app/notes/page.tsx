import { FileText, Plus } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="h1">Catatan Harian</h1>
        <button className="btn btn-primary">
          <Plus size={18} /> Tambah Catatan
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
        <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h2 className="h2" style={{ marginBottom: '0.5rem' }}>Fitur "Catatan Harian" Segera Hadir</h2>
        <p>Modul untuk mencatat aktivitas operasional, hutang piutang manual, dan catatan serah terima kasir akan segera tersedia pada rilis MVP tahap 2.</p>
      </div>
    </div>
  );
}
