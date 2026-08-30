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
    return { productId: i.productId, quantity: i.quantity, price: product?.price || 0 };
  });

  const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  let discount = 0;
  let couponCode: string | null = null;
  if (body.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: body.couponCode.toUpperCase() } });
    if (coupon && coupon.active) {
      discount = coupon.discountType === "PERCENT"
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : coupon.discountValue;
      discount = Math.min(discount, subtotal);
      couponCode = coupon.code;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
    }
  }

  const total = subtotal - discount;

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      city: body.city,
      pincode: body.pincode,
      paymentMethod: "COD",
      couponCode,
      discount,
      total,
      items: { create: items },
    },
    include: { items: true },
  });

  return NextResponse.json(order);
                  }
