"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", accent: "bg-butter/80" },
  { href: "/today", label: "Today", accent: "bg-matcha/40" },
  { href: "/calendar", label: "Calendar", accent: "bg-lavender/50" },
  { href: "/leetcode", label: "LeetCode", accent: "bg-peach/45" },
  { href: "/backend", label: "Backend", accent: "bg-matcha/35" },
  { href: "/ai", label: "AI Engineer", accent: "bg-lavender/45" },
  { href: "/mlops", label: "MLOps", accent: "bg-matcha/50" },
  { href: "/architect", label: "Architect", accent: "bg-peach/55" },
  { href: "/patterns", label: "Design Patterns", accent: "bg-lavender/55" },
  { href: "/claude", label: "Claude Architect", accent: "bg-butter/60" },
  { href: "/azure", label: "Azure", accent: "bg-butter/70" },
  { href: "/articles", label: "Articles", accent: "bg-peach/40" },
  { href: "/notes", label: "Notes", accent: "bg-lavender/40" },
  { href: "/projects", label: "Projects", accent: "bg-matcha/30" },
  { href: "/interviews", label: "Interviews", accent: "bg-peach/50" },
  { href: "/settings", label: "Settings", accent: "bg-paper-deep" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-6 border-b border-[var(--line)] bg-cream/70 px-4 py-5 backdrop-blur md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:px-5 md:py-7">
      <div>
        <p className="font-display text-3xl leading-none tracking-tight text-ink brand-shimmer">
          SwitchUp
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Level-up studio · matcha & paper
        </p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group relative shrink-0 rounded-2xl px-3 py-2 text-sm font-semibold transition",
                active
                  ? "bg-ink text-cream shadow-[0_6px_0_rgba(44,36,27,0.15)]"
                  : "text-ink-soft hover:bg-paper-deep/80 hover:text-ink",
              )}
            >
              <span
                className={clsx(
                  "mr-2 inline-block h-2 w-2 rounded-full transition",
                  active ? "bg-butter" : item.accent,
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
