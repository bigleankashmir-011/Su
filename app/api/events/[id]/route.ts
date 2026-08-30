import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle || null } : {}),
      ...(body.ctaLabel !== undefined ? { ctaLabel: body.ctaLabel } : {}),
      ...(body.images !== undefined ? { images: body.images } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
