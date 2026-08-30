"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Event = { id: string; title: string; subtitle: string | null; ctaLabel: string; images: string[]; active: boolean };

export default function EventManager({ initial }: { initial: Event[] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initial);
  const [form, setForm] = useState({ title: "", subtitle: "", ctaLabel: "Notify Me" });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) uploaded.push(data.url);
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images }),
    });
    const newEvent = await res.json();
    setEvents([newEvent, ...events]);
    setForm({ title: "", subtitle: "", ctaLabel: "Notify Me" });
    setImages([]);
    setSaving(false);
    router.refresh();
  }

  async function toggleActive(ev: Event) {
    await fetch(`/api/events/${ev.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !ev.active }),
    });
    setEvents(events.map(e => e.id === ev.id ? { ...e, active: !e.active } : e));
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setEvents(events.filter(e => e.id !== id));
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={addEvent} className="max-w-lg bg-[#141416] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-bold text-sm">Add New Event</h2>
        <div>
          <label className="block text-xs text-white/50 mb-1">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Subtitle</label>
          <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Button Text</label>
          <input value={form.ctaLabel} onChange={e => setForm({ ...form, ctaLabel: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Event Photos</label>
          <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#0A0A0B] border border-dashed border-white/20 text-sm text-white/60 cursor-pointer">
            {uploading ? "Uploading..." : "+ Select photos from gallery"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.map(url => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter(i => i !== url))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={saving || uploading} className="py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm disabled:opacity-50">
          {saving ? "Adding..." : "Add Event"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {events.map(ev => (
          <div key={ev.id} className="bg-[#141416] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">{ev.title}</p>
                {ev.subtitle && <p className="text-white/40 text-xs mt-1">{ev.subtitle}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => toggleActive(ev)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${ev.active ? "bg-lime-400 text-black" : "bg-white/10 text-white/50"}`}>
                  {ev.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deleteEvent(ev.id)} className="text-red-400 text-xs font-semibold">Delete</button>
              </div>
            </div>
            {ev.images?.length > 0 && (
              <div className="flex gap-2 mt-3">
                {ev.images.map(img => (
                  <img key={img} src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                ))}
              </div>
            )}
          </div>
        ))}
        {events.length === 0 && <p className="text-white/30 text-sm">No events yet.</p>}
      </div>
    </div>
  );
  }
