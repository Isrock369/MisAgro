"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Phone, MapPin, Building2, PackageSearch } from "lucide-react";
import styles from "@/app/contacts/page.module.css";
import { addSupplier } from "@/actions/contacts";

export default function ContactsClient({ initialSuppliers }: { initialSuppliers: any[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddSupplier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addSupplier(formData);
      setIsModalOpen(false);
      window.location.reload(); // Reload automatically via Server Action's revalidatePath
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan supplier");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="h1">Manajemen Supplier</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Tambah Supplier Baru
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <div className={styles.searchBar}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Cari pabrik, sales, atau kontak..." 
              className={styles.searchInput}
            />
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Belum ada relasi supplier. Silakan tambahkan supplier baru.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Pemasok / Supplier</th>
                <th>Kategori Suplai Utama</th>
                <th>Kontak (HP/WA)</th>
                <th>Lokasi / Alamat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} className="text-muted" /> {supplier.name}
                    </div>
                  </td>
                  <td>{supplier.category || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} className="text-muted" /> {supplier.phone || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <MapPin size={14} className="text-muted" /> {supplier.address || '-'}
                    </div>
                  </td>
                  <td>
                    {supplier.status === 'ACTIVE' ? (
                      <span className="badge badge-success">Aktif</span>
                    ) : (
                      <span className="badge badge-secondary">Nonaktif</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Pendaftaran Pemasok</h2>
            <form onSubmit={handleAddSupplier}>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Pemasok / Pabrik</label>
                <input required type="text" name="name" className={styles.formInput} placeholder="Contoh: PT Pupuk Subur Raya" />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nomor WhatsApp / HP Sales</label>
                  <input type="text" name="phone" className={styles.formInput} placeholder="08..." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kategori Barang Suplai</label>
                  <input type="text" name="category" className={styles.formInput} placeholder="Misal: Obat Hama" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Alamat Lengkap (Gudang/Kantor)</label>
                <input type="text" name="address" className={styles.formInput} placeholder="Jalan, Kota..." />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Pemasok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
