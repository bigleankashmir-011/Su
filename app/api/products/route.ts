import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: Number(body.price),
      mrp: body.mrp ? Number(body.mrp) : null,
      size: body.size || null,
      stock: Number(body.stock) || 0,
      imageUrl: body.imageUrl || null,
      images: body.images || [],
      categoryId: body.categoryId,
    },
  });
  return NextResponse.json(product);
      }
