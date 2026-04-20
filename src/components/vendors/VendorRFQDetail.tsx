import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Star,
  User,
  Upload,
  CheckCircle2,
  Sparkles,
  Send,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";

interface Candidate {
  name: string;
  title: string;
  experience: string;
  matchScore: number;
  suggestedRate: string;
  skills: string[];
  aiSuggested: boolean;
}

const rfqDetails = {
  role: "DevOps Engineer",
  seniority: "Mid-Senior",
  location: "Stockholm, SE",
  duration: "6 months",
  deadline: "3 days remaining",
  requirements: [
    "5+ years DevOps / SRE experience",
    "AWS & Kubernetes expertise required",
    "CI/CD pipeline design (GitHub Actions, GitLab CI)",
    "Infrastructure-as-Code (Terraform preferred)",
    "On-site 2 days/week in Stockholm",
  ],
  rateGuidance: "$95–$115/hr",
  marketMedian: "$107/hr",
  matchScore: 94,
};

const suggestedCandidates: Candidate[] = [
  {
    name: "Erik Lindström",
    title: "Senior DevOps Engineer",
    experience: "8 years",
    matchScore: 96,
    suggestedRate: "$105/hr",
    skills: ["AWS", "Kubernetes", "Terraform", "GitHub Actions"],
    aiSuggested: true,
  },
  {
    name: "Anna Bergqvist",
    title: "DevOps Engineer",
    experience: "5 years",
    matchScore: 88,
    suggestedRate: "$95/hr",
    skills: ["AWS", "Docker", "GitLab CI", "Ansible"],
    aiSuggested: true,
  },
  {
    name: "Jonas Eriksson",
    title: "Cloud Platform Engineer",
    experience: "6 years",
    matchScore: 82,
    suggestedRate: "$100/hr",
    skills: ["GCP", "Kubernetes", "Terraform", "Jenkins"],
    aiSuggested: false,
  },
];

interface Props {
  rfqId: string;
}

export function VendorRFQDetail({ rfqId }: Props) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { addProposal, logAction } = useMockStore();

  const handleSubmit = () => {
    if (!selectedCandidate) return;
    const cand = suggestedCandidates.find((c) => c.name === selectedCandidate);
    if (!cand) return;
    const rateNum = parseInt(cand.suggestedRate.replace(/\D/g, ""));
    addProposal({
      id: `vendor-prop-${Date.now()}`,
      rfqId,
      vendor: "NordOps AB",
      initials: "NO",
      rate: cand.suggestedRate,
      rateNum,
      candidate: cand.name,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    logAction({
      type: "submission",
      actor: "NordOps AB",
      actorType: "vendor",
      summary: `Proposal submitted: ${cand.name} for ${rfqDetails.role} at ${cand.suggestedRate}`,
      vendor: "NordOps AB",
      inputData: [
        { label: "RFQ", value: rfqId },
        { label: "Candidate", value: cand.name },
        { label: "Proposed Rate", value: cand.suggestedRate },
        { label: "Skills", value: cand.skills.join(", ") },
        { label: "Match Score", value: `${cand.matchScore}%` },
      ],
      aiReasoning: `One-click vendor proposal. Candidate ${cand.name} pre-matched by AI based on skill overlap and rate-card alignment. Submission auto-validated against RFQ requirements.`,
      decision: "Submission accepted",
      decisionStatus: "approved",
    });
    toast.success("Proposal submitted!", {
      description: `${cand.name} forwarded to the buyer for evaluation.`,
    });
    setSubmitted(true);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* Left: RFQ requirements + candidate selection */}
      <div className="space-y-5">
        {/* Requirements card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-border bg-card shadow-card"
        >
          <div className="flex items-start justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                {rfqDetails.role}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{rfqDetails.seniority}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rfqDetails.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rfqDetails.duration}</span>
              </div>
            </div>
            <div className={cn(
              "flex flex-col items-center rounded-lg px-3 py-1.5",
              rfqDetails.matchScore >= 90 ? "bg-success/10" : "bg-primary/10"
            )}>
              <span className={cn(
                "text-[16px] font-bold",
                rfqDetails.matchScore >= 90 ? "text-success" : "text-primary"
              )}>{rfqDetails.matchScore}</span>
              <span className="text-[9px] font-medium uppercase text-muted-foreground">Your match</span>
            </div>
          </div>

          <div className="px-5 py-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Requirements</p>
            <ul className="space-y-1.5">
              {rfqDetails.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2 text-[12.5px] text-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-px border-t border-border bg-border/40">
            <div className="bg-card px-4 py-3">
              <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <DollarSign className="h-3 w-3" />Rate Guidance
              </div>
              <p className="mt-0.5 text-[13px] font-semibold text-foreground">{rfqDetails.rateGuidance}</p>
            </div>
            <div className="bg-card px-4 py-3">
              <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <Star className="h-3 w-3" />Market Median
              </div>
              <p className="mt-0.5 text-[13px] font-semibold text-foreground">{rfqDetails.marketMedian}</p>
            </div>
            <div className="bg-card px-4 py-3">
              <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3 w-3" />Deadline
              </div>
              <p className="mt-0.5 text-[13px] font-semibold text-destructive">{rfqDetails.deadline}</p>
            </div>
          </div>
        </motion.div>

        {/* AI suggested candidates */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-xl border border-border bg-card shadow-card"
        >
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground">Suggested Candidates</h2>
              <p className="text-[11px] text-muted-foreground">AI-matched from your talent pool</p>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {suggestedCandidates.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.2 + i * 0.06 }}
                onClick={() => setSelectedCandidate(selectedCandidate === c.name ? null : c.name)}
                className={cn(
                  "cursor-pointer px-5 py-3.5 transition-colors hover:bg-surface-sunken/50",
                  selectedCandidate === c.name && "bg-primary/[0.03]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">{c.name}</span>
                      {c.aiSuggested && (
                        <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          <Sparkles className="h-2.5 w-2.5" />AI Pick
                        </span>
                      )}
                      <span className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        c.matchScore >= 90 ? "bg-success/10 text-success" : c.matchScore >= 85 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                      )}>{c.matchScore}% match</span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground">{c.title} · {c.experience}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.skills.map((s) => (
                        <span key={s} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{s}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Suggested rate: <strong className="text-foreground">{c.suggestedRate}</strong></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(c.name);
                        }}
                        className={cn(
                          "rounded-md px-3 py-1 text-[11px] font-semibold transition-colors",
                          selectedCandidate === c.name
                            ? "bg-success/10 text-success"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {selectedCandidate === c.name ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upload custom candidate */}
          <div className="border-t border-border px-5 py-3.5">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <Upload className="h-4 w-4" />
              Upload Custom Candidate
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right: Proposal preview + submit */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="h-fit space-y-4"
      >
        {/* Proposal preview */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="font-heading text-sm font-semibold text-foreground">Proposal Preview</h2>
            <p className="text-[11px] text-muted-foreground">Auto-filled from your selection</p>
          </div>
          <div className="space-y-3 px-5 py-4">
            <ProposalField label="RFQ" value={rfqDetails.role + " — " + rfqDetails.location} />
            <ProposalField
              label="Candidate"
              value={selectedCandidate || "Select a candidate above"}
              muted={!selectedCandidate}
            />
            <ProposalField
              label="Proposed Rate"
              value={selectedCandidate
                ? suggestedCandidates.find((c) => c.name === selectedCandidate)?.suggestedRate || "—"
                : "—"}
              editable
              muted={!selectedCandidate}
            />
            <ProposalField label="Duration" value={rfqDetails.duration} />
            <ProposalField label="Start" value="Immediate" editable />
          </div>

          <div className="border-t border-border px-5 py-4">
            {submitted ? (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 py-3 text-[13px] font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                Proposal Submitted!
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!selectedCandidate}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[13px] font-semibold transition-colors",
                  selectedCandidate
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4" />
                Submit Proposal
              </button>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-border bg-surface-sunken/50 px-5 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            💡 Tips to Win
          </p>
          <ul className="space-y-1.5 text-[12px] text-muted-foreground">
            <li>• Rate within guidance range increases win rate by 35%</li>
            <li>• Candidates with matching tech stack score 2× higher</li>
            <li>• Faster responses have 60% higher selection rate</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

function ProposalField({
  label,
  value,
  editable,
  muted,
}: {
  label: string;
  value: string;
  editable?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-[13px] font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
          {value}
        </span>
        {editable && !muted && (
          <button className="rounded px-1 py-0.5 text-[10px] text-primary hover:bg-primary/5">Edit</button>
        )}
      </div>
    </div>
  );
}
