import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const products = await prisma.product.findMany({
    where: { id: { in: body.items.map((i: any) => i.productId) } },
  });

  const items = body.items.map((i: any) => {
    const product = products.find((p) => p.id === i.productId);
    return {
      productId: i.productId,
      quantity: i.quantity,
      price: product?.price || 0,
    };
  });

  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      city: body.city,
      pincode: body.pincode,
      paymentMethod: "COD",
      total,
      items: { create: items },
    },
    include: { items: true },
  });

  return NextResponse.json(order);
                  }
