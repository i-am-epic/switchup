"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const timezone =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Kolkata"
      : "Asia/Kolkata";

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  async function seed() {
    setBusy(true);
    setMessage("");
    try {
      const result = await api<{ ok: boolean; topics: number }>("/api/seed", {
        method: "POST",
      });
      setMessage(`Seeded ${result.topics} topics. Roadmaps feel alive.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageEnter>
      <PageBlock>
        <AppHeader
          title="Settings"
          subtitle="Timezone is env-only in v1. Password lives in APP_PASSWORD."
        />
      </PageBlock>
      <PageBlock className="paper-card space-y-5 p-6">
        <div>
          <p className="text-sm font-semibold text-ink-soft">Timezone</p>
          <p className="font-display text-2xl">{timezone}</p>
          <p className="mt-1 text-sm text-ink-soft">
            Change via APP_TIMEZONE in .env (default Asia/Kolkata).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void seed()} disabled={busy}>
            {busy ? "Seeding…" : "Seed starter roadmap"}
          </Button>
          <Button variant="peach" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
        {message ? <p className="text-sm text-ink-soft">{message}</p> : null}
      </PageBlock>
    </PageEnter>
  );
}
