import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ConfidenceBadge,
  CriticalityTag,
  DecisionStateTag,
  Panel,
  SectionTitle,
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

  const recorded = decisions.find((d) => d.engagementId === id);

  const gaps = useMemo(
    () => engagement?.evidence.filter((e) => e.confidence !== "Verified") ?? [],
    [engagement],
  );

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
      evidenceCited: engagement.evidence.filter((e) => e.confidence === "Verified").slice(0, 3).map((e) => e.source),
    });
    toast({ title: "Decision recorded", description: "Owner, rationale and evidence were saved to the record." });
  };

  return (
    <AppLayout width="wide">
      <div className="space-y-7 pb-10">
        {/* Situation ------------------------------------------------ */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Decisions
          </Link>

          <div className="mt-3 flex items-start justify-between gap-10 border-b border-border pb-5">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {engagement.reference} · {engagement.type}
                </p>
                <CriticalityTag value={engagement.criticality} />
                <DecisionStateTag value={recorded ? "Decision recorded" : engagement.decisionState} />
              </div>
              <h1 className="mt-1.5 font-heading text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                {engagement.title}
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {engagement.supplier} · owner {engagement.owner}, {engagement.ownerRole} ·{" "}
                {engagement.costCentre}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground/85">{engagement.situation}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85">
                <span className="font-medium">Why it matters.</span> {engagement.whyItMatters}
              </p>
              {matchedRules.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Raised by:</span>
                  {matchedRules.map((r) => (
                    <Link key={r.id} to="/rules">
                      <Tag tone="primary">{r.name}</Tag>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <dl className="w-[260px] shrink-0 space-y-2.5 rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Notice deadline</dt>
                <dd className={cn("text-[13px] font-semibold", days <= 100 ? "text-destructive" : "text-foreground")}>
                  {shortDate(engagement.noticeDeadline)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Days remaining</dt>
                <dd className="text-[13px] font-semibold text-foreground">{days}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Contract expiry</dt>
                <dd className="text-[13px] text-foreground">{shortDate(engagement.contractExpiry)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Renewal</dt>
                <dd className="text-[13px] text-foreground">
                  {engagement.autoRenews ? "Automatic" : "Requires new agreement"}
                </dd>
              </div>
              <div className="border-t border-border pt-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[12px] text-muted-foreground">Committed per year</dt>
                  <dd className="text-[13px] font-semibold text-foreground">{eur(engagement.committedAnnual)}</dd>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-3">
                  <dt className="text-[12px] text-muted-foreground">Invoiced to date</dt>
                  <dd className="text-[13px] text-foreground">{eur(engagement.spendToDate)}</dd>
                </div>
                {engagement.rate && (
                  <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <dt className="text-[12px] text-muted-foreground">Rate</dt>
                    <dd className="text-[13px] text-foreground">
                      €{engagement.rate}/h{" "}
                      {engagement.benchmarkRate && (
                        <span className="text-muted-foreground">vs €{engagement.benchmarkRate} median</span>
                      )}
                    </dd>
                  </div>
                )}
              </div>
            </dl>
          </div>
        </div>

        {/* What is missing ----------------------------------------- */}
        {gaps.length > 0 && (
          <Panel className="border-warning/40 bg-warning/[0.06] px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <h2 className="font-heading text-[13px] font-semibold text-foreground">
                  {gaps.length} facts are not fully reliable
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-foreground/80">
                  Prepared before this review: {gaps.map((g) => `${g.label} (${g.confidence.toLowerCase()})`).join(", ")}.
                  Each one can be corrected below, and corrections update the options and the record.
                </p>
              </div>
            </div>
          </Panel>
        )}

        {/* Evidence ------------------------------------------------- */}
        <section>
          <SectionTitle
            title="What we know"
            hint="Grouped by the people who hold the context. Every fact shows its source, date and limits."
            right={
              <div className="flex items-center gap-1">
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
            }
          />

          <div className="grid grid-cols-2 gap-3">
            {evidence.map((ev) => (
              <Panel key={ev.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                      {ev.lens} · {lensOwner[ev.lens]}
                    </p>
                    <h3 className="mt-1 font-heading text-[13px] font-semibold text-foreground">{ev.label}</h3>
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
                        <label className="block text-[11px] font-medium text-foreground">Corrected value</label>
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
              </Panel>
            ))}
          </div>

          {engagement.openQuestions.length > 0 && (
            <Panel className="mt-3 px-5 py-4">
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
            </Panel>
          )}
        </section>

        {/* Options -------------------------------------------------- */}
        {engagement.options.length > 0 && (
          <section>
            <SectionTitle
              title="Options"
              hint="Effects are shown separately so commercial gain is never read as a delivery outcome."
            />
            <Panel className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-sunken text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <tr>
                    <th className="w-8 px-4 py-2.5" />
                    <th className="px-2 py-2.5 font-medium">Option</th>
                    <th className="px-3 py-2.5 font-medium">Commercial</th>
                    <th className="px-3 py-2.5 font-medium">Delivery</th>
                    <th className="px-3 py-2.5 font-medium">Risk</th>
                    <th className="px-3 py-2.5 text-right font-medium">Annual effect</th>
                    <th className="px-4 py-2.5 font-medium">Effort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {engagement.options.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => !recorded && setChosenOption(o.id)}
                      className={cn(
                        "align-top transition-colors",
                        !recorded && "cursor-pointer hover:bg-surface-sunken",
                        chosenOption === o.id && "bg-primary/[0.05]",
                      )}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            chosenOption === o.id ? "border-primary bg-primary" : "border-border",
                          )}
                        >
                          {chosenOption === o.id && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">{o.title}</span>
                          {o.recommended && <Tag tone="primary">Prepared suggestion</Tag>}
                        </div>
                        <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
                          {o.summary}
                        </p>
                      </td>
                      <td className="max-w-[200px] px-3 py-3 text-[12px] leading-relaxed text-foreground/80">
                        {o.commercialEffect}
                      </td>
                      <td className="max-w-[200px] px-3 py-3 text-[12px] leading-relaxed text-foreground/80">
                        {o.deliveryEffect}
                      </td>
                      <td className="max-w-[200px] px-3 py-3 text-[12px] leading-relaxed text-foreground/80">
                        {o.riskEffect}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-right text-[13px] font-semibold",
                          o.annualDelta < 0 ? "text-success" : o.annualDelta > 0 ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {o.annualDelta === 0 ? "No change" : eur(Math.abs(o.annualDelta))}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {o.annualDelta < 0 ? "lower cost" : o.annualDelta > 0 ? "added cost" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">{o.effort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
            <p className="mt-2 text-[11px] text-muted-foreground">
              A suggestion is prepared work, not an approval. Business need, budget, commercial terms and risk
              acceptance stay with named people.
            </p>
          </section>
        )}

        {/* Contributions and tools --------------------------------- */}
        <section className="grid grid-cols-[1.4fr_1fr] gap-4">
          <div>
            <SectionTitle title="Contributions" hint="Specialist input this decision depends on." />
            <Panel className="divide-y divide-border">
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
            </Panel>
          </div>

          <div>
            <SectionTitle title="Add a tool" hint="Bring an assessment into this decision." />
            <Panel className="px-4 py-3.5">
              <ul className="space-y-2">
                {[
                  "Knowledge transfer assessment",
                  "Rate comparison against benchmark",
                  "Exit and transition readiness",
                  "SOW assumption review",
                ].map((tool) => {
                  const added = addedTools.includes(tool);
                  return (
                    <li key={tool} className="flex items-center justify-between gap-3">
                      <span className="text-[12px] text-foreground/85">{tool}</span>
                      <button
                        onClick={() =>
                          setAddedTools((prev) => (added ? prev.filter((t) => t !== tool) : [...prev, tool]))
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
              {addedTools.length > 0 && (
                <p className="mt-3 border-t border-dashed border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {addedTools.length} assessment{addedTools.length > 1 ? "s" : ""} attached to this decision. Their
                  results will be saved alongside the recorded outcome.
                </p>
              )}
            </Panel>
          </div>
        </section>

        {/* Decision ------------------------------------------------- */}
        <section>
          <SectionTitle title="Record the decision" hint="A person decides. The rationale and conditions are kept." />
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
                  Choose an option above to record a decision.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13px] text-foreground">
                    Recording: <span className="font-semibold">{option.title}</span>
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
                      rows={3}
                      placeholder="Why this option, on which evidence, and what was traded off"
                      className="w-full rounded border border-input bg-card px-3 py-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        </section>
      </div>
    </AppLayout>
  );
}
