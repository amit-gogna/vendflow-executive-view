import { motion } from "framer-motion";
import { TrendingDown, AlertTriangle, PiggyBank, Database } from "lucide-react";

const kpis = [
  {
    label: "Avg Rate vs Market",
    value: "+8.4%",
    detail: "Above median",
    icon: TrendingDown,
    sentiment: "negative" as const,
  },
  {
    label: "Rate Leakage",
    value: "4.2%",
    detail: "$312K annual impact",
    icon: AlertTriangle,
    sentiment: "warning" as const,
  },
  {
    label: "Savings Opportunity",
    value: "$487K",
    detail: "Across 14 roles",
    icon: PiggyBank,
    sentiment: "positive" as const,
  },
  {
    label: "Coverage",
    value: "78%",
    detail: "312 of 401 roles analyzed",
    icon: Database,
    sentiment: "neutral" as const,
  },
];

const sentimentStyles = {
  negative: "text-destructive bg-destructive/8",
  warning: "text-warning bg-warning/8",
  positive: "text-success bg-success/8",
  neutral: "text-primary bg-primary/8",
};

export function RateKPIBar() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${sentimentStyles[kpi.sentiment]}`}>
            <kpi.icon className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-0.5 font-heading text-lg font-semibold tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="text-[11px] text-muted-foreground/70">{kpi.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
