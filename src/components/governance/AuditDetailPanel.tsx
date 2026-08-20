import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, FileText, GitBranch, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditDetail {
  title: string;
  type: string;
  timestamp: string;
  actor: string;
  inputData: { label: string; value: string }[];
  aiReasoning: string;
  decision: string;
  decisionStatus: "approved" | "pending" | "rejected";
  references: string[];
}

const detailMap: Record<string, AuditDetail> = {
  "1": {
    title: "AI Vendor Recommendation",
    type: "recommendation",
    timestamp: "2026-03-27 09:42",
    actor: "Vendflow AI",
    inputData: [
      { label: "RFQ", value: "RFQ-2026-047" },
      { label: "Role", value: "Senior DevOps Engineer" },
      { label: "Location", value: "Stockholm" },
      { label: "Duration", value: "6 months" },
      { label: "Budget Range", value: "€850–950/day" },
    ],
    aiReasoning: "NordOps AB was selected based on: (1) 94% skill-match score for DevOps roles, (2) historical on-time delivery rate of 97%, (3) competitive rate at €880/day vs market median €910/day, (4) 3 prior successful engagements with Acme Corp in similar roles.",
    decision: "Recommended NordOps AB as primary vendor",
    decisionStatus: "approved",
    references: ["Rate Intelligence Report Q1-2026", "Vendor Performance Index", "Historical Engagement Data"],
  },
  "4": {
    title: "Rate Anomaly Detection",
    type: "flag",
    timestamp: "2026-03-26 16:30",
    actor: "Vendflow AI",
    inputData: [
      { label: "Vendor", value: "TechFlow Nordic" },
      { label: "Role", value: "Senior Backend Engineer" },
      { label: "Vendor Rate", value: "€1,120/day" },
      { label: "Market Median", value: "€918/day" },
      { label: "Deviation", value: "+22%" },
    ],
    aiReasoning: "TechFlow's proposed rate for Senior Backend Engineers exceeds market median by 22%. This exceeds the 15% threshold. Historical data shows TechFlow has been 8-12% above market in prior quarters — this represents a significant escalation. No justification factors (certifications, clearance) detected.",
    decision: "Flagged for procurement review",
    decisionStatus: "pending",
    references: ["Market Rate Database 2026", "TechFlow Contract History", "Rate Leakage Policy v2.1"],
  },
  "7": {
    title: "Rate Card Update Approval",
    type: "approval",
    timestamp: "2026-03-25 15:22",
    actor: "Anna Karlsson",
    inputData: [
      { label: "Vendor", value: "NordOps AB" },
      { label: "Affected Roles", value: "3 (DevOps, Backend, Frontend)" },
      { label: "Avg Change", value: "+4.2%" },
      { label: "Effective Date", value: "2026-04-01" },
    ],
    aiReasoning: "Rate increases are within acceptable market adjustment range (< 5%). Market data confirms a 3.8% YoY increase for comparable roles in the Nordics. Recommend approval with annual review clause.",
    decision: "Awaiting human approval",
    decisionStatus: "pending",
    references: ["Nordic IT Rate Benchmark 2026", "NordOps Master Agreement", "Procurement Policy 4.3"],
  },
};

const fallback: AuditDetail = {
  title: "Event Detail",
  type: "general",
  timestamp: "—",
  actor: "—",
  inputData: [{ label: "Info", value: "Select an event from the timeline to see full audit details." }],
  aiReasoning: "No AI reasoning data available for this event.",
  decision: "—",
  decisionStatus: "approved",
  references: [],
};

interface Props {
  eventId: string | null;
}

export function AuditDetailPanel({ eventId }: Props) {
  if (!eventId) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex h-64 items-center justify-center p-6">
          <div className="text-center">
            <Shield className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Select an event to view audit details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const detail = detailMap[eventId] || fallback;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">{detail.title}</CardTitle>
          <Badge
            className={
              detail.decisionStatus === "approved"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : detail.decisionStatus === "pending"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {detail.decisionStatus}
          </Badge>
        </div>
        <p className="text-[12px] text-muted-foreground">{detail.timestamp} · {detail.actor}</p>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {/* Input Data */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            <Database className="h-3 w-3" /> Input Data
          </div>
          <div className="space-y-1.5">
            {detail.inputData.map((d) => (
              <div key={d.label} className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reasoning */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            <Brain className="h-3 w-3" /> AI Reasoning
          </div>
          <p className="rounded-md bg-muted/50 p-3 text-[13px] leading-relaxed text-foreground">{detail.aiReasoning}</p>
        </div>

        {/* Decision */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            <GitBranch className="h-3 w-3" /> Decision
          </div>
          <p className="text-[13px] font-medium text-foreground">{detail.decision}</p>
        </div>

        {/* References */}
        {detail.references.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3 w-3" /> References
            </div>
            <ul className="space-y-1">
              {detail.references.map((r) => (
                <li key={r} className="text-[12px] text-primary hover:underline cursor-pointer">• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {detail.decisionStatus === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 text-xs">Approve</Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs">Reject</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
