import { getProducts } from "@/actions/products";
import PosClient from "@/components/PosClient";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const products = await getProducts();
  return <PosClient products={products} />;
}
