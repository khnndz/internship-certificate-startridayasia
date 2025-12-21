import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/data-kv";
import ProfileFormClient from "./ProfileFormClient";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const user = await getUserById(session.id);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <ProfileFormClient user={{ name: user.name, email: user.email }} />
    </div>
  );
}
