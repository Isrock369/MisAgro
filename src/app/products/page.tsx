import { getProducts, ensureDefaultCategories, getCategories } from "@/actions/products";
import ProductsClient from "@/components/ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await ensureDefaultCategories();
  
  const products = await getProducts();
  const categories = await getCategories();

  return <ProductsClient initialProducts={products} categories={categories} />;
}
