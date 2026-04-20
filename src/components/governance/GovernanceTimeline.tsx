import { cn } from "@/lib/utils";
import { Brain, UserCheck, Send, AlertTriangle, CheckCircle2, ShieldAlert, FileUp, Inbox, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMockStore, type AuditEvent } from "@/lib/mock-store";
import { motion, AnimatePresence } from "framer-motion";

const typeConfig: Record<string, { icon: typeof Brain; color: string; label: string }> = {
  recommendation: { icon: Brain, color: "text-primary", label: "AI Recommendation" },
  approval: { icon: UserCheck, color: "text-emerald-500", label: "Human Approval" },
  dispatch: { icon: Send, color: "text-blue-500", label: "RFQ Dispatch" },
  flag: { icon: AlertTriangle, color: "text-amber-500", label: "Anomaly Flag" },
  override: { icon: ShieldAlert, color: "text-orange-500", label: "Human Override" },
  ingest: { icon: FileUp, color: "text-cyan-500", label: "Document Ingest" },
  submission: { icon: Inbox, color: "text-violet-500", label: "Vendor Submission" },
  award: { icon: Gavel, color: "text-emerald-600", label: "Contract Award" },
};

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  filterUser?: string;
  filterAction?: string;
  filterVendor?: string;
  search?: string;
}

export function GovernanceTimeline({ selectedId, onSelect, filterUser = "all", filterAction = "all", filterVendor = "all", search = "" }: Props) {
  const events = useMockStore((s) => s.auditLog);

  const filtered = events.filter((ev) => {
    if (filterAction !== "all" && ev.type !== filterAction) return false;
    if (filterUser === "system" && ev.actorType !== "ai" && ev.actorType !== "system") return false;
    if (filterUser === "anna" && !ev.actor.toLowerCase().includes("anna")) return false;
    if (filterUser === "erik" && !ev.actor.toLowerCase().includes("erik")) return false;
    if (filterVendor !== "all" && !ev.vendor?.toLowerCase().includes(filterVendor.toLowerCase())) return false;
    if (search && !ev.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-[12.5px] text-muted-foreground">
        No audit entries match your filters.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      <AnimatePresence initial={false}>
      {filtered.map((ev) => {
        const cfg = typeConfig[ev.type];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const selected = selectedId === ev.id;
        const requiresApproval = ev.decisionStatus === "pending" && (ev.type === "approval" || ev.type === "flag" || ev.type === "ingest");
        return (
          <motion.button
            layout
            key={ev.id}
            initial={ev.isNew ? { backgroundColor: "hsl(var(--primary) / 0.12)" } : { backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0)" }}
            transition={{ duration: 2.5 }}
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
                {ev.isNew && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">New</Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{ev.timestamp}</span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground">{ev.actor}</span>
                {requiresApproval && (
                  <Badge className="ml-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">Pending</Badge>
                )}
                {ev.type === "override" && (
                  <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 border-orange-500/30 text-orange-500">Override</Badge>
                )}
                {ev.type === "award" && (
                  <Badge className="ml-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0">Awarded</Badge>
                )}
              </div>
            </div>
            <CheckCircle2 className={cn("mt-1 h-4 w-4 shrink-0 transition-opacity", selected ? "text-primary opacity-100" : "opacity-0")} />
          </motion.button>
        );
      })}
      </AnimatePresence>
    </div>
  );
}
