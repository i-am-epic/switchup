import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const ok = await getSession();
  redirect(ok ? "/dashboard" : "/login");
}
