import { Pencil, Send, MapPin, Clock, DollarSign, Briefcase, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RFQData } from "./AISourcingChat";

interface RFQCardProps {
  data: RFQData;
}

export function RFQCard({ data }: RFQCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-sunken/50 px-4 py-2.5">
        <span className="font-heading text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          RFQ Draft
        </span>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5">
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-px bg-border/40">
        <Field icon={Briefcase} label="Role" value={data.role} />
        <Field icon={Star} label="Seniority" value={data.seniority} />
        <Field icon={Clock} label="Duration" value={data.duration} />
        <Field icon={MapPin} label="Location" value={data.location} />
        <Field icon={DollarSign} label="Rate Range" value={data.rateRange} className="col-span-2" />
      </div>

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
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Send className="h-3.5 w-3.5" />
          Send to Vendors
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
