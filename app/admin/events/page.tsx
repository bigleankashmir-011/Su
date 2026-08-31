export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import EventManager from "./event-manager";

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      <p className="text-white/40 text-sm mb-6">Only the event marked Active shows on the homepage banner.</p>
      <EventManager initial={events} />
    </div>
  );
}
