import { Chip } from "@/components/ui/Chip";

export function StatPill({
  label,
  value,
  tone = "lavender",
}: {
  label: string;
  value: string | number;
  tone?: "lavender" | "butter" | "peach" | "matcha" | "paper";
}) {
  return (
    <div className="paper-card flex min-w-[140px] flex-1 flex-col gap-2 p-4">
      <Chip tone={tone}>{label}</Chip>
      <p className="font-display text-3xl tracking-tight">{value}</p>
    </div>
  );
}
