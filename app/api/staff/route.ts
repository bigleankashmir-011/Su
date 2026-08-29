import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Only an admin can add staff logins" }, { status: 403 });
  }

  const body = await req.json();
  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email.toLowerCase(),
      password: hashed,
      role: body.role === "ADMIN" ? "ADMIN" : "STAFF",
    },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
