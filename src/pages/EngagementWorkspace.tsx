import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  ConfidenceBadge,
  DecisionStateTag,
  Panel,
  SourceLine,
  Tag,
} from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import { daysUntil, eur, shortDate, type EvidenceLens } from "@/lib/vendflow-data";
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
  const [optionDetailsOpen, setOptionDetailsOpen] = useState(false);

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
      <div className="mx-auto max-w-[1080px] pb-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Decisions
        </Link>
        <div className="mt-4 flex items-start justify-between gap-6 border-b border-border pb-5">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <Tag tone="primary">{engagement.useCase}</Tag>
              <span className="text-[11px] text-muted-foreground">{engagement.reference} · {engagement.supplier}</span>
            </div>
            <h1 className="font-heading text-[23px] font-semibold text-foreground">{engagement.title}</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{engagement.situation}</p>
          </div>
          <DecisionStateTag value={recorded ? "Decision recorded" : engagement.decisionState} />
        </div>

        <section aria-label="Decision brief" className="border-b border-border py-5">
          <div className="grid grid-cols-[160px_160px_1fr] items-start gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase text-muted-foreground">Notice deadline</p>
              <p className={cn("mt-1 font-heading text-[20px] font-semibold tabular-nums", days <= 60 ? "text-destructive" : "text-foreground")}>{days > 0 ? `${days} days` : "Passed"}</p>
              <p className="text-[12px] text-muted-foreground">{shortDate(engagement.noticeDeadline)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase text-muted-foreground">At stake</p>
              <p className="mt-1 font-heading text-[20px] font-semibold tabular-nums text-foreground">{eur(engagement.stakeAmount)}</p>
              <p className="text-[12px] text-muted-foreground">{engagement.stakeLabel}</p>
            </div>
            <div className="border-l border-border pl-6">
              <p className="text-[11px] font-medium uppercase text-muted-foreground">If no action is taken</p>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground">{engagement.ifNothingHappens}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="options-heading" className="py-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="options-heading" className="font-heading text-[15px] font-semibold text-foreground">Compare options</h2>
            <Button variant="link" size="sm" className="h-7 px-0 text-[12px]" onClick={() => setOptionDetailsOpen((v) => !v)} aria-expanded={optionDetailsOpen}>
              {optionDetailsOpen ? "Hide trade-offs" : "View trade-offs"}
              <ChevronDown className={cn("transition-transform", optionDetailsOpen && "rotate-180")} />
            </Button>
          </div>
          {engagement.options.length ? (
            <div className="grid grid-cols-2 gap-3">
              {engagement.options.map((o) => {
                const selected = recorded ? recorded.optionId === o.id : chosenOption === o.id;
                return (
                  <div key={o.id} className={cn("flex flex-col rounded-md border bg-card p-4 transition-colors", selected ? "border-primary bg-primary/[0.03]" : "border-border")}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-[14px] font-semibold text-foreground">{o.title}</h3>
                          {o.recommended && <Tag tone="primary">Suggested</Tag>}
                        </div>
                        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{o.summary}</p>
                      </div>
                      <span className={cn("shrink-0 font-heading text-[15px] font-semibold tabular-nums", o.annualDelta < 0 ? "text-success" : "text-foreground")}>
                        {o.annualDelta === 0 ? "No change" : `${o.annualDelta < 0 ? "−" : "+"}${eur(Math.abs(o.annualDelta))}/yr`}
                      </span>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <p className="text-[11px] text-muted-foreground">Effort: <span className="font-medium text-foreground">{o.effort}</span></p>
                      {recorded ? selected && <Tag tone="success">Chosen</Tag> : (
                        <Button variant={selected ? "secondary" : "outline"} size="sm" className="h-8 text-[12px]" onClick={() => setChosenOption(o.id)} aria-pressed={selected}>
                          {selected ? <><Check /> Selected</> : "Select option"}
                        </Button>
                      )}
                    </div>
                    {optionDetailsOpen && (
                      <dl className="mt-4 space-y-2 border-t border-border pt-3">
                        {[["Commercial", o.commercialEffect], ["Delivery", o.deliveryEffect], ["Risk", o.riskEffect]].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[78px_1fr] gap-2 text-[12px] leading-snug">
                            <dt className="text-muted-foreground">{label}</dt><dd className="text-foreground">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[13px] text-muted-foreground">No options have been prepared for this decision.</p>}
        </section>

        <section aria-label="Supporting detail" className="border-y border-border py-3">
          <div className="flex items-center gap-4 text-[12px]">
            <span className="font-medium text-foreground">Supporting detail</span>
            <Button variant="link" size="sm" className="h-7 px-0 text-[12px]" onClick={() => detailOpen && detailTab === "Evidence" ? setDetailOpen(false) : openDetail("Evidence")}>
              {engagement.evidence.length} facts{gaps.length > 0 && <span className="text-warning"> · {gaps.length} to check</span>}
            </Button>
            <Button variant="link" size="sm" className="h-7 px-0 text-[12px]" onClick={() => detailOpen && detailTab === "Specialist input" ? setDetailOpen(false) : openDetail("Specialist input")}>
              Specialist input{waiting.length > 0 && ` · ${waiting.length} awaited`}
            </Button>
            <Button variant="link" size="sm" className="h-7 px-0 text-[12px]" onClick={() => detailOpen && detailTab === "Assessments" ? setDetailOpen(false) : openDetail("Assessments")}>Assessments</Button>
            {matchedRules.length > 0 && <span className="ml-auto text-muted-foreground">{matchedRules.length} signal {matchedRules.length === 1 ? "rule" : "rules"}</span>}
          </div>
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
          )}        </section>

        <section aria-labelledby="record-heading" className="pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="record-heading" className="font-heading text-[15px] font-semibold text-foreground">Record decision</h2>
            <span className="text-[12px] text-muted-foreground">{engagement.owner} · {engagement.ownerRole}</span>
          </div>
          {recorded ? (
            <div className="rounded-md border border-success/40 bg-success/[0.05] p-4">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /><p className="text-[13px] font-semibold text-foreground">{recorded.optionTitle} · recorded</p></div>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground">{recorded.rationale}</p>
              {recorded.conditions && <p className="mt-1 text-[12px] text-muted-foreground">Conditions: {recorded.conditions}</p>}
              <Link to="/audit" className="mt-2 inline-block text-[12px] font-medium text-primary hover:underline">Open the record</Link>
            </div>
          ) : !option ? (
            <p className="text-[13px] text-muted-foreground">Select an option to record your decision.</p>
          ) : (
            <div className="space-y-3 rounded-md border border-border bg-card p-4">
              <p className="text-[13px] font-medium text-foreground">{option.title}</p>
              {gaps.length > 0 && <button type="button" onClick={() => openDetail("Evidence")} className="inline-flex items-center gap-1.5 text-[12px] text-warning hover:underline"><AlertTriangle className="h-3.5 w-3.5" />{gaps.length} facts need checking — review before recording</button>}
              <div>
                <label htmlFor="decision-rationale" className="mb-1 block text-[12px] font-medium text-foreground">Reason for decision</label>
                <textarea id="decision-rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} rows={3} placeholder="Why this option?" className="w-full rounded border border-input bg-card px-3 py-2 text-[13px] leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="decision-conditions" className="mb-1 block text-[12px] font-medium text-foreground">Conditions <span className="font-normal text-muted-foreground">(optional)</span></label>
                <input id="decision-conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Anything to verify later" className="h-9 w-full rounded border border-input bg-card px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={submitDecision}>Record decision</Button>
                <Button variant="ghost" size="sm" onClick={() => setChosenOption(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
