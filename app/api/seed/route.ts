import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded } from "@/lib/api";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const result = await seedDatabase(prisma);
  return NextResponse.json(result);
}
