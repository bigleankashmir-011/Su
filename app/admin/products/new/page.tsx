export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductForm from "../product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
