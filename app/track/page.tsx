"use client";
import { useState } from "react";
import Link from "next/link";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phone.trim())}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Order not found"); return; }
    setOrder(data);
  }

  async function requestReturn() {
    setRequesting(true);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, phone, reason }),
    });
    const data = await res.json();
    setRequesting(false);
    if (res.ok) {
      setOrder({ ...order, returnStatus: "REQUESTED" });
      setRequestDone(true);
    }
  }

  const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentStep = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F0F10] px-4 py-6" style={{ fontFamily: "system-ui, sans-serif" }}>
      <Link href="/" className="text-sm text-[#6B6B72]">← Back to shop</Link>
      <h1 className="text-xl font-black mt-3 mb-5">Track Your Order</h1>

      {!order && (
        <form onSubmit={lookup} className="flex flex-col gap-3 bg-white border border-[#ECECEE] rounded-2xl p-5">
          <label className="text-xs text-[#6B6B72] font-bold">Order ID</label>
          <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Paste your Order ID"
            className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" required />
          <label className="text-xs text-[#6B6B72] font-bold">Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone used while ordering"
            className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" required />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading} className="bg-[#FFB800] font-extrabold text-sm py-3 rounded-xl disabled:opacity-50">
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>
      )}

      {order && (
        <div className="bg-white border border-[#ECECEE] rounded-2xl p-5">
          <p className="text-xs text-[#6B6B72]">Order ID</p>
          <p className="font-mono text-xs font-bold break-all mb-4">{order.id}</p>

          <div className="flex justify-between mb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${i <= currentStep ? "bg-[#FFB800] text-black" : "bg-[#ECECEE] text-[#6B6B72]"}`}>
                  {i <= currentStep ? "✓" : ""}
                </div>
                <p className="text-[9px] mt-1 text-[#6B6B72]">{s}</p>
              </div>
            ))}
          </div>

          {order.status === "CANCELLED" && <p className="text-red-500 text-sm font-bold mb-4">This order was cancelled.</p>}

          <div className="border-t border-[#ECECEE] pt-4 flex flex-col gap-2">
            {order.items.map((i: any) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span>{i.product.name} × {i.quantity}</span>
                <span>₹{i.price * i.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-black mt-3 pt-3 border-t border-[#ECECEE]">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>

          {order.status === "DELIVERED" && order.returnStatus === "NONE" && !requestDone && (
            <div className="mt-5 border-t border-[#ECECEE] pt-4">
              <p className="text-xs text-[#6B6B72] font-bold mb-2">Need to return this order?</p>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Reason for return"
                className="w-full bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2 text-sm mb-2" />
              <button onClick={requestReturn} disabled={requesting} className="w-full border-2 border-black font-extrabold text-sm py-2.5 rounded-xl disabled:opacity-50">
                {requesting ? "Requesting..." : "Request Return"}
              </button>
            </div>
          )}
          {order.returnStatus !== "NONE" && (
            <p className="mt-5 text-sm font-bold text-[#8a5c00] bg-[#FFF3D6] px-3 py-2 rounded-lg">
              Return status: {order.returnStatus}
            </p>
          )}

          <button onClick={() => { setOrder(null); setOrderId(""); setPhone(""); }} className="mt-4 text-xs text-[#6B6B72] underline">
            Track another order
          </button>
        </div>
      )}
    </div>
  );
}
