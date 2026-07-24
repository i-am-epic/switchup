import { NextResponse } from "next/server";
import { unauthorizedIfNeeded } from "@/lib/api";
import { getDashboard } from "@/lib/tasks";

export async function GET() {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const dashboard = await getDashboard();
  return NextResponse.json(dashboard);
}
