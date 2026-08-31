export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (key !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
  }

  const email = (process.env.FIRST_ADMIN_EMAIL || "").toLowerCase();
  const password = process.env.FIRST_ADMIN_PASSWORD || "";
  const name = process.env.FIRST_ADMIN_NAME || "Owner";

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: "ADMIN" },
    create: { name, email, password: hashed, role: "ADMIN" },
  });

  const categories = ["Whey Protein", "Creatine", "Pre-Workout", "Mass Gainer", "Vitamins", "Equipment"];
  for (const catName of categories) {
    const slug = catName.toLowerCase().replace(/\s+/g, "-");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: catName, slug },
    });
  }

  return NextResponse.json({ ok: true, message: "Admin password has been reset. You can now log in." });
    }
