import { motion } from "framer-motion";
import { Brain, CheckCircle2, TrendingUp, Shield, DollarSign, ArrowRight } from "lucide-react";

const reasons = [
  {
    icon: DollarSign,
    title: "Rate Competitiveness",
    detail: "At $98/hr, NordOps is 8% below market median ($107/hr) for Senior DevOps in Stockholm — saving ~$14K over 6 months.",
    accent: "bg-success/10 text-success",
  },
  {
    icon: TrendingUp,
    title: "Market Fit Score: 94/100",
    detail: "Strong alignment with your requirements: DevOps expertise, Nordic presence, and immediate availability.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Reliability: 96/100",
    detail: "95% on-time delivery across 12 past engagements. Zero contract disputes. Avg NPS from hiring managers: 4.6/5.",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: CheckCircle2,
    title: "Candidate Quality",
    detail: "Lead candidate Erik Lindström has 8 years of DevOps experience with AWS/K8s stack — directly matching your tech requirements.",
    accent: "bg-success/10 text-success",
  },
];

export function AIRecommendation() {
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
          <h2 className="font-heading text-sm font-semibold text-foreground">AI Recommendation</h2>
          <p className="text-[11px] text-muted-foreground">Why NordOps AB ranks #1</p>
        </div>
      </div>

      {/* Verdict */}
      <div className="border-b border-border bg-success/[0.04] px-5 py-3.5">
        <p className="text-[13px] leading-relaxed text-foreground">
          <strong className="text-success">NordOps AB</strong> offers the best combination of competitive pricing, proven reliability, and candidate quality for this engagement.
        </p>
      </div>

      {/* Reasons */}
      <div className="divide-y divide-border/60">
        {reasons.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
            className="px-5 py-3.5"
          >
            <div className="flex gap-3">
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${r.accent}`}>
                <r.icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-foreground">{r.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{r.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border px-5 py-3.5">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          Accept & Proceed
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button className="rounded-lg border border-border bg-card px-4 py-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          Compare More
        </button>
      </div>
    </motion.div>
  );
}
