"use client";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-red-400 text-xs font-semibold">
      Delete
    </button>
  );
}
