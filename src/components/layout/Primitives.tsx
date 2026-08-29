import { type ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-elegant ${className}`}>
      {children}
    </div>
  );
}

export function ChainBadge({ chain }: { chain: string }) {
  const color =
    chain === "BNB"
      ? "var(--chain-bnb)"
      : chain === "ETH"
        ? "var(--chain-eth)"
        : chain === "SOL"
          ? "var(--chain-sol)"
          : "var(--chain-base)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, borderColor: `${color}55`, background: `${color}14` }}
    >
      <span className="h-1.5 w-1.5 rounded-sm" style={{ background: color }} />
      {chain}
    </span>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = String(status ?? "pending").toLowerCase();
  const map: Record<string, { c: string; bg: string; label: string }> = {
    completed: { c: "var(--success)", bg: "oklch(0.7 0.17 155 / 0.12)", label: "completed" },
    active: { c: "var(--success)", bg: "oklch(0.7 0.17 155 / 0.12)", label: "active" },
    passed: { c: "var(--success)", bg: "oklch(0.7 0.17 155 / 0.12)", label: "passed" },
    verified: { c: "var(--success)", bg: "oklch(0.7 0.17 155 / 0.12)", label: "verified" },
    cleared: { c: "var(--success)", bg: "oklch(0.7 0.17 155 / 0.12)", label: "cleared" },
    processing: { c: "var(--warning)", bg: "oklch(0.78 0.16 75 / 0.14)", label: "processing" },
    pending: { c: "var(--warning)", bg: "oklch(0.78 0.16 75 / 0.14)", label: "pending" },
    scheduled: { c: "var(--primary)", bg: "oklch(0.45 0.07 195 / 0.1)", label: "scheduled" },
    failed: { c: "var(--destructive)", bg: "oklch(0.55 0.2 25 / 0.12)", label: "failed" },
    rejected: { c: "var(--destructive)", bg: "oklch(0.55 0.2 25 / 0.12)", label: "rejected" },
    inactive: { c: "var(--muted-foreground)", bg: "oklch(0.5 0.02 220 / 0.12)", label: "inactive" },
  };
  const s = map[normalized] ?? { ...map.pending, label: normalized };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize"
      style={{ color: s.c, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-sm" style={{ background: s.c }} />
      {s.label}
    </span>
  );
}
