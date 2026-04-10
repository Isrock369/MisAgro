"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addSupplier(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const category = formData.get("category") as string;

    if (!name) {
      throw new Error("Nama supplier tidak boleh kosong");
    }

    await prisma.supplier.create({
      data: {
        name,
        phone,
        address,
        category,
        status: "ACTIVE"
      }
    });

    revalidatePath("/contacts");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add supplier:", error);
    throw new Error(error.message || "Gagal menyimpan data supplier");
  }
}

export async function getSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" }
  });
  return suppliers;
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({ where: { id } });
    revalidatePath("/contacts");
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Gagal menghapus supplier");
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const category = formData.get("category") as string;

    await prisma.supplier.update({
      where: { id },
      data: { name, phone, address, category }
    });

    revalidatePath("/contacts");
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Gagal mengupdate supplier");
  }
}
