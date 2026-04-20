import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { RateRow } from "@/lib/mock-store";
import { Brain, AlertTriangle, TrendingUp, MapPin, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  row: RateRow | null;
  onClose: () => void;
}

export function RateInsightDrawer({ row, onClose }: Props) {
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {row && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-heading text-base">
                {row.flagged && <AlertTriangle className="h-4 w-4 text-destructive" />}
                {row.role}
              </SheetTitle>
              <p className="text-[12px] text-muted-foreground">
                {row.seniority} · {row.geography} · {row.vendor}
              </p>
            </SheetHeader>

            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border">
              <div className="bg-card p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor Rate</p>
                <p className="mt-1 font-mono text-lg font-semibold text-foreground">${row.vendorRate}/hr</p>
              </div>
              <div className="bg-card p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Market Median</p>
                <p className="mt-1 font-mono text-lg font-semibold text-foreground">${row.marketMedian}/hr</p>
              </div>
              <div className="col-span-2 bg-card p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Variance</p>
                <p
                  className={cn(
                    "mt-1 font-mono text-lg font-semibold",
                    Math.abs(row.variance) > 15 && row.variance > 0 && "text-destructive",
                    row.variance > 0 && Math.abs(row.variance) <= 15 && "text-warning",
                    row.variance <= 0 && "text-success"
                  )}
                >
                  {row.variance > 0 ? "+" : ""}
                  {row.variance.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-border bg-surface-sunken/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">AI Reasoning</p>
              </div>
              <p className="text-[13px] leading-relaxed text-foreground">
                {row.flagged ? (
                  <>
                    The proposed rate of <strong>${row.vendorRate}/hr</strong> exceeds the market median by{" "}
                    <strong>{row.variance.toFixed(1)}%</strong>, crossing the 15% leakage threshold. Comparable{" "}
                    {row.seniority} {row.role} engagements in {row.geography} typically range from $
                    {Math.round(row.marketMedian * 0.92)}–${Math.round(row.marketMedian * 1.08)}/hr. Recommend
                    renegotiation or sourcing alternative vendors.
                  </>
                ) : (
                  <>
                    Rate is within normal market range ({row.variance > 0 ? "+" : ""}
                    {row.variance.toFixed(1)}% from median). No action required.
                  </>
                )}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <Meta icon={Briefcase} label="Role" value={`${row.seniority} ${row.role}`} />
              <Meta icon={MapPin} label="Geography" value={row.geography} />
              <Meta icon={Building2} label="Vendor" value={row.vendor} />
              <Meta icon={TrendingUp} label="Annualized impact" value={`~$${Math.round((row.vendorRate - row.marketMedian) * 1800).toLocaleString()}/yr (vs median, FTE)`} />
            </div>

            {row.flagged && (
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-md bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">
                  Open renegotiation
                </button>
                <button className="rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-muted-foreground hover:bg-secondary">
                  Dismiss
                </button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Meta({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}