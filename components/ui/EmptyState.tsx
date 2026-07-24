import { Button } from "./Button";

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-cream/40 px-6 py-14 text-center">
      <div className="text-4xl" aria-hidden>
        🌱
      </div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{body}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
