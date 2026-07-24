import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validators";
import { jsonError } from "@/lib/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Password required");
  }

  if (!verifyPassword(parsed.data.password)) {
    return jsonError("Wrong password", 401);
  }

  const token = await createSessionToken();
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
