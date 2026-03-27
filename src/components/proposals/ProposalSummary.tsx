import { motion } from "framer-motion";
import { FileText, AlertTriangle, CheckCircle2, Trophy } from "lucide-react";

const stats = [
  { label: "Proposals Received", value: "3", icon: FileText, accent: "bg-primary/10 text-primary" },
  { label: "Above Market", value: "1", icon: AlertTriangle, accent: "bg-warning/10 text-warning" },
  { label: "Within Budget", value: "2", icon: CheckCircle2, accent: "bg-success/10 text-success" },
  { label: "Recommended", value: "NordOps AB", icon: Trophy, accent: "bg-accent/10 text-accent" },
];

export function ProposalSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.accent}`}>
            <s.icon className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
