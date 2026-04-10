import ContactsClient from "@/components/ContactsClient";
import { getSuppliers } from "@/actions/contacts";

export const metadata = {
  title: "Manajemen Supplier - Toko Obat MisAgro",
};

export default async function ContactsPage() {
  const suppliers = await getSuppliers();
  return <ContactsClient initialSuppliers={suppliers} />;
}
