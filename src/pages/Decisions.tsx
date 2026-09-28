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
import { AlertTriangle, ArrowRight, Check, Clock3, Filter } from "lucide-react";
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

const bandTone: Record<Band, string> = {
  "Decide now": "border-destructive/35 bg-destructive/[0.04]",
  "Prepare next": "border-warning/35 bg-warning/[0.04]",
  Watching: "border-border bg-card",
  Decided: "border-success/30 bg-success/[0.03]",
};

/* Readiness -------------------------------------------------------- */

function readinessOf(e: Engagement) {
  const blockers: string[] = [];
  const unreliable = e.evidence.filter((ev) => ev.confidence !== "Verified");
  const waiting = e.contributions.filter((c) => c.status === "Requested" || c.status === "Overdue");
  const overdue = e.contributions.filter((c) => c.status === "Overdue");

  if (overdue.length) blockers.push(`${overdue.length} overdue input`);
  else if (waiting.length) blockers.push(`${waiting.length} input awaited`);
  if (unreliable.length) blockers.push(`${unreliable.length} fact${unreliable.length > 1 ? "s" : ""} unreliable`);

  return {
    blockers,
    ready: blockers.length === 0,
    hasOverdue: overdue.length > 0,
  };
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
      <div className="space-y-6">
        <PageHeader
          eyebrow="Your work"
          title="Decisions"
          purpose="Each item is one decision with a date it closes and a figure at stake. Open it to read the briefing, compare the options and record a choice."
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
          <Panel className="flex items-center gap-6 border-destructive/30 bg-destructive/[0.04] px-5 py-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="font-heading text-[14px] font-semibold text-foreground">
                {decideNow.length} decision{decideNow.length > 1 ? "s" : ""} close within 60 days
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {eur(atStake)} is at stake across them. The earliest closes{" "}
                {shortDate(decideNow[0].e.noticeDeadline)}.
              </p>
            </div>
            <Link
              to={`/engagement/${decideNow[0].e.id}`}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              Open the closest one <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Panel>
        )}

        {/* Use-case filter ------------------------------------------ */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
          <span className="mr-1 text-[12px] text-muted-foreground">Type of decision</span>
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

        {useCase !== "All" && (
          <p className="-mt-2 text-[12px] leading-relaxed text-muted-foreground">
            {useCaseLabels[useCase].explain}
          </p>
        )}

        {/* Bands ---------------------------------------------------- */}
        {bands.map((band) => {
          const items = filtered.filter(({ e, days }) => bandFor(days, e.decisionState) === band);
          if (!items.length) return null;

          return (
            <section key={band}>
              <div className="mb-2.5 flex items-baseline gap-3">
                <h2 className="font-heading text-[14px] font-semibold tracking-tight text-foreground">
                  {band}
                </h2>
                <Tag tone="outline">{items.length}</Tag>
                <p className="text-[12px] text-muted-foreground">{bandCopy[band]}</p>
              </div>

              <div className="space-y-2.5">
                {items.map(({ e, days }) => {
                  const readiness = readinessOf(e);
                  const decided = e.decisionState === "Decision recorded";
                  return (
                    <Link
                      key={e.id}
                      to={`/engagement/${e.id}`}
                      className={cn(
                        "group flex items-stretch gap-6 rounded-lg border px-5 py-4 shadow-card outline-none transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring",
                        bandTone[band],
                      )}
                    >
                      {/* Left: what and why */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Tag tone={decided ? "success" : band === "Decide now" ? "danger" : "primary"}>
                            {e.useCase}
                          </Tag>
                          <span className="font-heading text-[14px] font-semibold text-foreground">
                            {e.title}
                          </span>
                          <CriticalityTag value={e.criticality} />
                        </div>

                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {e.supplier} · {e.reference} · owner {e.owner}
                        </p>

                        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-foreground/85">
                          {decided ? e.situation : e.ifNothingHappens}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          {decided ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success">
                              <Check className="h-3 w-3" /> Decision recorded
                            </span>
                          ) : readiness.ready ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success">
                              <Check className="h-3 w-3" /> Ready to decide
                            </span>
                          ) : (
                            <>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-[12px] font-medium",
                                  readiness.hasOverdue ? "text-destructive" : "text-warning",
                                )}
                              >
                                <Clock3 className="h-3 w-3" /> Waiting on
                              </span>
                              {readiness.blockers.map((b) => (
                                <Tag key={b} tone={readiness.hasOverdue ? "danger" : "warning"}>
                                  {b}
                                </Tag>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Middle: stake */}
                      <div className="w-[150px] shrink-0 border-l border-border pl-5">
                        <p className="font-heading text-[17px] font-semibold tracking-tight text-foreground">
                          {eur(e.stakeAmount)}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          {e.stakeLabel}
                        </p>
                      </div>

                      {/* Right: clock */}
                      <div className="w-[130px] shrink-0 border-l border-border pl-5">
                        <p
                          className={cn(
                            "font-heading text-[17px] font-semibold tracking-tight",
                            decided
                              ? "text-foreground"
                              : days <= 60
                                ? "text-destructive"
                                : days <= 120
                                  ? "text-warning"
                                  : "text-foreground",
                          )}
                        >
                          {days > 0 ? `${days} days` : "passed"}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          until {shortDate(e.noticeDeadline)}
                          {e.autoRenews && !decided && (
                            <>
                              <br />
                              then renews automatically
                            </>
                          )}
                        </p>
                      </div>

                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
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
