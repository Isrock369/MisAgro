"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Total Transaksi Hari Ini
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    include: {
      items: true
    }
  });

  const totalTransactions = todayOrders.length;
  
  // 2. Omset / Total Revenue Hari Ini
  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // 3. Peringatan Stok (Hampir Habis)
  // Menghitung produk dimana stok <= minStockLevel
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stockQuantity: {
        lte: prisma.product.fields.minStockLevel,
      }
    },
    take: 5
  });
  
  const lowStockCount = await prisma.product.count({
    where: {
      stockQuantity: {
        lte: prisma.product.fields.minStockLevel,
      }
    }
  });

  // 4. Aktivitas Terakhir (5 Transaksi/Order Terbaru)
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    totalTransactions,
    totalRevenue,
    lowStockCount,
    lowStockProducts,
    recentOrders
  };
}
