import { NextResponse } from "next/server";
import { getSession } from "./session";

export async function unauthorizedIfNeeded() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
