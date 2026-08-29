import { prisma } from "@/lib/prisma";
import StatusSelect from "./status-select";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold">{o.customerName} · {o.phone}</p>
                <p className="text-white/40 text-xs mt-1">{o.address}, {o.city} - {o.pincode}</p>
                <p className="text-white/30 text-xs mt-1">{o.paymentMethod} · {new Date(o.createdAt).toLocaleString("en-IN")}</p>
              </div>
              <StatusSelect orderId={o.id} status={o.status} />
            </div>
            <div className="mt-4 border-t border-white/5 pt-3 flex flex-col gap-1">
              {o.items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm text-white/60">
                  <span>{i.product.name} × {i.quantity}</span>
                  <span>₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>₹{o.total}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-white/30">No orders yet.</p>}
      </div>
    </div>
  );
                  }
