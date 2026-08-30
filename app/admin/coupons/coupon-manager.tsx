"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Coupon = { id: string; code: string; discountType: string; discountValue: number; active: boolean; usageCount: number };

export default function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState({ code: "", discountType: "PERCENT", discountValue: 10 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    setCoupons([data, ...coupons]);
    setForm({ code: "", discountType: "PERCENT", discountValue: 10 });
    router.refresh();
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    setCoupons(coupons.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    setCoupons(coupons.filter(c => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={addCoupon} className="max-w-lg bg-[#141416] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-bold text-sm">Add New Coupon</h2>
        <div>
          <label className="block text-xs text-white/50 mb-1">Coupon Code</label>
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. BIGLEAN20" className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Discount Type</label>
            <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm">
              <option value="PERCENT">Percentage (%)</option>
              <option value="FLAT">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Value</label>
            <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={saving} className="py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm disabled:opacity-50">
          {saving ? "Adding..." : "Add Coupon"}
        </button>
      </form>

      <div className="bg-[#141416] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs uppercase">
            <tr className="border-b border-white/10">
              <th className="text-left p-4">Code</th>
              <th className="text-left p-4">Discount</th>
              <th className="text-left p-4">Used</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b border-white/5 last:border-0">
                <td className="p-4 font-bold">{c.code}</td>
                <td className="p-4 text-white/60">{c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="p-4 text-white/60">{c.usageCount} orders</td>
                <td className="p-4">
                  <button onClick={() => toggleActive(c)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${c.active ? "bg-lime-400 text-black" : "bg-white/10 text-white/50"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteCoupon(c.id)} className="text-red-400 text-xs font-semibold">Delete</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-white/30">No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
    }
