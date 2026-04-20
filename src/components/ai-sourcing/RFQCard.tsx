import { Pencil, Send, MapPin, Clock, DollarSign, Briefcase, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RFQData } from "./AISourcingChat";
import { useState } from "react";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";

interface RFQCardProps {
  data: RFQData;
}

export function RFQCard({ data }: RFQCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RFQData>(data);
  const [sent, setSent] = useState(false);
  const { addRFQ, addProposal, logAction } = useMockStore();

  const update = (k: keyof RFQData, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSend = () => {
    const rfqId = `RFQ-${Math.floor(Math.random() * 9000 + 1000)}`;
    addRFQ({
      id: rfqId,
      title: `${draft.role} — ${draft.location}`,
      role: draft.role,
      seniority: draft.seniority,
      location: draft.location,
      duration: draft.duration,
      rateRange: draft.rateRange,
      vendors: draft.vendors.map((v) => v.name),
      status: "dispatched",
      createdAt: new Date().toISOString(),
    });

    logAction({
      type: "dispatch",
      actor: "Anna Karlsson",
      actorType: "human",
      summary: `Dispatched ${rfqId} (${draft.role}) to ${draft.vendors.length} vendors`,
      inputData: [
        { label: "RFQ ID", value: rfqId },
        { label: "Role", value: draft.role },
        { label: "Location", value: draft.location },
        { label: "Duration", value: draft.duration },
        { label: "Rate Range", value: draft.rateRange },
        { label: "Vendors", value: draft.vendors.map((v) => v.name).join(", ") },
      ],
      aiReasoning: `RFQ generated from natural-language intake and dispatched to top ${draft.vendors.length} pre-qualified vendors based on match score, capacity, and rate competitiveness.`,
      decision: "RFQ dispatched",
      decisionStatus: "approved",
    });

    // Simulate vendor responses streaming in
    draft.vendors.forEach((v, i) => {
      setTimeout(() => {
        const rateNum = parseInt(v.rate.replace(/\D/g, ""));
        addProposal({
          id: `prop-${rfqId}-${i}`,
          rfqId,
          vendor: v.name,
          initials: v.name.split(" ").map((w) => w[0]).join("").slice(0, 2),
          rate: v.rate,
          rateNum,
          candidate: ["Erik Lindström", "Anna Bergqvist", "Markus Weber"][i] || "Candidate",
          status: "submitted",
          submittedAt: new Date().toISOString(),
        });
        toast(`${v.name} submitted a proposal`, {
          description: `${draft.role} at ${v.rate}`,
        });
      }, 1500 + i * 1200);
    });

    toast.success(`${rfqId} sent to ${draft.vendors.length} vendors`);
    setSent(true);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-sunken/50 px-4 py-2.5">
        <span className="font-heading text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          RFQ Draft
        </span>
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <Pencil className="h-3 w-3" />
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-px bg-border/40">
        <Field icon={Briefcase} label="Role" value={draft.role} editing={editing} onChange={(v) => update("role", v)} />
        <Field icon={Star} label="Seniority" value={draft.seniority} editing={editing} onChange={(v) => update("seniority", v)} />
        <Field icon={Clock} label="Duration" value={draft.duration} editing={editing} onChange={(v) => update("duration", v)} />
        <Field icon={MapPin} label="Location" value={draft.location} editing={editing} onChange={(v) => update("location", v)} />
        <Field icon={DollarSign} label="Rate Range" value={draft.rateRange} editing={editing} onChange={(v) => update("rateRange", v)} className="col-span-2" />
      </div>

      {/* Suggested vendors */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Top Vendor Matches
        </p>
        <div className="space-y-2">
          {draft.vendors.map((v) => (
            <div
              key={v.name}
              className="flex items-center justify-between rounded-lg bg-surface-sunken/50 px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                  {v.name.charAt(0)}
                </div>
                <span className="text-[12.5px] font-medium text-foreground">{v.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">{v.rate}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    v.matchScore >= 90
                      ? "bg-success/10 text-success"
                      : v.matchScore >= 85
                        ? "bg-primary/10 text-primary"
                        : "bg-warning/10 text-warning"
                  )}
                >
                  {v.matchScore}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-border px-4 py-3">
        {sent ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-success/10 py-2.5 text-[13px] font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sent — proposals incoming
          </div>
        ) : (
          <button
            onClick={handleSend}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Send className="h-3.5 w-3.5" />
            Send to Vendors
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  className,
  editing,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
  editing?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className={cn("bg-card px-4 py-2.5", className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="mt-0.5 w-full rounded border border-input bg-background px-1.5 py-0.5 text-[13px] font-medium text-foreground focus:border-primary focus:outline-none"
        />
      ) : (
        <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
      )}
    </div>
  );
}
