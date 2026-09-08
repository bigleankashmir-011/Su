export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId") || "";
  const phone = req.nextUrl.searchParams.get("phone") || "";

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.phone !== phone) {
    return NextResponse.json({ error: "No order found with that Order ID and phone number" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order = await prisma.order.findUnique({ where: { id: body.orderId } });

  if (!order || order.phone !== body.phone) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Returns can only be requested after delivery" }, { status: 400 });
  }
  if (order.returnStatus !== "NONE") {
    return NextResponse.json({ error: "A return has already been requested for this order" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: body.orderId },
    data: { returnStatus: "REQUESTED", returnReason: body.reason || null },
  });
  return NextResponse.json(updated);
}
