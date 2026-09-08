export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await prisma.pageView.create({
      data: { path: body.path || "/", source: body.source || "direct" },
    });
  } catch (e) {}
  return NextResponse.json({ ok: true });
             }
