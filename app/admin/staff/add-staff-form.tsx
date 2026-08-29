"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStaffForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "STAFF" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-[#141416] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
      <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm">
        <option value="STAFF">Staff (products & orders only)</option>
        <option value="ADMIN">Admin (full access)</option>
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={saving} className="py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm disabled:opacity-50">
        {saving ? "Adding..." : "Add Staff"}
      </button>
    </form>
  );
        }
