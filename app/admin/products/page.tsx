import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteProductButton from "./delete-button";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="px-4 py-2 rounded-lg bg-lime-400 text-black text-sm font-bold">+ Add Product</Link>
      </div>

      <div className="bg-[#141416] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs uppercase">
            <tr className="border-b border-white/10">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4 hidden sm:table-cell">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4 hidden sm:table-cell">Kulgam Town</th>
              <th className="text-left p-4 hidden sm:table-cell">D.H. Pora</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="p-4">{p.name}</td>
                <td className="p-4 hidden sm:table-cell text-white/50">{p.category.name}</td>
                <td className="p-4">₹{p.price}</td>
                <td className="p-4 hidden sm:table-cell text-white/50">{p.stockOutlet1}</td>
                <td className="p-4 hidden sm:table-cell text-white/50">{p.stockOutlet2}</td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-lime-400 text-xs font-semibold">Edit</Link>
                  <DeleteProductButton id={p.id} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-white/30">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
                }
