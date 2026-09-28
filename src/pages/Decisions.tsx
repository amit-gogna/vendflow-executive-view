import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CriticalityTag, PageHeader, Panel, Tag } from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import {
  daysUntil,
  eur,
  shortDate,
  useCaseLabels,
  type Engagement,
  type UseCase,
} from "@/lib/vendflow-data";
import { AlertTriangle, ArrowRight, Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

/* Urgency bands ---------------------------------------------------- */

type Band = "Decide now" | "Prepare next" | "Watching" | "Decided";

const bandFor = (days: number, state: string): Band => {
  if (state === "Decision recorded") return "Decided";
  if (days <= 60) return "Decide now";
  if (days <= 120) return "Prepare next";
  return "Watching";
};

const bandCopy: Record<Band, string> = {
  "Decide now": "A deadline or right closes within two months.",
  "Prepare next": "The deadline is inside the next four months. Evidence can be settled first.",
  Watching: "No near deadline. A condition would change the picture.",
  Decided: "Recorded. Conditions still need verifying.",
};

const bandAccent: Record<Band, string> = {
  "Decide now": "border-l-destructive",
  "Prepare next": "border-l-warning",
  Watching: "border-l-border",
  Decided: "border-l-success",
};

/* Readiness -------------------------------------------------------- */

function readinessOf(e: Engagement) {
  const overdue = e.contributions.filter((c) => c.status === "Overdue");
  const waiting = e.contributions.filter((c) => c.status === "Requested");
  const unreliable = e.evidence.filter((ev) => ev.confidence !== "Verified");

  return {
    overdue: overdue.length,
    waiting: waiting.length,
    unreliable: unreliable.length,
    ready: overdue.length === 0 && waiting.length === 0 && unreliable.length === 0,
  };
}

/* Readiness cell: two signal dots + one short label ---------------- */

function ReadinessCell({ e }: { e: Engagement }) {
  const r = readinessOf(e);
  const decided = e.decisionState === "Decision recorded";

  const inputDot = r.overdue ? "bg-destructive" : r.waiting ? "bg-warning" : "bg-success";
  const factDot = r.unreliable ? "bg-warning" : "bg-success";

  let label = "Ready to decide";
  let labelCls = "text-success";
  if (decided) {
    label = "Decision recorded";
  } else if (r.ready) {
    // keep defaults
  } else if (r.overdue) {
    label = `${r.overdue} overdue input${r.overdue > 1 ? "s" : ""}`;
    labelCls = "text-destructive";
  } else if (r.waiting) {
    label = `${r.waiting} input${r.waiting > 1 ? "s" : ""} awaited`;
    labelCls = "text-warning";
  } else if (r.unreliable) {
    label = `${r.unreliable} fact${r.unreliable > 1 ? "s" : ""} unreliable`;
    labelCls = "text-warning";
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="flex items-center gap-1" title="Contributions">
        <span className={cn("h-1.5 w-6 rounded-full", decided ? "bg-success/40" : inputDot)} />
        <span className={cn("h-1.5 w-6 rounded-full", decided ? "bg-success/40" : factDot)} />
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[12px] font-medium",
          decided ? "text-success" : labelCls,
        )}
      >
        {decided && <Check className="h-3 w-3" />}
        {label}
      </span>
    </div>
  );
}

/* Deadline pill ---------------------------------------------------- */

function DeadlineCell({ e, days }: { e: Engagement; days: number }) {
  const decided = e.decisionState === "Decision recorded";
  const tone = decided
    ? "bg-secondary text-muted-foreground"
    : days <= 60
      ? "bg-destructive/10 text-destructive"
      : days <= 120
        ? "bg-warning/15 text-warning"
        : "bg-secondary text-foreground";

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold tabular-nums", tone)}>
        {decided ? "Closed" : days > 0 ? `${days} days` : "Passed"}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {shortDate(e.noticeDeadline)}
        {e.autoRenews && !decided && " · auto-renews"}
      </span>
    </div>
  );
}

const bands: Band[] = ["Decide now", "Prepare next", "Watching", "Decided"];

export default function Decisions() {
  const { engagements, currentUser } = usePrototype();
  const [onlyMine, setOnlyMine] = useState(false);
  const [useCase, setUseCase] = useState<UseCase | "All">("All");

  const filtered = useMemo(() => {
    let list = engagements;
    if (onlyMine) list = list.filter((e) => e.owner === currentUser.name);
    if (useCase !== "All") list = list.filter((e) => e.useCase === useCase);
    return list
      .map((e) => ({ e, days: daysUntil(e.noticeDeadline) }))
      .sort((a, b) => a.days - b.days);
  }, [engagements, onlyMine, currentUser.name, useCase]);

  const caseCounts = useMemo(() => {
    const base = onlyMine ? engagements.filter((e) => e.owner === currentUser.name) : engagements;
    return base.reduce<Record<string, number>>((acc, e) => {
      acc[e.useCase] = (acc[e.useCase] ?? 0) + 1;
      return acc;
    }, {});
  }, [engagements, onlyMine, currentUser.name]);

  const decideNow = filtered.filter(({ e, days }) => bandFor(days, e.decisionState) === "Decide now");
  const atStake = decideNow.reduce((sum, { e }) => sum + e.stakeAmount, 0);

  const caseFilters: (UseCase | "All")[] = [
    "All",
    "Renewal cliff",
    "Scope change",
    "Rate drift",
    "Service failure",
    "Tenure risk",
    "Closeout",
  ];

  return (
    <AppLayout width="wide">
      <div className="space-y-5">
        <PageHeader
          eyebrow="Your work"
          title="Decisions"
          purpose="Every decision with a closing date and a figure at stake."
          actions={
            <button
              onClick={() => setOnlyMine((v) => !v)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-medium transition-colors",
                onlyMine
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Owned by me
            </button>
          }
        />

        {/* Headline ------------------------------------------------- */}
        {decideNow.length > 0 && (
          <Panel className="flex items-center gap-4 border-destructive/30 bg-destructive/[0.04] px-5 py-3.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="flex-1 text-[13px] text-foreground">
              <span className="font-semibold">{decideNow.length} close within 60 days</span>
              <span className="text-muted-foreground">
                {" "}
                · {eur(atStake)} at stake · earliest {shortDate(decideNow[0].e.noticeDeadline)}
              </span>
            </p>
            <Link
              to={`/engagement/${decideNow[0].e.id}`}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:opacity-90"
            >
              Closest one <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Panel>
        )}

        {/* Use-case filter ------------------------------------------ */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
          <span className="mr-1 text-[12px] text-muted-foreground">Type</span>
          {caseFilters.map((c) => {
            const count = c === "All" ? undefined : (caseCounts[c] ?? 0);
            if (c !== "All" && !count) return null;
            return (
              <button
                key={c}
                onClick={() => setUseCase(c)}
                title={c === "All" ? undefined : useCaseLabels[c].explain}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors",
                  useCase === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {c === "All" ? "Everything" : c}
                {count !== undefined && <span className="text-muted-foreground/70">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Bands ---------------------------------------------------- */}
        {bands.map((band) => {
          const items = filtered.filter(({ e, days }) => bandFor(days, e.decisionState) === band);
          if (!items.length) return null;

          return (
            <section key={band}>
              <div className="mb-2 flex items-baseline gap-2.5" title={bandCopy[band]}>
                <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">
                  {band}
                </h2>
                <span className="text-[12px] tabular-nums text-muted-foreground">{items.length}</span>
              </div>

              <div className="space-y-1.5">
                {items.map(({ e, days }) => {
                  const decided = e.decisionState === "Decision recorded";
                  return (
                    <Link
                      key={e.id}
                      to={`/engagement/${e.id}`}
                      className={cn(
                        "group grid grid-cols-[minmax(0,1fr)_200px_125px_112px_20px] items-center gap-4 rounded-lg border border-border border-l-2 bg-card px-4 py-3 shadow-card outline-none transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring",
                        bandAccent[band],
                      )}
                    >
                      {/* What */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Tag tone={decided ? "success" : band === "Decide now" ? "danger" : "primary"}>
                            {e.useCase}
                          </Tag>
                          <span className="truncate font-heading text-[14px] font-semibold text-foreground">
                            {e.title}
                          </span>
                          <CriticalityTag value={e.criticality} />
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {e.supplier} · {e.reference} · {e.owner}
                        </p>
                      </div>

                      {/* Readiness */}
                      <ReadinessCell e={e} />

                      {/* Stake */}
                      <div className="text-right">
                        <p className="font-heading text-[15px] font-semibold tabular-nums tracking-tight text-foreground">
                          {eur(e.stakeAmount)}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground" title={e.stakeLabel}>
                          {e.stakeLabel}
                        </p>
                      </div>

                      {/* Deadline */}
                      <DeadlineCell e={e} days={days} />

                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {!filtered.length && (
          <Panel className="px-6 py-14 text-center">
            <h3 className="font-heading text-[14px] font-semibold text-foreground">Nothing here</h3>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
              Clear the filters to see the decisions handled by the wider team.
            </p>
          </Panel>
        )}
      </div>
    </AppLayout>
  );
}
