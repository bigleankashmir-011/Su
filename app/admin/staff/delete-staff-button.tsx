"use client";
import { useRouter } from "next/navigation";

export default function DeleteStaffButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Remove this staff login?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-red-400 text-xs font-semibold">
      Remove
    </button>
  );
}
