export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import AddStaffForm from "./add-staff-form";
import DeleteStaffButton from "./delete-staff-button";

export default async function StaffPage() {
  const staff = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff Logins</h1>

      <div className="bg-[#141416] border border-white/10 rounded-2xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs uppercase">
            <tr className="border-b border-white/10">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id} className="border-b border-white/5 last:border-0">
                <td className="p-4">{u.name}</td>
                <td className="p-4 text-white/50">{u.email}</td>
                <td className="p-4 text-white/50">{u.role}</td>
                <td className="p-4 text-right">
                  <DeleteStaffButton id={u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-bold mb-4">Add Staff Login</h2>
      <AddStaffForm />
    </div>
  );
      }
