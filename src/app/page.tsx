import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle,
  Package,
  ShoppingCart
} from "lucide-react";
import styles from "./page.module.css";
import { getDashboardStats } from "@/actions/dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit";
  return Math.floor(seconds) + " detik";
}

export default async function Dashboard() {
  const stats = await getDashboardStats();

  const today = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="h2">Selamat Pagi, Admin!</h1>
          <p className={styles.date}>{today}</p>
        </div>
        <Link href="/pos" className="btn btn-primary">
          <ShoppingCart size={18} />
          Kasir Baru
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {/* Omset Hari ini */}
        <div className="card statCard">
          <div className={styles.statHeader}>
            <span className="text-muted">Omset Hari Ini</span>
            <div className={`${styles.statIcon} ${styles.iconPr}`}>
              <DollarSign size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{formatRp(stats.totalRevenue)}</div>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>Catatan Laba Riil</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="card statCard">
          <div className={styles.statHeader}>
            <span className="text-muted">Total Transaksi</span>
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalTransactions}</div>
          <div className={styles.statTrend}>
            <span className="text-muted">Transaksi hari ini</span>
          </div>
        </div>

        {/* Info Tambahan */}
        <div className="card statCard">
          <div className={styles.statHeader}>
            <span className="text-muted">Status Sistem</span>
            <div className={`${styles.statIcon} ${styles.iconOrange}`}>
              <Package size={24} />
            </div>
          </div>
          <div className={styles.statValue}>Aktif</div>
          <div className={styles.statTrend}>
            <span className="text-muted">Sistem kasir siap</span>
          </div>
        </div>

        {/* Peringatan Stok */}
        <div className="card statCard">
          <div className={styles.statHeader}>
            <span className="text-muted">Perlu Perhatian</span>
            <div className={`${styles.statIcon} ${styles.iconWarn}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.lowStockCount} Produk</div>
          <div className={styles.statTrend}>
            <span className={styles.trendDown}>
              Stok Menipis!
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className="card">
          <h2 className={styles.sectionTitle}>Arus Kas Mingguan</h2>
          <div className={styles.chartArea}>
            <div className="text-muted">
              [Area Grafik Bar: Pemasukan vs Pengeluaran]
              <br />Akan disempurnakan di Integrasi Tahap 4
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className={styles.sectionTitle}>Aktivitas Terakhir</h2>
          <div className={styles.list}>
            {stats.recentOrders.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Belum ada aktivitas transaksi.</div>
            ) : (
              stats.recentOrders.map(order => (
                <div key={order.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemIcon}>
                      <ShoppingCart size={18} />
                    </div>
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{order.invoiceNumber}</span>
                      <span className={styles.itemSub}>{timeSince(order.createdAt)} yang lalu</span>
                    </div>
                  </div>
                  <div className={`${styles.itemAmount} ${styles.positive}`}>
                    + {formatRp(order.totalAmount)}
                  </div>
                </div>
              ))
            )}
            
            {stats.lowStockProducts.map(product => (
               <div key={product.id} className={styles.listItem}>
               <div className={styles.itemInfo}>
                 <div className={styles.itemIcon}>
                   <AlertTriangle size={18} className="text-warning" style={{ color: 'var(--warning)' }}/>
                 </div>
                 <div className={styles.itemText}>
                   <span className={styles.itemTitle}>Stok Menipis</span>
                   <span className={styles.itemSub}>{product.name} (Sisa {product.stockQuantity})</span>
                 </div>
               </div>
             </div>
            ))}
          </div>
          
          <Link href="/pos" className="btn btn-secondary" style={{ marginTop: 'auto', alignSelf: 'stretch', justifyContent: 'center' }}>
            Buka Mesin Kasir
          </Link>
        </div>
      </div>
    </div>
  );
}
