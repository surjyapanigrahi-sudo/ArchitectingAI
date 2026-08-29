import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getDashboardData } from "@/modules/dashboard/dashboard-data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json(await getDashboardData(user));
}
