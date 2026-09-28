import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ConfidenceBadge,
  CriticalityTag,
  DecisionStateTag,
  Panel,
  SourceLine,
  Tag,
} from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import { daysUntil, eur, shortDate, useCaseLabels, type EvidenceLens } from "@/lib/vendflow-data";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Send,
  Sparkle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const lenses: EvidenceLens[] = ["Commercial", "Delivery", "Risk & legal", "Finance"];

const lensOwner: Record<EvidenceLens, string> = {
  Commercial: "Procurement",
  Delivery: "IT and hiring managers",
  "Risk & legal": "Legal, security and risk",
  Finance: "Finance",
};

type DetailTab = "Evidence" | "Specialist input" | "Assessments";

/* Beat heading ----------------------------------------------------- */

function Beat({
  step,
  title,
  hint,
  right,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-heading text-[12px] font-semibold text-primary">
            {step}
          </span>
          <div>
            <h2 className="font-heading text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
          </div>
        </div>
        {right}
      </div>
      <div className="pl-9">{children}</div>
    </section>
  );
}

export default function EngagementWorkspace() {
  const { id = "" } = useParams();
  const { engagements, correctEvidence, requestContribution, recordDecision, decisions, rules } =
    usePrototype();
  const engagement = engagements.find((e) => e.id === id);

  const [activeLens, setActiveLens] = useState<EvidenceLens | "All">("All");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [draftReason, setDraftReason] = useState("");
  const [chosenOption, setChosenOption] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [conditions, setConditions] = useState("");
  const [addedTools, setAddedTools] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("Evidence");

  const recorded = decisions.find((d) => d.engagementId === id);

  const gaps = useMemo(
    () => engagement?.evidence.filter((e) => e.confidence !== "Verified") ?? [],
    [engagement],
  );

  // Pre-draft the rationale when the owner picks the prepared suggestion.
  useEffect(() => {
    if (!engagement || !chosenOption) return;
    const opt = engagement.options.find((o) => o.id === chosenOption);
    if (opt?.recommended) setRationale(engagement.draftRationale);
    else setRationale("");
  }, [chosenOption, engagement]);

  if (!engagement) {
    return (
      <AppLayout>
        <Panel className="px-6 py-14 text-center">
          <h2 className="font-heading text-[15px] font-semibold text-foreground">Engagement not found</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            It may have been closed. Return to the decisions list to pick another.
          </p>
          <Link to="/" className="mt-4 inline-block text-[13px] font-medium text-primary hover:underline">
            Back to decisions
          </Link>
        </Panel>
      </AppLayout>
    );
  }

  const days = daysUntil(engagement.noticeDeadline);
  const evidence =
    activeLens === "All" ? engagement.evidence : engagement.evidence.filter((e) => e.lens === activeLens);
  const option = engagement.options.find((o) => o.id === chosenOption);
  const matchedRules = rules.filter((r) => engagement.signalIds.includes(r.id));

  const waiting = engagement.contributions.filter(
    (c) => c.status === "Requested" || c.status === "Overdue",
  );
  const received = engagement.contributions.filter((c) => c.status === "Received");

  const openDetail = (tab: DetailTab) => {
    setDetailTab(tab);
    setDetailOpen(true);
  };

  const saveCorrection = (evidenceId: string) => {
    if (!draftValue.trim() || !draftReason.trim()) {
      toast({ title: "Add both the corrected value and a reason", variant: "destructive" });
      return;
    }
    correctEvidence(engagement.id, evidenceId, draftValue.trim(), draftReason.trim());
    setEditing(null);
    setDraftValue("");
    setDraftReason("");
    toast({ title: "Evidence corrected", description: "The comparison and history were updated." });
  };

  const submitDecision = () => {
    if (!option) return;
    if (rationale.trim().length < 20) {
      toast({
        title: "A rationale is required",
        description: "Explain in a sentence or two why this option was chosen.",
        variant: "destructive",
      });
      return;
    }
    recordDecision({
      engagementId: engagement.id,
      optionId: option.id,
      optionTitle: option.title,
      rationale: rationale.trim(),
      conditions: conditions.trim(),
      evidenceCited: engagement.evidence
        .filter((e) => e.confidence === "Verified")
        .slice(0, 3)
        .map((e) => e.source),
    });
    toast({ title: "Decision recorded", description: "Owner, rationale and evidence were saved to the record." });
  };

  return (
    <AppLayout width="wide">
      <div className="space-y-8 pb-12">
        {/* Header --------------------------------------------------- */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Decisions
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tag tone="primary">{engagement.useCase}</Tag>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {engagement.reference} · {engagement.type}
            </p>
            <CriticalityTag value={engagement.criticality} />
            <DecisionStateTag value={recorded ? "Decision recorded" : engagement.decisionState} />
          </div>
          <h1 className="mt-1.5 font-heading text-[23px] font-semibold leading-tight tracking-tight text-foreground">
            {engagement.title}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {engagement.supplier} · owner {engagement.owner}, {engagement.ownerRole} · {engagement.costCentre}
          </p>
        </div>

        {/* Beat 1: the briefing ------------------------------------- */}
        <Beat
          step={1}
          title="What is happening"
          hint={useCaseLabels[engagement.useCase].explain}
        >
          <Panel className="overflow-hidden">
            {/* Three plain answers */}
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Closes in
                </p>
                <p
                  className={cn(
                    "mt-1 font-heading text-[20px] font-semibold tracking-tight",
                    days <= 60 ? "text-destructive" : days <= 120 ? "text-warning" : "text-foreground",
                  )}
                >
                  {days > 0 ? `${days} days` : "Passed"}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {shortDate(engagement.noticeDeadline)} · contract ends{" "}
                  {shortDate(engagement.contractExpiry)}
                  {engagement.autoRenews && " · renews automatically"}
                </p>
              </div>

              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">At stake</p>
                <p className="mt-1 font-heading text-[20px] font-semibold tracking-tight text-foreground">
                  {eur(engagement.stakeAmount)}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {engagement.stakeLabel}
                </p>
              </div>

              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Committed per year
                </p>
                <p className="mt-1 font-heading text-[20px] font-semibold tracking-tight text-foreground">
                  {eur(engagement.committedAnnual)}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {eur(engagement.spendToDate)} invoiced to date
                  {engagement.rate && (
                    <>
                      {" · "}€{engagement.rate}/h
                      {engagement.benchmarkRate && ` vs €${engagement.benchmarkRate} median`}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Narrative */}
            <div className="border-t border-border px-5 py-4">
              <p className="text-[13px] leading-relaxed text-foreground/85">{engagement.situation}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
                <span className="font-medium">Why it matters.</span> {engagement.whyItMatters}
              </p>
              {!recorded && (
                <p className="mt-3 rounded border-l-2 border-destructive/50 bg-destructive/[0.05] px-3 py-2 text-[13px] leading-relaxed text-foreground/85">
                  <span className="font-medium">If nobody acts.</span> {engagement.ifNothingHappens}
                </p>
              )}
            </div>

            {/* Reliability + provenance summary */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border bg-surface-sunken px-5 py-3">
              <button
                onClick={() => openDetail("Evidence")}
                className="text-[12px] font-medium text-primary hover:underline"
              >
                {engagement.evidence.length} facts on file
              </button>

              {gaps.length > 0 && (
                <button
                  onClick={() => openDetail("Evidence")}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-warning hover:underline"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {gaps.length} not fully reliable
                </button>
              )}

              <button
                onClick={() => openDetail("Specialist input")}
                className="text-[12px] font-medium text-primary hover:underline"
              >
                {received.length} specialist replies
                {waiting.length > 0 && ` · ${waiting.length} awaited`}
              </button>

              {matchedRules.length > 0 && (
                <span className="inline-flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
                  Raised by
                  {matchedRules.map((r) => (
                    <Link key={r.id} to="/rules">
                      <Tag tone="primary">{r.name}</Tag>
                    </Link>
                  ))}
                </span>
              )}
            </div>
          </Panel>

          {/* Progressive disclosure ---------------------------------- */}
          <button
            onClick={() => setDetailOpen((v) => !v)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
          >
            {detailOpen ? "Hide the working detail" : "Show the working detail"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", detailOpen && "rotate-180")} />
          </button>

          {detailOpen && (
            <Panel className="mt-2.5 overflow-hidden">
              <div className="flex items-center gap-1 border-b border-border bg-surface-sunken px-3 py-2">
                {(["Evidence", "Specialist input", "Assessments"] as DetailTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDetailTab(t)}
                    className={cn(
                      "h-7 rounded border px-3 text-[12px] font-medium transition-colors",
                      detailTab === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Evidence tab */}
              {detailTab === "Evidence" && (
                <div className="px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-[12px] text-muted-foreground">
                      Every fact shows its source, date and limits. Corrections update the options and the record.
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      {(["All", ...lenses] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setActiveLens(l)}
                          className={cn(
                            "h-7 rounded border px-2.5 text-[12px] font-medium transition-colors",
                            activeLens === l
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {evidence.map((ev) => (
                      <div key={ev.id} className="rounded-lg border border-border bg-card px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                              {ev.lens} · {lensOwner[ev.lens]}
                            </p>
                            <h3 className="mt-1 font-heading text-[13px] font-semibold text-foreground">
                              {ev.label}
                            </h3>
                          </div>
                          <ConfidenceBadge confidence={ev.confidence} />
                        </div>

                        <p className="mt-2 font-heading text-[15px] font-semibold tracking-tight text-foreground">
                          {ev.value}
                        </p>

                        <button
                          onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                        >
                          {expanded === ev.id ? "Hide detail" : "Show detail and source"}
                          <ChevronDown
                            className={cn("h-3 w-3 transition-transform", expanded === ev.id && "rotate-180")}
                          />
                        </button>

                        {expanded === ev.id && (
                          <div className="mt-2">
                            <p className="text-[12px] leading-relaxed text-foreground/80">{ev.detail}</p>
                            <SourceLine source={ev.source} observedOn={ev.observedOn} limitation={ev.limitation} />

                            {ev.editable && editing !== ev.id && (
                              <button
                                onClick={() => {
                                  setEditing(ev.id);
                                  setDraftValue(ev.value);
                                  setDraftReason("");
                                }}
                                className="mt-2 inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 text-[12px] font-medium text-foreground hover:bg-secondary"
                              >
                                <Pencil className="h-3 w-3" /> Correct this fact
                              </button>
                            )}

                            {editing === ev.id && (
                              <div className="mt-3 space-y-2 rounded border border-primary/30 bg-primary/[0.04] p-3">
                                <label className="block text-[11px] font-medium text-foreground">
                                  Corrected value
                                </label>
                                <input
                                  value={draftValue}
                                  onChange={(e) => setDraftValue(e.target.value)}
                                  className="h-8 w-full rounded border border-input bg-card px-2 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <label className="block text-[11px] font-medium text-foreground">
                                  Reason for the correction
                                </label>
                                <textarea
                                  value={draftReason}
                                  onChange={(e) => setDraftReason(e.target.value)}
                                  rows={2}
                                  placeholder="What changed and where the new figure came from"
                                  className="w-full rounded border border-input bg-card px-2 py-1.5 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <div className="flex items-center gap-2 pt-0.5">
                                  <button
                                    onClick={() => saveCorrection(ev.id)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:opacity-90"
                                  >
                                    <Check className="h-3 w-3" /> Save correction
                                  </button>
                                  <button
                                    onClick={() => setEditing(null)}
                                    className="h-8 rounded border border-border px-3 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {engagement.openQuestions.length > 0 && (
                    <div className="mt-4 rounded-lg border border-border bg-surface-sunken px-4 py-3.5">
                      <h3 className="font-heading text-[13px] font-semibold text-foreground">
                        Questions this decision still needs answered
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {engagement.openQuestions.map((q) => (
                          <li key={q} className="flex gap-2 text-[12px] leading-relaxed text-foreground/80">
                            <Sparkle className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Specialist input tab */}
              {detailTab === "Specialist input" && (
                <div className="divide-y divide-border">
                  {engagement.contributions.map((c) => (
                    <div key={c.id} className="flex items-start justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground">{c.ask}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {c.owner} · {c.role}
                          {c.dueOn && ` · due ${shortDate(c.dueOn)}`}
                        </p>
                        {c.response && (
                          <p className="mt-2 rounded border-l-2 border-success/50 bg-success/[0.06] px-3 py-2 text-[12px] leading-relaxed text-foreground/85">
                            {c.response}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {c.status === "Received" && <Tag tone="success">Received</Tag>}
                        {c.status === "Requested" && <Tag tone="primary">Requested</Tag>}
                        {c.status === "Overdue" && <Tag tone="danger">Overdue</Tag>}
                        {c.status === "Not requested" && (
                          <button
                            onClick={() => requestContribution(engagement.id, c.id)}
                            className="inline-flex h-7 items-center gap-1.5 rounded border border-border bg-card px-2 text-[12px] font-medium text-foreground hover:bg-secondary"
                          >
                            <Send className="h-3 w-3" /> Request
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Assessments tab */}
              {detailTab === "Assessments" && (
                <div className="px-4 py-4">
                  <p className="mb-3 text-[12px] text-muted-foreground">
                    Attach an assessment to this decision. Results are saved alongside the recorded outcome.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Knowledge transfer assessment",
                      "Rate comparison against benchmark",
                      "Exit and transition readiness",
                      "SOW assumption review",
                      "Co-employment indicator check",
                    ].map((tool) => {
                      const added = addedTools.includes(tool);
                      return (
                        <li key={tool} className="flex items-center justify-between gap-3">
                          <span className="text-[12px] text-foreground/85">{tool}</span>
                          <button
                            onClick={() =>
                              setAddedTools((prev) =>
                                added ? prev.filter((t) => t !== tool) : [...prev, tool],
                              )
                            }
                            className={cn(
                              "inline-flex h-7 items-center gap-1 rounded border px-2 text-[12px] font-medium transition-colors",
                              added
                                ? "border-success/40 bg-success/10 text-success"
                                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                          >
                            {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {added ? "Added" : "Add"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Panel>
          )}
        </Beat>

        {/* Beat 2: the options -------------------------------------- */}
        {engagement.options.length > 0 && (
          <Beat
            step={2}
            title="What can be done"
            hint="Commercial, delivery and risk effects are kept apart so a saving is never read as a delivery outcome."
          >
            <div className="grid grid-cols-2 gap-3">
              {engagement.options.map((o) => {
                const selected = chosenOption === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={!!recorded}
                    onClick={() => setChosenOption(o.id)}
                    className={cn(
                      "rounded-lg border bg-card px-4 py-4 text-left shadow-card transition-colors",
                      selected ? "border-primary ring-1 ring-primary/30" : "border-border",
                      !recorded && "hover:bg-surface-sunken",
                      recorded && "cursor-default opacity-90",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected ? "border-primary bg-primary" : "border-border",
                          )}
                        >
                          {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading text-[14px] font-semibold text-foreground">
                              {o.title}
                            </span>
                            {o.recommended && <Tag tone="primary">Prepared suggestion</Tag>}
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{o.summary}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            "font-heading text-[15px] font-semibold tracking-tight",
                            o.annualDelta < 0
                              ? "text-success"
                              : o.annualDelta > 0
                                ? "text-foreground"
                                : "text-muted-foreground",
                          )}
                        >
                          {o.annualDelta === 0 ? "No change" : eur(Math.abs(o.annualDelta))}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {o.annualDelta < 0 ? "lower per year" : o.annualDelta > 0 ? "added cost" : "in cost"}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-3 space-y-1.5 border-t border-dashed border-border pt-2.5">
                      {[
                        ["Commercial", o.commercialEffect],
                        ["Delivery", o.deliveryEffect],
                        ["Risk", o.riskEffect],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="w-[74px] shrink-0 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                            {k}
                          </dt>
                          <dd className="text-[12px] leading-relaxed text-foreground/80">{v}</dd>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <dt className="w-[74px] shrink-0 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                          Effort
                        </dt>
                        <dd className="text-[12px] text-foreground/80">{o.effort}</dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              A suggestion is prepared work, not an approval. Business need, budget, commercial terms and risk
              acceptance stay with named people.
            </p>
          </Beat>
        )}

        {/* Beat 3: record ------------------------------------------- */}
        <Beat
          step={3}
          title="Record the decision"
          hint="A person decides. The rationale is pre-drafted, edited here, and kept with the evidence it cites."
        >
          {recorded ? (
            <Panel className="border-success/40 bg-success/[0.05] px-5 py-4">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <h3 className="font-heading text-[13px] font-semibold text-foreground">
                    {recorded.optionTitle}
                  </h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {recorded.decidedBy} · {recorded.role} ·{" "}
                    {new Date(recorded.decidedOn).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">{recorded.rationale}</p>
                  {recorded.conditions && (
                    <p className="mt-2 text-[12px] leading-relaxed text-foreground/80">
                      <span className="font-medium">Conditions:</span> {recorded.conditions}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link to="/value" className="text-[12px] font-medium text-primary hover:underline">
                      See the value stage this moved
                    </Link>
                    <span className="text-muted-foreground">·</span>
                    <Link to="/audit" className="text-[12px] font-medium text-primary hover:underline">
                      Open the record
                    </Link>
                  </div>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel className="px-5 py-4">
              {!option ? (
                <p className="text-[13px] text-muted-foreground">
                  Choose an option above. A draft rationale will be prepared for you to edit.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13px] text-foreground">
                    Recording: <span className="font-semibold">{option.title}</span>
                    {option.recommended && (
                      <span className="ml-2 text-[12px] text-muted-foreground">
                        draft rationale prepared — edit before recording
                      </span>
                    )}
                  </p>

                  {gaps.length > 0 && (
                    <p className="rounded border border-warning/40 bg-warning/[0.07] px-3 py-2 text-[12px] leading-relaxed text-foreground/85">
                      {gaps.length} facts are still unreliable, including {gaps[0].label.toLowerCase()}. You can
                      proceed, and the record will show what was unresolved at the time.
                    </p>
                  )}

                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-foreground">
                      Rationale (required)
                    </label>
                    <textarea
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      rows={5}
                      placeholder="Why this option, on which evidence, and what was traded off"
                      className="w-full rounded border border-input bg-card px-3 py-2 text-[13px] leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-foreground">
                      Conditions to verify later
                    </label>
                    <input
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="For example: signature subject to a refreshed security review"
                      className="h-9 w-full rounded border border-input bg-card px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={submitDecision}
                      className="h-9 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
                    >
                      Record decision
                    </button>
                    <button
                      onClick={() => setChosenOption(null)}
                      className="h-9 rounded-md border border-border px-4 text-[13px] font-medium text-muted-foreground hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      Signed as {engagement.owner}, {engagement.ownerRole}
                    </span>
                  </div>
                </div>
              )}
            </Panel>
          )}
        </Beat>
      </div>
    </AppLayout>
  );
}
