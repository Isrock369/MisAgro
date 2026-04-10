"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function ensureDefaultCategories() {
  const count = await prisma.category.count();
  if (count === 0) {
    await prisma.category.createMany({
      data: [
        { name: "Pestisida" },
        { name: "Pupuk" },
        { name: "Benih" },
        { name: "Alat Pertanian" },
        { name: "Lain-lain" }
      ]
    });
  }
}

export async function getProducts(query = "") {
  return await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { barcode: { contains: query } }
      ]
    },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const barcode = formData.get("barcode") as string || null;
  const buyPrice = parseInt(formData.get("buyPrice") as string || "0");
  const sellPrice = parseInt(formData.get("sellPrice") as string || "0");
  const stockQuantity = parseInt(formData.get("stockQuantity") as string || "0");
  const categoryId = formData.get("categoryId") as string;
  
  await prisma.product.create({
    data: {
      name,
      barcode,
      buyPrice,
      sellPrice,
      stockQuantity,
      categoryId,
    }
  });

  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error("Gagal menghapus produk");
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || null;
    const buyPrice = parseInt(formData.get("buyPrice") as string || "0");
    const sellPrice = parseInt(formData.get("sellPrice") as string || "0");
    const stockQuantity = parseInt(formData.get("stockQuantity") as string || "0");
    const categoryId = formData.get("categoryId") as string;

    await prisma.product.update({
      where: { id },
      data: {
        name,
        barcode,
        buyPrice,
        sellPrice,
        stockQuantity,
        categoryId,
      }
    });
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error("Gagal mengupdate produk");
  }
}
