import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await prisma.coupon.findUnique({ where: { code: body.code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "This coupon code already exists" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      discountType: body.discountType === "FLAT" ? "FLAT" : "PERCENT",
      discountValue: Number(body.discountValue),
      active: body.active ?? true,
    },
  });
  return NextResponse.json(coupon);
}
