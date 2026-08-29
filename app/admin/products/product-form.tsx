"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  initial?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    mrp: number | null;
    size: string | null;
    stock: number;
    imageUrl: string | null;
    categoryId: string;
  };
};

export default function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price ?? 0,
    mrp: initial?.mrp ?? 0,
    size: initial?.size || "",
    stock: initial?.stock ?? 0,
    imageUrl: initial?.imageUrl || "",
    categoryId: initial?.categoryId || categories[0]?.id || "",
  });
  const [saving, setSaving] = useState(false);

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = initial ? `/api/products/${initial.id}` : "/api/products";
    const method = initial ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg bg-[#141416] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <label className="block text-xs text-white/50 mb-1">Name</label>
        <input value={form.name} onChange={(e) => update("name", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1">Description</label>
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Price (₹)</label>
          <input type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">MRP (₹, optional)</label>
          <input type="number" value={form.mrp} onChange={(e) => update("mrp", Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Size (e.g. 1kg)</label>
          <input value={form.size} onChange={(e) => update("size", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => update("stock", Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1">Image URL</label>
        <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" placeholder="https://..." />
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1">Category</label>
        <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={saving} className="mt-2 py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm disabled:opacity-50">
        {saving ? "Saving..." : initial ? "Save Changes" : "Add Product"}
      </button>
    </form>
  );
  }
