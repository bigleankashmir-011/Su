"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#141416] border border-white/10 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-1">Big Lean Admin</h1>
        <p className="text-white/40 text-sm mb-6">Staff login</p>

        <label className="block text-xs text-white/50 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-white text-sm"
          required
        />

        <label className="block text-xs text-white/50 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-white/10 text-white text-sm"
          required
        />

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <button type="submit" className="w-full py-2.5 rounded-lg bg-lime-400 text-black font-bold text-sm">
          Log In
        </button>
      </form>
    </div>
  );
      }
