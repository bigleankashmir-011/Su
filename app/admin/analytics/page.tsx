export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const start30 = new Date(now); start30.setDate(start30.getDate() - 30);
  const start365 = new Date(now); start365.setDate(start365.getDate() - 365);

  const [visitsToday, visits30, visits365, allOrders, allSources] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: startToday } } }),
    prisma.pageView.count({ where: { createdAt: { gte: start30 } } }),
    prisma.pageView.count({ where: { createdAt: { gte: start365 } } }),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { items: { include: { product: { include: { category: true } } } } },
    }),
    prisma.pageView.groupBy({ by: ["source"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 6 }),
  ]);

  const ordersToday = allOrders.filter(o => o.createdAt >= startToday).length;
  const orders30 = allOrders.filter(o => o.createdAt >= start30).length;
  const orders365 = allOrders.filter(o => o.createdAt >= start365).length;
  const conversion30 = visits30 > 0 ? ((orders30 / visits30) * 100).toFixed(1) : "0";

  const productRevenue = new Map<string, { name: string; revenue: number; qty: number }>();
  const categoryRevenue = new Map<string, number>();
  let totalRevenue = 0;
  for (const o of allOrders) {
    for (const it of o.items) {
      const lineTotal = it.price * it.quantity;
      totalRevenue += lineTotal;
      const pName = it.product?.name || "Unknown";
      const existing = productRevenue.get(it.productId) || { name: pName, revenue: 0, qty: 0 };
      existing.revenue += lineTotal;
      existing.qty += it.quantity;
      productRevenue.set(it.productId, existing);

      const catName = it.product?.category?.name || "Uncategorized";
      categoryRevenue.set(catName, (categoryRevenue.get(catName) || 0) + lineTotal);
    }
  }
  const topProducts = Array.from(productRevenue.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topCategories = Array.from(categoryRevenue.entries()).sort((a, b) => b[1] - a[1]);

  const todaysOrders = allOrders.filter(o => o.createdAt >= startToday);
  const todaysRevenue = todaysOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Visits Today" value={visitsToday} />
        <StatCard label="Visits (30 days)" value={visits30} />
        <StatCard label="Visits (1 year)" value={visits365} />
        <StatCard label="Conversion (30d)" value={`${conversion30}%`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Orders Today" value={ordersToday} />
        <StatCard label="Orders (30 days)" value={orders30} />
        <StatCard label="Orders (1 year)" value={orders365} />
      </div>

      <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 mb-6">
        <p className="font-bold text-sm mb-1">Today's Summary</p>
        <p className="text-white/60 text-sm">{todaysOrders.length} orders · ₹{todaysRevenue} revenue</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
          <p className="font-bold text-sm mb-3">Top Selling Products</p>
          <div className="flex flex-col gap-2">
            {topProducts.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/70">{p.name} <span className="text-white/30">×{p.qty}</span></span>
                <span className="font-bold">₹{p.revenue}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-white/30 text-sm">No sales yet.</p>}
          </div>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
          <p className="font-bold text-sm mb-3">Revenue by Category</p>
          <div className="flex flex-col gap-2">
            {topCategories.map(([name, rev], i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/70">{name}</span>
                <span className="font-bold">₹{rev}</span>
              </div>
            ))}
            {topCategories.length === 0 && <p className="text-white/30 text-sm">No sales yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 mt-6">
        <p className="font-bold text-sm mb-3">Traffic Sources</p>
        <div className="flex flex-col gap-2">
          {allSources.map((s, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/70">{s.source || "direct"}</span>
              <span className="font-bold">{s._count.id} visits</span>
            </div>
          ))}
          {allSources.length === 0 && <p className="text-white/30 text-sm">No visits recorded yet.</p>}
        </div>
      </div>

      <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 mt-6">
        <p className="font-bold text-sm mb-1">Total Revenue (all time, excluding cancelled)</p>
        <p className="text-3xl font-black mt-1">₹{totalRevenue}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-white/40 text-xs mt-1">{label}</p>
    </div>
  );
}
