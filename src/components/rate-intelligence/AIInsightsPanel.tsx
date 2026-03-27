import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  type: "alert" | "opportunity" | "trend";
  text: string;
  impact?: string;
}

const insights: Insight[] = [
  {
    type: "alert",
    text: "TechCorp Nordic is 22% above market for Senior Backend Engineers in Stockholm.",
    impact: "~$48K/yr overspend",
  },
  {
    type: "alert",
    text: "ArchTech NL consistently exceeds median rates across 3 senior roles by 18–20%.",
    impact: "~$67K/yr overspend",
  },
  {
    type: "opportunity",
    text: "Consolidating DevOps roles with CloudWorks GmbH could unlock volume discounts of 8–12%.",
    impact: "$32K potential savings",
  },
  {
    type: "trend",
    text: "Market rates for Security Engineers in Nordics rose 11% YoY — current contracts may need rebenchmarking.",
  },
  {
    type: "opportunity",
    text: "SoftHouse PL rates are 6.5% below market — consider expanding engagement for frontend roles.",
  },
];

const iconMap = {
  alert: AlertTriangle,
  opportunity: Lightbulb,
  trend: TrendingUp,
};

const styleMap = {
  alert: "text-destructive bg-destructive/8",
  opportunity: "text-success bg-success/8",
  trend: "text-primary bg-primary/8",
};

export function AIInsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="h-fit rounded-xl border border-border bg-card shadow-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">AI Insights</h2>
          <p className="text-[11px] text-muted-foreground">Auto-generated from rate analysis</p>
        </div>
      </div>

      {/* Insights list */}
      <div className="divide-y divide-border/60">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.type];
          return (
            <div key={i} className="px-5 py-3.5 transition-colors hover:bg-surface-sunken/50">
              <div className="flex gap-3">
                <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", styleMap[insight.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] leading-relaxed text-foreground">{insight.text}</p>
                  {insight.impact && (
                    <p className={cn(
                      "mt-1 text-[11px] font-medium",
                      insight.type === "alert" ? "text-destructive/80" : "text-success/80"
                    )}>
                      {insight.impact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <button className="w-full rounded-md bg-primary/5 py-2 text-[12px] font-medium text-primary transition-colors hover:bg-primary/10">
          View Full Analysis →
        </button>
      </div>
    </motion.div>
  );
}
