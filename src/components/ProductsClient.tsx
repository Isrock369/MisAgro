"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, PackageSearch } from "lucide-react";
import { createProduct, deleteProduct, updateProduct } from "@/actions/products";
import styles from "@/app/products/page.module.css";

// Formatter for Rupiah
const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

export default function ProductsClient({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await deleteProduct(id);
      window.location.reload();
    } catch (err) {
      alert("Gagal menghapus produk");
    }
  }

  function openEditModal(product: any) {
    setEditProduct(product);
    setIsModalOpen(true);
  }

  function closeAndResetModal() {
    setIsModalOpen(false);
    setEditProduct(null);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (editProduct) {
        await updateProduct(editProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      closeAndResetModal();
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="h1">Manajemen Produk</h1>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Tambah Produk Baru
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <div className={styles.searchBar}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau kode..." 
              className={styles.searchInput}
            />
          </div>
          <div>
            <select className={styles.searchInput} style={{ width: '200px', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px' }}>
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Belum ada produk. Silakan tambahkan produk baru.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.barcode || '---'}</div>
                  </td>
                  <td>{product.category?.name}</td>
                  <td>{formatRp(product.buyPrice)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--pr-600)' }}>{formatRp(product.sellPrice)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>
                    {product.stockQuantity <= product.minStockLevel ? (
                      <span className="badge badge-danger">Hampir Habis</span>
                    ) : (
                      <span className="badge badge-success">Aman</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openEditModal(product)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDelete(product.id)}>
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
            <h2 className="h2" style={{ marginBottom: '1.5rem' }}>{editProduct ? "Edit Produk" : "Tambah Produk Baru"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Produk</label>
                <input required type="text" name="name" className={styles.formInput} placeholder="Contoh: Roundup 1L" defaultValue={editProduct?.name || ''} />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Barcode / SKU (Opsional)</label>
                  <input type="text" name="barcode" className={styles.formInput} placeholder="Scan QR/Barcode" defaultValue={editProduct?.barcode || ''} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kategori</label>
                  <select required name="categoryId" className={styles.formInput} defaultValue={editProduct?.categoryId || ''}>
                    <option value="">Pilih Kategori...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Harga Beli Asli</label>
                  <input required type="number" name="buyPrice" className={styles.formInput} placeholder="Rp" defaultValue={editProduct?.buyPrice || ''} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Harga Jual Kasir</label>
                  <input required type="number" name="sellPrice" className={styles.formInput} placeholder="Rp" defaultValue={editProduct?.sellPrice || ''} />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stok (Sisa)</label>
                  <input required type="number" name="stockQuantity" className={styles.formInput} defaultValue={editProduct?.stockQuantity || ''} />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={closeAndResetModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
