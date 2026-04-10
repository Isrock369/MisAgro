"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addCashFlow(formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const amountStr = formData.get("amount") as string;

    if (!type || !description || !amountStr) {
      throw new Error("Harap lengkapi semua data transaksi");
    }

    const amount = parseInt(amountStr, 10);
    
    await prisma.cashFlow.create({
      data: {
        type,
        description,
        amount
      }
    });

    revalidatePath("/finance");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add cash flow:", error);
    throw new Error(error.message || "Gagal mencatat transaksi");
  }
}

export async function getFinanceData() {
  const cashFlows = await prisma.cashFlow.findMany({
    orderBy: { createdAt: "desc" }
  });

  const orders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "desc" }
  });

  // Gabungkan dan petakan jadi format yang sama
  const combined = [
    ...cashFlows.map(c => ({
      id: c.id,
      date: c.createdAt.toISOString(),
      description: c.description,
      type: c.type,
      amount: c.amount,
      isOrder: false
    })),
    ...orders.map(o => ({
      id: o.id,
      date: o.createdAt.toISOString(),
      description: `Penjualan Kasir (${o.invoiceNumber})`,
      type: 'INCOME',
      amount: o.totalAmount,
      isOrder: true
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return combined;
}
