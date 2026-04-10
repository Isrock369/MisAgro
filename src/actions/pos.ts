"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitOrder(orderData: {
  amount: number;
  paymentMethod: string;
  items: { productId: string; quantity: number; price: number }[];
}) {
  // Generate random invoice number: INV-YYMMDD-XXXX
  const today = new Date();
  const dateStr = today.toISOString().slice(2, 10).replace(/-/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${dateStr}-${randomNum}`;

  try {
    // Gunakan Prisma Transaction untuk memastikan integritas
    await prisma.$transaction(async (tx) => {
      // 1. Buat Header Order
      const newOrder = await tx.order.create({
        data: {
          invoiceNumber,
          totalAmount: orderData.amount,
          paymentMethod: orderData.paymentMethod,
          status: "COMPLETED",
          items: {
            create: orderData.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.price,
            }))
          }
        }
      });

      // 2. Kurangi Stok Produk
      for (const item of orderData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    revalidatePath("/products");
    revalidatePath("/");
    
    return { success: true, invoiceNumber };
  } catch (error) {
    console.error("Order submission error:", error);
    return { success: false, error: "Gagal menyimpan transaksi." };
  }
}
