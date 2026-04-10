"use client";

import { useState, useMemo } from "react";
import { Search, ShoppingCart, Minus, Plus, Trash2, Box, CheckCircle } from "lucide-react";
import { submitOrder } from "@/actions/pos";
import styles from "@/app/pos/page.module.css";

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

export default function PosClient({ products }: { products: any[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const lower = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lower) || p.barcode?.toLowerCase().includes(lower));
  }, [products, search]);

  const addToCart = (product: any) => {
    if (product.stockQuantity <= 0) {
      alert("Stok Habis!");
      return;
    }

    setCart(prev => {
      const exist = prev.find(item => item.product.id === product.id);
      if (exist) {
        if (exist.quantity >= product.stockQuantity) return prev; // Cannot exceed stock
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        if (newQ > item.product.stockQuantity) return item; // Cannot exceed stock
        if (newQ <= 0) return { ...item, quantity: 0 }; // Will filter out below
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    // Prepare Data
    const items = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.sellPrice
    }));

    const result = await submitOrder({
      amount: totalPrice,
      paymentMethod: "CASH",
      items
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessReceipt(result.invoiceNumber as string);
      setCart([]);
    } else {
      alert(result.error);
    }
  };

  if (successReceipt) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
        <CheckCircle size={64} className="text-pr-500" style={{ color: 'var(--pr-500)' }} />
        <h1 className="h1">Transaksi Berhasil!</h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>No. Invoice: {successReceipt}</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-secondary">Cetak Struk</button>
          <button className="btn btn-primary" onClick={() => setSuccessReceipt(null)}>Transaksi Baru</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Left Panel - Grid Produk */}
      <div className={styles.catalogPanel}>
        <div className={styles.searchHeader}>
          <div className={styles.searchBox}>
            <Search size={20} className="text-muted" />
            <input 
              type="text" 
              placeholder="Cari Produk (Nama atau Scan Barcode)..." 
              className={styles.searchInput}
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.productsGrid}>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              className={styles.productCard} 
              onClick={() => addToCart(p)}
              style={p.stockQuantity <= 0 ? { opacity: 0.5, pointerEvents: 'none' } : {}}
            >
              <div className={styles.productTitle}>{p.name}</div>
              <div className={styles.productPrice}>{formatRp(p.sellPrice)}</div>
              <div className={styles.productStock}>
                <Box size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                Stok: {p.stockQuantity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Keranjang Kasir */}
      <div className={styles.cartPanel}>
        <div className={styles.cartHeader}>
          <ShoppingCart size={24} /> 
          Keranjang ({totalItemCount})
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              Belum ada barang di keranjang.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemTitle}>{item.product.name}</div>
                  <div className={styles.cartItemPrice}>{formatRp(item.product.sellPrice)}</div>
                </div>
                <div className={styles.cartItemControls}>
                  <button className={styles.ctrlBtn} onClick={() => updateQuantity(item.product.id, -1)}>
                    {item.quantity === 1 ? <Trash2 size={14} color="var(--danger)" /> : <Minus size={14} />}
                  </button>
                  <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button className={styles.ctrlBtn} onClick={() => updateQuantity(item.product.id, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatRp(totalPrice)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Diskon</span>
            <span>Rp 0</span>
          </div>
          <div className={styles.summaryRow} style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Tagihan</span>
            <span className={styles.summaryTotal}>{formatRp(totalPrice)}</span>
          </div>

          <button 
            className={`btn btn-primary ${styles.checkoutBtn}`} 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
          >
            {isSubmitting ? "Memproses Transaksi..." : `BAYAR SEKARANG ->`}
          </button>
        </div>
      </div>
    </div>
  );
}
