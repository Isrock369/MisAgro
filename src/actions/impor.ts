"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ImportData {
  barcode?: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  category: string;
  supplierId?: string;
  notes?: string;
}

export async function importProductsFromCSV(csvData: string, supplierId?: string) {
  try {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV harus memiliki header dan minimal 1 baris data");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'buyprice', 'sellprice', 'quantity'];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Header tidak ditemukan: ${required}`);
      }
    }

    const importedProducts: ImportData[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = lines[i].split(',').map(v => v.trim());
      const row: { [key: string]: string } = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      importedProducts.push({
        barcode: row['barcode'] || undefined,
        name: row['name'],
        buyPrice: parseInt(row['buyprice']) || 0,
        sellPrice: parseInt(row['sellprice']) || 0,
        quantity: parseInt(row['quantity']) || 0,
        category: row['category'] || 'Lain-lain',
        supplierId,
        notes: row['notes'] || undefined
      });
    }

    return await importProducts(importedProducts);
  } catch (error: any) {
    console.error("Error importing CSV:", error);
    throw new Error(error.message || "Gagal mengimpor data CSV");
  }
}

export async function importProducts(products: ImportData[]) {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const product of products) {
      try {
        // Validate required fields
        if (!product.name || product.buyPrice < 0 || product.sellPrice < 0) {
          results.failed++;
          results.errors.push(`Produk "${product.name}": data tidak valid`);
          continue;
        }

        // Get or create category
        let category = await prisma.category.findUnique({
          where: { name: product.category }
        });

        if (!category) {
          category = await prisma.category.create({
            data: { name: product.category }
          });
        }

        // Check if product already exists (by barcode or name)
        let existingProduct = null;
        if (product.barcode) {
          existingProduct = await prisma.product.findUnique({
            where: { barcode: product.barcode }
          });
        }

        if (!existingProduct) {
          existingProduct = await prisma.product.findFirst({
            where: { name: product.name, categoryId: category.id }
          });
        }

        if (existingProduct) {
          // Update existing product - increase stock
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              stockQuantity: {
                increment: product.quantity
              },
              buyPrice: product.buyPrice,
              sellPrice: product.sellPrice,
              barcode: product.barcode || existingProduct.barcode
            }
          });
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              name: product.name,
              barcode: product.barcode || undefined,
              buyPrice: product.buyPrice,
              sellPrice: product.sellPrice,
              stockQuantity: product.quantity,
              minStockLevel: 5,
              categoryId: category.id
            }
          });
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Produk "${product.name}": ${err.message}`);
      }
    }

    revalidatePath("/products");
    revalidatePath("/imports");

    return results;
  } catch (error: any) {
    console.error("Error importing products:", error);
    throw new Error(error.message || "Gagal mengimpor produk");
  }
}

export async function importProductsManual(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || undefined;
    const buyPrice = parseInt(formData.get("buyPrice") as string || "0");
    const sellPrice = parseInt(formData.get("sellPrice") as string || "0");
    const quantity = parseInt(formData.get("quantity") as string || "0");
    const categoryId = formData.get("categoryId") as string;
    const supplierId = formData.get("supplierId") as string || undefined;

    if (!name || !categoryId) {
      throw new Error("Nama produk dan kategori harus diisi");
    }

    // Check if product exists
    let existingProduct = null;
    if (barcode) {
      existingProduct = await prisma.product.findUnique({
        where: { barcode }
      });
    }

    if (!existingProduct) {
      existingProduct = await prisma.product.findFirst({
        where: { name, categoryId }
      });
    }

    if (existingProduct) {
      // Update existing - increase stock
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          stockQuantity: {
            increment: quantity
          },
          buyPrice,
          sellPrice,
          barcode: barcode || existingProduct.barcode
        }
      });
    } else {
      // Create new
      await prisma.product.create({
        data: {
          name,
          barcode,
          buyPrice,
          sellPrice,
          stockQuantity: quantity,
          minStockLevel: 5,
          categoryId
        }
      });
    }

    revalidatePath("/products");
    revalidatePath("/imports");

    return { success: true, message: "Produk berhasil diimpor" };
  } catch (error: any) {
    console.error("Error importing product:", error);
    throw new Error(error.message || "Gagal mengimpor produk");
  }
}

export async function getSuppliers() {
  return await prisma.supplier.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: 'asc' }
  });
}

export async function getImportHistory() {
  // Get recently modified products (as import history)
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
    take: 50
  });

  return products;
}
