import {
  Pencil,
  Send,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Star,
  Target,
  ListChecks,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RFQData } from "./AISourcingChat";

interface RFQCardProps {
  data: RFQData;
}

export function RFQCard({ data }: RFQCardProps) {
  const isOutcome = data.engagementModel === "outcome";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-sunken/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isOutcome ? "Statement of Work Draft" : "RFQ Draft"}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
              isOutcome ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
            )}
          >
            {isOutcome ? <Target className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
            {isOutcome ? "Outcome-based" : "Time & materials"}
          </span>
        </div>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5">
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-px bg-border/40">
        {isOutcome ? (
          <>
            <Field icon={Target} label="Outcome" value={data.role} />
            <Field icon={ShieldCheck} label="Complexity" value={data.seniority} />
            <Field icon={CalendarClock} label="Timeline" value={data.duration} />
            <Field icon={MapPin} label="Delivery Mode" value={data.location} />
            <Field
              icon={DollarSign}
              label="Fixed-Price Budget"
              value={data.rateRange}
              className="col-span-2"
            />
          </>
        ) : (
          <>
            <Field icon={Briefcase} label="Role" value={data.role} />
            <Field icon={Star} label="Seniority" value={data.seniority} />
            <Field icon={Clock} label="Duration" value={data.duration} />
            <Field icon={MapPin} label="Location" value={data.location} />
            <Field
              icon={DollarSign}
              label="Rate Range"
              value={data.rateRange}
              className="col-span-2"
            />
          </>
        )}
      </div>

      {/* Outcome-specific: deliverables & milestones */}
      {isOutcome && (
        <>
          {data.deliverables && data.deliverables.length > 0 && (
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <ListChecks className="h-3 w-3" />
                Deliverables & Acceptance Criteria
              </p>
              <ul className="space-y-1.5">
                {data.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-[12.5px] text-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.milestones && data.milestones.length > 0 && (
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Milestone Payment Plan
              </p>
              <div className="space-y-1.5">
                {data.milestones.map((m, i) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between rounded-lg bg-surface-sunken/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="text-[12.5px] font-medium text-foreground">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{m.due}</span>
                      <span className="font-semibold text-foreground">{m.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Suggested vendors */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Top Vendor Matches
        </p>
        <div className="space-y-2">
          {data.vendors.map((v) => (
            <div
              key={v.name}
              className="flex items-center justify-between rounded-lg bg-surface-sunken/50 px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                  {v.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="block text-[12.5px] font-medium text-foreground">{v.name}</span>
                  {v.deliveryNote && (
                    <span className="block text-[10.5px] text-muted-foreground">
                      {v.deliveryNote}
                    </span>
                  )}
                </div>
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
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Send className="h-3.5 w-3.5" />
          {isOutcome ? "Request Fixed-Price Proposals" : "Send to Vendors"}
        </button>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-card px-4 py-2.5", className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}
