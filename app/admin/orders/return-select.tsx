"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RETURN_STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "REFUNDED"];

export default function ReturnSelect({ orderId, returnStatus, reason }: { orderId: string; returnStatus: string; reason: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnStatus: e.target.value }),
    });
    router.refresh();
  }

  return (
    <div className="text-right">
      <button onClick={() => setOpen(!open)} className="text-[10px] text-orange-400 font-bold underline">
        Return: {returnStatus}
      </button>
      {open && (
        <div className="mt-1">
          {reason && <p className="text-[10px] text-white/40 mb-1 max-w-[180px]">Reason: {reason}</p>}
          <select defaultValue={returnStatus} onChange={handleChange}
            className="px-2 py-1 rounded-lg bg-[#0A0A0B] border border-white/10 text-[10px]">
            {RETURN_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
      )}
    </div>
  );
}
