import { prisma } from "@/lib/prisma";
import ProductForm from "../../product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm categories={categories} initial={product} />
    </div>
  );
      }
