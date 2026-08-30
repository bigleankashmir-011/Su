import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      instagram: body.instagram || null,
      facebook: body.facebook || null,
      whatsapp: body.whatsapp || null,
      phone1: body.phone1 || null,
      phone2: body.phone2 || null,
      outlet1: body.outlet1 || null,
      outlet2: body.outlet2 || null,
      aboutText: body.aboutText || null,
    },
    create: {
      id: "main",
      instagram: body.instagram || null,
      facebook: body.facebook || null,
      whatsapp: body.whatsapp || null,
      phone1: body.phone1 || null,
      phone2: body.phone2 || null,
      outlet1: body.outlet1 || null,
      outlet2: body.outlet2 || null,
      aboutText: body.aboutText || null,
    },
  });
  return NextResponse.json(settings);
}
