import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SignOutButton from "./sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/coupons", label: "Coupons" },
    ...(role === "ADMIN" ? [{ href: "/admin/staff", label: "Staff Logins" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col sm:flex-row">
      <aside className="w-56 shrink-0 border-r border-white/10 p-5 hidden sm:block">
        <p className="font-bold mb-8">BIG LEAN <span className="text-lime-400">ADMIN</span></p>
        <nav className="flex flex-col gap-1 text-sm text-white/60">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white">{l.label}</Link>
          ))}
        </nav>
        <div className="mt-10 text-xs text-white/30">
          Logged in as<br /><span className="text-white/70">{session?.user?.name}</span> ({role})
        </div>
        <div className="mt-3"><SignOutButton /></div>
      </aside>

      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="font-bold">BIG LEAN <span className="text-lime-400">ADMIN</span></p>
        <SignOutButton />
      </div>
      <nav className="sm:hidden flex overflow-x-auto gap-1 px-3 py-2 border-b border-white/10 text-xs">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 px-3 py-2 rounded-lg bg-white/5 text-white/70">{l.label}</Link>
        ))}
      </nav>

      <main className="flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
    }
