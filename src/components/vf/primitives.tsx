import { cn } from "@/lib/utils";
import { AlertTriangle, CircleHelp, Clock3, GitCompareArrows, ShieldCheck } from "lucide-react";
import type { Criticality, DecisionState, EvidenceConfidence } from "@/lib/vendflow-data";

/* Page scaffolding ------------------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  purpose,
  actions,
}: {
  eyebrow?: string;
  title: string;
  purpose: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-border pb-5">
      <div className="flex items-start justify-between gap-8">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{purpose}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionTitle({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-6">
      <div>
        <h2 className="font-heading text-[14px] font-semibold tracking-tight text-foreground">{title}</h2>
        {hint && <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card shadow-card", className)}>{children}</div>
  );
}

/* Status expression ------------------------------------------------ */

const confidenceStyles: Record<EvidenceConfidence, { cls: string; icon: React.ElementType }> = {
  Verified: { cls: "border-success/30 bg-success/10 text-success", icon: ShieldCheck },
  Unverified: { cls: "border-warning/35 bg-warning/10 text-warning", icon: CircleHelp },
  Stale: { cls: "border-warning/35 bg-warning/10 text-warning", icon: Clock3 },
  Conflicting: { cls: "border-destructive/30 bg-destructive/10 text-destructive", icon: GitCompareArrows },
  Missing: { cls: "border-destructive/30 bg-destructive/10 text-destructive", icon: AlertTriangle },
};

export function ConfidenceBadge({ confidence }: { confidence: EvidenceConfidence }) {
  const { cls, icon: Icon } = confidenceStyles[confidence];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium",
        cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {confidence}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "outline";
}) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/10 text-destructive",
    outline: "border border-border text-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium leading-4",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function CriticalityTag({ value }: { value: Criticality }) {
  return (
    <Tag tone={value === "Business critical" ? "danger" : value === "Important" ? "warning" : "outline"}>
      {value}
    </Tag>
  );
}

export function DecisionStateTag({ value }: { value: DecisionState }) {
  const tone =
    value === "Needs review"
      ? "danger"
      : value === "In review"
        ? "primary"
        : value === "Awaiting contribution"
          ? "warning"
          : value === "Decision recorded"
            ? "success"
            : "outline";
  return <Tag tone={tone as never}>{value}</Tag>;
}

/* Provenance line -------------------------------------------------- */

export function SourceLine({
  source,
  observedOn,
  limitation,
}: {
  source: string;
  observedOn: string;
  limitation?: string;
}) {
  return (
    <div className="mt-2 space-y-1 border-t border-dashed border-border pt-2">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/70">Source</span> · {source} · observed{" "}
        {new Date(observedOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      {limitation && (
        <p className="text-[11px] leading-relaxed text-warning">
          <span className="font-medium">Limitation</span> · {limitation}
        </p>
      )}
    </div>
  );
}

/* Demo data marker ------------------------------------------------- */

export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded border border-dashed border-border bg-surface-sunken px-2 py-1 text-[11px] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}
