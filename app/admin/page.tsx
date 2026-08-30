import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [productCount, pendingOrders, totalOrders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: "asc" } }),
  ]);

  const stats = [
    { label: "Products", value: productCount },
    { label: "Pending Orders", value: pendingOrders },
    { label: "Total Orders", value: totalOrders },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <p className="font-bold text-sm text-red-400 mb-3">⚠️ Low Stock Alert ({lowStock.length})</p>
          <div className="flex flex-col gap-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-bold">{p.stock} left</span>
                  <Link href={`/admin/products/${p.id}/edit`} className="text-lime-400 text-xs font-semibold">Restock</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
    }
