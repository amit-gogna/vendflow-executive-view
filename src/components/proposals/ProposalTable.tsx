import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Trophy,
  AlertCircle,
  User,
  MapPin,
  Briefcase,
  Clock,
  Gavel,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockStore } from "@/lib/mock-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Proposal {
  vendor: string;
  initials: string;
  rate: string;
  rateNum: number;
  marketFit: number;
  skillMatch: number;
  reliability: number;
  overallRank: number;
  recommended: boolean;
  flags: string[];
  candidates: Candidate[];
}

interface Candidate {
  name: string;
  role: string;
  experience: string;
  location: string;
  availability: string;
}

const seedProposals: Proposal[] = [
  {
    vendor: "NordOps AB",
    initials: "NO",
    rate: "$98/hr",
    rateNum: 98,
    marketFit: 94,
    skillMatch: 91,
    reliability: 96,
    overallRank: 1,
    recommended: true,
    flags: [],
    candidates: [
      { name: "Erik Lindström", role: "Senior DevOps Engineer", experience: "8 years", location: "Stockholm", availability: "Immediate" },
      { name: "Anna Bergqvist", role: "DevOps Engineer", experience: "5 years", location: "Gothenburg", availability: "2 weeks" },
    ],
  },
  {
    vendor: "CloudWorks GmbH",
    initials: "CW",
    rate: "$105/hr",
    rateNum: 105,
    marketFit: 88,
    skillMatch: 93,
    reliability: 89,
    overallRank: 2,
    recommended: false,
    flags: [],
    candidates: [
      { name: "Markus Weber", role: "Senior Cloud Engineer", experience: "7 years", location: "Berlin", availability: "1 week" },
    ],
  },
  {
    vendor: "TechCorp Nordic",
    initials: "TC",
    rate: "$132/hr",
    rateNum: 132,
    marketFit: 62,
    skillMatch: 85,
    reliability: 74,
    overallRank: 3,
    recommended: false,
    flags: ["20% above market", "Low reliability score"],
    candidates: [
      { name: "Lars Johansson", role: "DevOps Lead", experience: "10 years", location: "Stockholm", availability: "3 weeks" },
      { name: "Sofia Nilsson", role: "Platform Engineer", experience: "4 years", location: "Malmö", availability: "Immediate" },
    ],
  },
];

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            value >= 90 ? "bg-success" : value >= 75 ? "bg-primary" : value >= 60 ? "bg-warning" : "bg-destructive"
          )}
        />
      </div>
      <span className="text-[12px] font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function ExpandedRow({ candidates }: { candidates: Candidate[] }) {
  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <td colSpan={7} className="bg-surface-sunken/40 px-5 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Proposed Candidates
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {candidates.map((c) => (
            <div
              key={c.name}
              className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                <p className="text-[11.5px] text-muted-foreground">{c.role}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/80">
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.experience}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.availability}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </td>
    </motion.tr>
  );
}

export function ProposalTable() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [awardTarget, setAwardTarget] = useState<Proposal | null>(null);
  const [awarded, setAwarded] = useState<string | null>(null);
  const livProposals = useMockStore((s) => s.proposals);
  const logAction = useMockStore((s) => s.logAction);

  // Merge live proposals from sourcing into the table
  const liveAsRows: Proposal[] = livProposals.slice(0, 3).map((p, i) => ({
    vendor: p.vendor,
    initials: p.initials,
    rate: p.rate,
    rateNum: p.rateNum,
    marketFit: 80 + Math.floor(Math.random() * 15),
    skillMatch: 78 + Math.floor(Math.random() * 18),
    reliability: 75 + Math.floor(Math.random() * 20),
    overallRank: seedProposals.length + i + 1,
    recommended: false,
    flags: p.rateNum > 120 ? [`+${Math.round(((p.rateNum - 107) / 107) * 100)}% above market`] : [],
    candidates: [{ name: p.candidate, role: "Engineer", experience: "—", location: "—", availability: "Submitted via portal" }],
  }));

  const proposals = [...seedProposals, ...liveAsRows];

  const confirmAward = () => {
    if (!awardTarget) return;
    setAwarded(awardTarget.vendor);
    logAction({
      type: "award",
      actor: "Anna Karlsson",
      actorType: "human",
      summary: `Contract awarded to ${awardTarget.vendor} at ${awardTarget.rate}`,
      vendor: awardTarget.vendor,
      inputData: [
        { label: "Vendor", value: awardTarget.vendor },
        { label: "Rate", value: awardTarget.rate },
        { label: "Market Fit", value: `${awardTarget.marketFit}/100` },
        { label: "Skill Match", value: `${awardTarget.skillMatch}/100` },
        { label: "Reliability", value: `${awardTarget.reliability}/100` },
      ],
      aiReasoning: `Decision-gate triggered: human approval required to award contract. AI ranked ${awardTarget.vendor} #${awardTarget.overallRank} based on weighted scoring (40% rate fit, 35% skill match, 25% reliability).`,
      decision: `Awarded — ${awardTarget.vendor}`,
      decisionStatus: "approved",
    });
    toast.success(`Contract awarded to ${awardTarget.vendor}`);
    setAwardTarget(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="font-heading text-sm font-semibold text-foreground">Vendor Proposals</h2>
        <p className="text-[11px] text-muted-foreground">
          Click a row to see proposed candidates · Scores out of 100
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rate</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Market Fit</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Skill Match</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reliability</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {proposals.map((p, i) => (
                <>
                  <tr
                    key={p.vendor}
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                    className={cn(
                      "cursor-pointer border-b border-border/60 transition-colors hover:bg-surface-sunken/60",
                      p.recommended && "bg-success/[0.03]",
                      p.flags.length > 0 && "bg-destructive/[0.02]",
                      awarded === p.vendor && "bg-success/[0.06]"
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                          p.recommended ? "bg-success/10 text-success" : "bg-primary/8 text-primary"
                        )}>
                          {p.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">{p.vendor}</span>
                            {p.recommended && <Trophy className="h-3.5 w-3.5 text-success" />}
                            {awarded === p.vendor && (
                              <span className="flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Awarded
                              </span>
                            )}
                          </div>
                          {p.flags.length > 0 && (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {p.flags.map((f) => (
                                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                                  <AlertCircle className="h-2.5 w-2.5" />{f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[12px] text-foreground">{p.rate}</td>
                    <td className="px-3 py-3"><ScoreBar value={p.marketFit} /></td>
                    <td className="px-3 py-3"><ScoreBar value={p.skillMatch} /></td>
                    <td className="px-3 py-3"><ScoreBar value={p.reliability} /></td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                        p.overallRank === 1 ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                      )}>
                        #{p.overallRank}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAwardTarget(p); }}
                          disabled={!!awarded}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                            awarded ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <Gavel className="h-3 w-3" /> Award
                        </button>
                        <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedIdx === i && "rotate-180"
                        )} />
                      </div>
                    </td>
                  </tr>
                  {expandedIdx === i && (
                    <ExpandedRow key={`${p.vendor}-expanded`} candidates={p.candidates} />
                  )}
                </>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>

    <Dialog open={!!awardTarget} onOpenChange={(o) => !o && setAwardTarget(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Decision Gate — Award Contract
          </DialogTitle>
        </DialogHeader>
        {awardTarget && (
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-[12px] text-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>
                This action requires <strong>human approval</strong> per EU AI Act guardrails. The decision will
                be permanently logged in the audit trail.
              </span>
            </div>
            <div className="rounded-lg border border-border bg-surface-sunken/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                You're about to award
              </p>
              <p className="mt-1 text-base font-semibold text-foreground">{awardTarget.vendor}</p>
              <p className="text-[12px] text-muted-foreground">at {awardTarget.rate}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini label="Market Fit" value={awardTarget.marketFit} />
                <Mini label="Skill" value={awardTarget.skillMatch} />
                <Mini label="Reliability" value={awardTarget.reliability} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAwardTarget(null)}
                className="rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmAward}
                className="rounded-md bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Confirm & Log
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-card p-2">
      <p className="font-mono text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
