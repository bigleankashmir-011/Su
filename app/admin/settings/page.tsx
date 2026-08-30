import { prisma } from "@/lib/prisma";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      <p className="text-white/40 text-sm mb-6">These details appear on the customer-facing website footer.</p>
      <SettingsForm initial={settings} />
    </div>
  );
}
