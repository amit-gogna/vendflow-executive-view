import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, AlertCircle, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateRow {
  role: string;
  seniority: string;
  geography: string;
  vendorRate: number;
  marketMedian: number;
  variance: number;
  vendor: string;
  flagged: boolean;
}

const sampleData: RateRow[] = [
  { role: "Backend Engineer", seniority: "Senior", geography: "Stockholm", vendorRate: 145, marketMedian: 118, variance: 22.9, vendor: "TechCorp Nordic", flagged: true },
  { role: "DevOps Engineer", seniority: "Mid", geography: "Berlin", vendorRate: 112, marketMedian: 105, variance: 6.7, vendor: "CloudWorks GmbH", flagged: false },
  { role: "Data Scientist", seniority: "Senior", geography: "London", vendorRate: 165, marketMedian: 140, variance: 17.9, vendor: "DataMinds UK", flagged: true },
  { role: "Frontend Engineer", seniority: "Junior", geography: "Warsaw", vendorRate: 58, marketMedian: 62, variance: -6.5, vendor: "SoftHouse PL", flagged: false },
  { role: "QA Engineer", seniority: "Mid", geography: "Lisbon", vendorRate: 72, marketMedian: 70, variance: 2.9, vendor: "QualityFirst PT", flagged: false },
  { role: "Solutions Architect", seniority: "Senior", geography: "Amsterdam", vendorRate: 178, marketMedian: 148, variance: 20.3, vendor: "ArchTech NL", flagged: true },
  { role: "Project Manager", seniority: "Senior", geography: "Copenhagen", vendorRate: 130, marketMedian: 125, variance: 4.0, vendor: "NordManage", flagged: false },
  { role: "Security Engineer", seniority: "Mid", geography: "Helsinki", vendorRate: 125, marketMedian: 108, variance: 15.7, vendor: "SecureNorth", flagged: true },
];

function VarianceBadge({ value, flagged }: { value: number; flagged: boolean }) {
  const isOver = value > 0;
  const isEfficient = value <= 0;
  const isAnomaly = Math.abs(value) > 15;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        isAnomaly && isOver && "bg-destructive/10 text-destructive",
        !isAnomaly && isOver && "bg-warning/10 text-warning",
        isEfficient && "bg-success/10 text-success"
      )}
    >
      {isOver ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export function RateTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      {/* Table header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">Rate Comparison</h2>
          <p className="text-[11px] text-muted-foreground">
            {sampleData.length} roles · {sampleData.filter((r) => r.flagged).length} anomalies detected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Seniority</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Geography</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor Rate</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Market Median</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Variance</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border/60 transition-colors hover:bg-surface-sunken/60",
                  row.flagged && "bg-destructive/[0.02]"
                )}
              >
                <td className="px-5 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {row.flagged && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                    {row.role}
                  </div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{row.seniority}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.geography}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.vendor}</td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-foreground">${row.vendorRate}/hr</td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-muted-foreground">${row.marketMedian}/hr</td>
                <td className="px-5 py-3 text-right">
                  <VarianceBadge value={row.variance} flagged={row.flagged} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
