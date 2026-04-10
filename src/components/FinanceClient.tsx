"use client";

import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, FileText, PackageSearch } from "lucide-react";
import styles from "@/app/finance/page.module.css";
import { addCashFlow } from "@/actions/finance";

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function FinanceClient({ initialData }: { initialData: any[] }) {
  const [cashFlows, setCashFlows] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addCashFlow(formData);
      setIsModalOpen(false);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Gagal mencatat transaksi");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate summary
  const totalIncome = cashFlows.filter(c => c.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = cashFlows.filter(c => c.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const netCash = totalIncome - totalExpense;

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="h1">Pembukuan Keuangan</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Catat Transaksi Baru
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="var(--pr-600)" /> Total Pemasukan
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pr-600)' }}>
            {formatRp(totalIncome)}
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={16} color="var(--danger)" /> Total Pengeluaran
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
            {formatRp(totalExpense)}
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--pr-500)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Saldo Bersih
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {formatRp(netCash)}
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {cashFlows.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Belum ada data pemasukan atau pengeluaran.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi / Catatan</th>
                <th>Jenis Transaksi</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {cashFlows.map((flow) => (
                <tr key={flow.id}>
                  <td>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formatDate(flow.date)}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {flow.description}
                    {flow.isOrder && (
                      <span className="badge badge-success" style={{ marginLeft: "10px", fontSize: "0.7rem", backgroundColor: "var(--pr-100)", color: "var(--pr-800)" }}>Auto</span>
                    )}
                  </td>
                  <td>
                    {flow.type === 'INCOME' ? (
                      <span className="badge badge-success">Pemasukan</span>
                    ) : (
                      <span className="badge badge-danger" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Pengeluaran</span>
                    )}
                  </td>
                  <td style={{ 
                    fontWeight: 600, 
                    color: flow.type === 'INCOME' ? 'var(--pr-600)' : '#ef4444' 
                  }}>
                    {flow.type === 'INCOME' ? '+' : '-'}{formatRp(flow.amount)}
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
            <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Catat Transaksi Manual</h2>
            <form onSubmit={handleAddRecord}>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Jenis Transaksi</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="type" value="INCOME" defaultChecked />
                    Pemasukan (Luar Kasir)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="type" value="EXPENSE" />
                    Pengeluaran (Belanja/Listrik/Gaji)
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Deskripsi Transaksi</label>
                <input required type="text" name="description" className={styles.formInput} placeholder="Contoh: Bayar air PDAM bulan ini" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nominal (Rp)</label>
                <input required type="number" name="amount" className={styles.formInput} placeholder="50000" />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
