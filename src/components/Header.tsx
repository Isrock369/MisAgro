"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  
  // Format pathname to display as Title
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const pathWithoutSlash = pathname.substring(1);
    return pathWithoutSlash.charAt(0).toUpperCase() + pathWithoutSlash.slice(1);
  };

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        {getPageTitle()}
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Search">
          <Search size={18} />
        </button>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin Toko</span>
            <span className={styles.userRole}>Kasir Induk</span>
          </div>
        </div>
      </div>
    </header>
  );
}
