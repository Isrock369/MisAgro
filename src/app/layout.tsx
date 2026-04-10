import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Toko Obat MisAgro - Sistem Manajemen Toko Tani",
  description: "Aplikasi Kasir dan Manajemen Stok Apotek Pertanian MisAgro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
