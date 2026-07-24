"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Wrong password");
        return;
      }
      router.replace(params.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the studio");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grain-panel w-full max-w-md space-y-6 p-8"
    >
      <div className="space-y-2">
        <p className="font-display text-5xl leading-none tracking-tight brand-shimmer">
          SwitchUp
        </p>
        <p className="text-ink-soft">
          Soft paper desk for leveling up your career. Enter the shared password
          to open your studio.
        </p>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink-soft">Password</span>
        <Input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </label>
      {error ? (
        <p className="rounded-2xl bg-peach/30 px-3 py-2 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Opening…" : "Enter studio"}
      </Button>
    </motion.form>
  );
}
