import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const stages = [
  "Reading workbook…",
  "Detecting columns (Role, Seniority, Geo, Rate)…",
  "Normalizing 247 rows…",
  "Cross-referencing market benchmarks…",
  "Detecting rate leakage…",
];

export function BulkImportModal({ open, onClose }: Props) {
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [done, setDone] = useState(false);
  const { addRates, logAction } = useMockStore();

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setStageIdx(0);
      setDone(false);
      return;
    }
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4);
        const idx = Math.min(stages.length - 1, Math.floor(next / 22));
        setStageIdx(idx);
        if (next >= 100) {
          clearInterval(id);
          setDone(true);
          // Add a few synthetic rates
          const newRates = [
            { id: `bulk-${Date.now()}-1`, role: "Cloud Engineer", seniority: "Senior", geography: "Oslo", vendor: "NordCloud AS", vendorRate: 142, marketMedian: 120, variance: 18.3, flagged: true },
            { id: `bulk-${Date.now()}-2`, role: "Mobile Developer", seniority: "Mid", geography: "Tallinn", vendor: "BalticDev OÜ", vendorRate: 65, marketMedian: 72, variance: -9.7, flagged: false },
            { id: `bulk-${Date.now()}-3`, role: "Tech Lead", seniority: "Senior", geography: "Stockholm", vendor: "TechCorp Nordic", vendorRate: 195, marketMedian: 160, variance: 21.9, flagged: true },
          ];
          addRates(newRates);
          logAction({
            type: "ingest",
            actor: "Vendflow AI",
            actorType: "ai",
            summary: "Bulk import: 247 historical rates normalized · 14 anomalies flagged",
            inputData: [
              { label: "File", value: "historical_spend_2025.xlsx" },
              { label: "Rows processed", value: "247" },
              { label: "Anomalies flagged", value: "14" },
              { label: "Identified savings", value: "$487,000/yr" },
            ],
            aiReasoning: "Hybrid RAG pipeline normalized rate data across 7 columns. Identified 14 roles with >15% deviation from regional market medians. Aggregated savings opportunity estimated at $487K annually.",
            decision: "Bulk normalization complete",
            decisionStatus: "approved",
          });
          toast.success("Bulk import complete", {
            description: "247 rates normalized · 14 anomalies flagged · $487K savings identified",
          });
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [open, addRates, logAction]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk CSV / Excel Import
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 rounded-lg border border-border bg-surface-sunken/40 p-4">
          <p className="text-[12.5px] text-foreground">historical_spend_2025.xlsx</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">2.4 MB · 247 rows detected</p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-[12.5px]">
            {done ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            <span className="text-foreground">{done ? "Done" : stages[stageIdx]}</span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {done && (
          <div className="mt-4 space-y-2 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Normalization complete
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Rows" value="247" />
              <Stat label="Flagged" value="14" tone="warning" />
              <Stat label="Savings" value="$487K" tone="success" />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {done ? "View results" : "Cancel"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warning" | "success" }) {
  return (
    <div className="rounded-md bg-card p-2">
      <p className={`font-mono text-sm font-bold ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}