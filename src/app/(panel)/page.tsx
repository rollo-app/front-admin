import { requireSession } from "@/lib/auth";

export default async function DashboardPage() {
  await requireSession();
  return <h1 className="p-6 text-2xl font-semibold">Dashboard</h1>;
}
