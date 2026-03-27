import { AppLayout } from "@/components/layout/AppLayout";
import {
  DollarSign,
  Building2,
  TrendingDown,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  {
    title: "Total Spend",
    value: "$2.4M",
    change: "+12.3%",
    trend: "up" as const,
    subtitle: "This quarter",
    icon: DollarSign,
    accentClass: "bg-primary/10 text-primary",
  },
  {
    title: "Active Vendors",
    value: "48",
    change: "+3",
    trend: "up" as const,
    subtitle: "vs. last month",
    icon: Building2,
    accentClass: "bg-accent/10 text-accent",
  },
  {
    title: "Rate Leakage",
    value: "4.2%",
    change: "-0.8%",
    trend: "down" as const,
    subtitle: "Improving",
    icon: TrendingDown,
    accentClass: "bg-success/10 text-success",
  },
  {
    title: "Open RFQs",
    value: "12",
    change: "5 due soon",
    trend: "neutral" as const,
    subtitle: "Across 6 vendors",
    icon: FileText,
    accentClass: "bg-warning/10 text-warning",
  },
];

function MetricCard({
  metric,
  index,
}: {
  metric: (typeof metrics)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      className="group rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.accentClass}`}>
          <metric.icon className="h-[18px] w-[18px]" />
        </div>
        <div className="flex items-center gap-1 text-[12px] font-medium">
          {metric.trend === "up" && (
            <>
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">{metric.change}</span>
            </>
          )}
          {metric.trend === "down" && (
            <>
              <ArrowDownRight className="h-3 w-3 text-success" />
              <span className="text-success">{metric.change}</span>
            </>
          )}
          {metric.trend === "neutral" && (
            <span className="text-muted-foreground">{metric.change}</span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {metric.value}
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{metric.title}</p>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground/70">{metric.subtitle}</p>
    </motion.div>
  );
}

function EmptyPanel({ title, icon: Icon, description }: { title: string; icon: React.ElementType; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-heading text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">{description}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Overview of your IT services sourcing and vendor landscape.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.title} metric={metric} index={i} />
          ))}
        </div>

        {/* Empty state panels */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <EmptyPanel
            icon={BarChart3}
            title="Spend Analytics"
            description="Spend breakdown by vendor, category, and time period will appear here once data is connected."
          />
          <EmptyPanel
            icon={Activity}
            title="Recent Activity"
            description="Latest proposals, vendor updates, and rate changes will be shown in this feed."
          />
        </div>
      </div>
    </AppLayout>
  );
}
