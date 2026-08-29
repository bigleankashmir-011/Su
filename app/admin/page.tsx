import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [productCount, pendingOrders, totalOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
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
    </div>
  );
      }
