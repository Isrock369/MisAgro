"use client";

import { useState, useRef, useEffect } from "react";
import {
  importProductsFromCSV,
  importProductsManual,
  getSuppliers,
  ImportData,
  getImportHistory
} from "@/actions/impor";
import { getCategories } from "@/actions/products";
import styles from "./ImporClient.module.css";

interface Supplier {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  barcode?: string;
  buyPrice: number;
  sellPrice: number;
  stockQuantity: number;
  category: { name: string };
  updatedAt: Date;
}

interface ImportHistoryItem {
  id: string;
  barcode: string | null;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  photoUrl: string | null;
  categoryId: string;
  category: { name: string; id: string; createdAt: Date; updatedAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

export default function ImportsClient() {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual import form state
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    buyPrice: "",
    sellPrice: "",
    quantity: "",
    categoryId: "",
    supplierId: ""
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [supsData, catsData, historyData] = await Promise.all([
          getSuppliers(),
          getCategories(),
          getImportHistory()
        ]);
        setSuppliers(supsData);
        setCategories(catsData);
        setImportHistory(historyData);
      } catch (err: any) {
        setError("Gagal memuat data");
      }
    };
    loadData();
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);

      await importProductsManual(data);
      setMessage("✓ Produk berhasil diimpor!");
      setFormData({
        name: "",
        barcode: "",
        buyPrice: "",
        sellPrice: "",
        quantity: "",
        categoryId: "",
        supplierId: ""
      });

      // Reload import history
      const newHistory = await getImportHistory();
      setImportHistory(newHistory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setError("");
    setResults(null);

    try {
      const content = await file.text();
      const supplierId = formData.supplierId || undefined;

      const result = await importProductsFromCSV(content, supplierId);

      setResults(result);
      if (result.success > 0) {
        setMessage(`✓ ${result.success} produk berhasil diimpor!`);
      }
      if (result.failed > 0) {
        setError(`⚠ ${result.failed} produk gagal: ${result.errors.join("; ")}`);
      }

      // Reload import history
      const newHistory = await getImportHistory();
      setImportHistory(newHistory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ["barcode", "name", "buyPrice", "sellPrice", "quantity", "category", "notes"];
    const exampleRow = ["12345", "Pupuk NPK", "15000", "20000", "100", "Pupuk", "Sample"];

    const csv = [headers.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-import-produk.csv";
    a.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 Import Barang</h1>
        <p>Impor produk baru atau update stok barang</p>
      </div>

      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "manual" ? styles.active : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          📝 Input Manual
        </button>
        <button
          className={`${styles.tab} ${activeTab === "csv" ? styles.active : ""}`}
          onClick={() => setActiveTab("csv")}
        >
          📄 Upload CSV
        </button>
      </div>

      {/* Manual Input Tab */}
      {activeTab === "manual" && (
        <div className={styles.tabContent}>
          <form onSubmit={handleManualSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nama Produk *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: Pupuk NPK"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Contoh: 12345"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Kategori *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Harga Beli (Rp) *</label>
                <input
                  type="number"
                  name="buyPrice"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Harga Jual (Rp) *</label>
                <input
                  type="number"
                  name="sellPrice"
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Jumlah *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Supplier</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <option value="">- Pilih Supplier -</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Menyimpan..." : "✓ Import Produk"}
            </button>
          </form>
        </div>
      )}

      {/* CSV Upload Tab */}
      {activeTab === "csv" && (
        <div className={styles.tabContent}>
          <div className={styles.csvSection}>
            <div className={styles.uploadBox}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={loading}
              />
              <p>📤 Pilih file CSV atau drag & drop</p>
              <small>Format: barcode, name, buyPrice, sellPrice, quantity, category</small>
            </div>

            <button
              className={styles.templateBtn}
              onClick={downloadCSVTemplate}
            >
              📥 Download Template
            </button>

            {results && (
              <div className={styles.results}>
                <h3>📊 Hasil Import</h3>
                <div className={styles.resultStats}>
                  <div className={styles.stat}>
                    <span>✓ Berhasil</span>
                    <strong>{results.success}</strong>
                  </div>
                  <div className={styles.stat}>
                    <span>✗ Gagal</span>
                    <strong>{results.failed}</strong>
                  </div>
                </div>
                {results.errors.length > 0 && (
                  <div className={styles.errorList}>
                    <h4>Error:</h4>
                    <ul>
                      {results.errors.slice(0, 5).map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {results.errors.length > 5 && (
                        <li>... dan {results.errors.length - 5} error lainnya</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import History */}
      <div className={styles.historySection}>
        <h2>📋 Riwayat Import Terakhir</h2>
        <div className={styles.historyTable}>
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Barcode</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok</th>
                <th>Terakhir Update</th>
              </tr>
            </thead>
            <tbody>
              {importHistory.slice(0, 10).map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category.name}</td>
                  <td>{product.barcode || "-"}</td>
                  <td>Rp {product.buyPrice.toLocaleString('id-ID')}</td>
                  <td>Rp {product.sellPrice.toLocaleString('id-ID')}</td>
                  <td className={styles.stock}>{product.stockQuantity}</td>
                  <td>{new Date(product.updatedAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
