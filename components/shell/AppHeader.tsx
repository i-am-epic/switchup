export function AppHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-ink md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-base text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
