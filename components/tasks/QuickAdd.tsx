"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getToday } from "@/lib/dates";

const MODULES = [
  "general",
  "leetcode",
  "backend",
  "ai",
  "azure",
  "projects",
  "articles",
  "notes",
  "interview",
] as const;

export function QuickAdd({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [module, setModule] = useState<(typeof MODULES)[number]>("general");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        e.key.toLowerCase() === "n" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA" &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const today = getToday();
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          module,
          scheduledFor: today,
          dueDate: today,
          priority: "medium",
        }),
      });
      setTitle("");
      setOpen(false);
      onCreated?.();
      window.dispatchEvent(new Event("career-os:tasks-changed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add task"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-matcha text-2xl font-black text-cream shadow-[0_8px_0_var(--matcha-deep)] transition hover:-translate-y-1 active:translate-y-0 active:shadow-none"
      >
        +
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={submit}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="grain-panel w-full max-w-md space-y-4 p-5"
            >
              <div>
                <h2 className="font-display text-2xl">Quick add</h2>
                <p className="text-sm text-ink-soft">
                  Shortcut <kbd className="rounded bg-paper-deep px-1.5">N</kbd>
                </p>
              </div>
              <Input
                autoFocus
                placeholder="What will you gently conquer?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select
                className="w-full rounded-2xl border border-[var(--line)] bg-cream/80 px-4 py-3"
                value={module}
                onChange={(e) =>
                  setModule(e.target.value as (typeof MODULES)[number])
                }
              >
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {error ? <p className="text-sm text-peach-deep">{error}</p> : null}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  Add to today
                </Button>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
