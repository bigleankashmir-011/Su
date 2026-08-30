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
    stockOutlet1: number;
    stockOutlet2: number;
    imageUrl: string | null;
    images: string[];
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
    stockOutlet1: initial?.stockOutlet1 ?? 0,
    stockOutlet2: initial?.stockOutlet2 ?? 0,
    categoryId: initial?.categoryId || categories[0]?.id || "",
  });
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) uploaded.push(data.url);
      else setError(data.error || "Upload failed for one of the images");
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = initial ? `/api/products/${initial.id}` : "/api/products";
    const method = initial ? "PUT" : "POST";
    const stock = Number(form.stockOutlet1) + Number(form.stockOutlet2);
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, stock, images, imageUrl: images[0] || null }),
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

      <div>
        <label className="block text-xs text-white/50 mb-1">Size (e.g. 1kg)</label>
        <input value={form.size} onChange={(e) => update("size", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Stock — Kulgam Town</label>
          <input type="number" value={form.stockOutlet1} onChange={(e) => update("stockOutlet1", Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Stock — D.H. Pora</label>
          <input type="number" value={form.stockOutlet2} onChange={(e) => update("stockOutlet2", Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1">Photos</label>
        <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#0A0A0B] border border-dashed border-white/20 text-sm text-white/60 cursor-pointer">
          {uploading ? "Uploading..." : "+ Select photos from gallery"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} disabled={uploading} />
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1">Category</label>
        <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm">
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button type="submit" disabled={saving || uploading} className="mt-2 py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm disabled:opacity-50">
        {saving ? "Saving..." : initial ? "Save Changes" : "Add Product"}
      </button>
    </form>
  );
    }
