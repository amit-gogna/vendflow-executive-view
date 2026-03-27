import { cn } from "@/lib/utils";
import { Brain, UserCheck, Send, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "recommendation" | "approval" | "dispatch" | "flag" | "override";
  actor: string;
  actorType: "ai" | "human";
  summary: string;
  requiresApproval?: boolean;
  status?: "pending" | "approved" | "rejected";
}

const events: TimelineEvent[] = [
  { id: "1", timestamp: "2026-03-27 09:42", type: "recommendation", actor: "Vendflow AI", actorType: "ai", summary: "Recommended NordOps AB for Senior DevOps RFQ (Match: 94%)" },
  { id: "2", timestamp: "2026-03-27 09:45", type: "approval", actor: "Anna Karlsson", actorType: "human", summary: "Approved RFQ dispatch to NordOps AB", requiresApproval: true, status: "approved" },
  { id: "3", timestamp: "2026-03-27 10:12", type: "dispatch", actor: "System", actorType: "ai", summary: "RFQ-2026-047 sent to 3 vendors (NordOps, TechFlow, CodeCraft)" },
  { id: "4", timestamp: "2026-03-26 16:30", type: "flag", actor: "Vendflow AI", actorType: "ai", summary: "Rate anomaly detected: TechFlow Senior Backend +22% vs market" },
  { id: "5", timestamp: "2026-03-26 14:15", type: "recommendation", actor: "Vendflow AI", actorType: "ai", summary: "Auto-ranked proposals for RFQ-2026-044. Top pick: NordOps AB" },
  { id: "6", timestamp: "2026-03-26 11:00", type: "override", actor: "Erik Lindqvist", actorType: "human", summary: "Overrode AI recommendation — selected CodeCraft Solutions for compliance reasons", requiresApproval: true, status: "approved" },
  { id: "7", timestamp: "2026-03-25 15:22", type: "approval", actor: "Anna Karlsson", actorType: "human", summary: "Pending: Approve rate card update for NordOps AB (3 roles affected)", requiresApproval: true, status: "pending" },
  { id: "8", timestamp: "2026-03-25 09:05", type: "flag", actor: "Vendflow AI", actorType: "ai", summary: "Vendor reliability alert: CodeCraft response time degraded by 40%" },
];

const typeConfig: Record<string, { icon: typeof Brain; color: string; label: string }> = {
  recommendation: { icon: Brain, color: "text-primary", label: "AI Recommendation" },
  approval: { icon: UserCheck, color: "text-emerald-500", label: "Human Approval" },
  dispatch: { icon: Send, color: "text-blue-500", label: "RFQ Dispatch" },
  flag: { icon: AlertTriangle, color: "text-amber-500", label: "Anomaly Flag" },
  override: { icon: ShieldAlert, color: "text-orange-500", label: "Human Override" },
};

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function GovernanceTimeline({ selectedId, onSelect }: Props) {
  return (
    <div className="divide-y divide-border">
      {events.map((ev) => {
        const cfg = typeConfig[ev.type];
        const Icon = cfg.icon;
        const selected = selectedId === ev.id;
        return (
          <button
            key={ev.id}
            onClick={() => onSelect(ev.id)}
            className={cn(
              "flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50",
              selected && "bg-muted/70"
            )}
          >
            <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted", cfg.color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-foreground">{ev.summary}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{ev.timestamp}</span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground">{ev.actor}</span>
                {ev.requiresApproval && ev.status === "pending" && (
                  <Badge className="ml-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">Pending</Badge>
                )}
                {ev.type === "override" && (
                  <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 border-orange-500/30 text-orange-500">Override</Badge>
                )}
              </div>
            </div>
            <CheckCircle2 className={cn("mt-1 h-4 w-4 shrink-0 transition-opacity", selected ? "text-primary opacity-100" : "opacity-0")} />
          </button>
        );
      })}
    </div>
  );
}
