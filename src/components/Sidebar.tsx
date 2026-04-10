"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ArrowLeftRight,
  TrendingUp,
  FileText,
  Users,
  Leaf
} from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { group: "Menu Utama" },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Kasir (POS)", href: "/pos", icon: ShoppingCart },
  { group: "Persediaan" },
  { name: "Manajemen Produk", href: "/products", icon: Package },
  { name: "Impor Barang", href: "/imports", icon: ArrowLeftRight },
  { group: "Laporan & Keuangan" },
  { name: "Pemasukan & Pengeluaran", href: "/finance", icon: TrendingUp },
  { name: "Catatan Harian", href: "/notes", icon: FileText },
  { group: "Kontak" },
  { name: "Supplier & Pelanggan", href: "/contacts", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Leaf className={styles.brandIcon} size={28} />
        <span className={styles.brandName}>MisAgro</span>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item, index) => {
          if (item.group) {
            return (
              <div key={`group-${index}`} className={styles.navGroup}>
                {item.group}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href || (pathname.startsWith(item.href!) && item.href !== "/");

          return (
            <Link 
              key={item.href} 
              href={item.href!}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
