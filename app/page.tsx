import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">Big Lean Supplements Kashmir</h1>
      <p className="text-white/40 text-sm">
        This is the backend + admin panel. The customer-facing storefront design will be connected here separately.
      </p>
      <Link href="/admin" className="px-5 py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm">
        Go to Admin Panel
      </Link>
    </main>
  );
}
