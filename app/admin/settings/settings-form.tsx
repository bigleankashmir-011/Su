"use client";
import { useState } from "react";

type Settings = {
  instagram: string | null; facebook: string | null; whatsapp: string | null;
  phone1: string | null; phone2: string | null; outlet1: string | null;
  outlet2: string | null; aboutText: string | null;
} | null;

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState({
    instagram: initial?.instagram || "",
    facebook: initial?.facebook || "",
    whatsapp: initial?.whatsapp || "",
    phone1: initial?.phone1 || "",
    phone2: initial?.phone2 || "",
    outlet1: initial?.outlet1 || "",
    outlet2: initial?.outlet2 || "",
    aboutText: initial?.aboutText || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields: [string, string, string][] = [
    ["phone1", "Contact Number 1", "+91 7006208990"],
    ["phone2", "Contact Number 2", "+91 9149860957"],
    ["whatsapp", "WhatsApp Number", "+91 7006208990"],
    ["instagram", "Instagram Handle", "@biglean_supplements_kashmir_"],
    ["facebook", "Facebook Page", "BigLean Supplements Kulgam"],
    ["outlet1", "Outlet 1 Address", "Kulgam Town — Main Market"],
    ["outlet2", "Outlet 2 Address", "D.H. Pora (Noorabad), Kulgam"],
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-lg bg-[#141416] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      {fields.map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="block text-xs text-white/50 mb-1">{label}</label>
          <input value={(form as any)[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
        </div>
      ))}
      <div>
        <label className="block text-xs text-white/50 mb-1">About Text</label>
        <textarea value={form.aboutText} onChange={e => update("aboutText", e.target.value)} rows={3}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
      </div>
      <button type="submit" disabled={saving} className="py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm disabled:opacity-50">
        {saving ? "Saving..." : saved ? "✓ Saved" : "Save Settings"}
      </button>
    </form>
  );
    }
