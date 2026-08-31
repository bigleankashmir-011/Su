export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import CouponManager from "./coupon-manager";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>
      <CouponManager initial={coupons} />
    </div>
  );
}
