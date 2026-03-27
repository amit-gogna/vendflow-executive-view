import { motion } from "framer-motion";
import {
  FileText,
  Send,
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Open RFQs", value: "5", icon: FileText, accent: "bg-primary/10 text-primary" },
  { label: "Submitted", value: "12", icon: Send, accent: "bg-accent/10 text-accent" },
  { label: "Win Rate", value: "42%", icon: Trophy, accent: "bg-success/10 text-success" },
  { label: "Avg Response", value: "1.8d", icon: Clock, accent: "bg-warning/10 text-warning" },
];

interface RFQ {
  id: string;
  title: string;
  role: string;
  location: string;
  deadline: string;
  matchScore: number;
  rateGuidance: string;
  status: "new" | "viewed" | "submitted";
  urgent: boolean;
}

const rfqs: RFQ[] = [
  { id: "rfq-1", title: "DevOps Engineer — Stockholm", role: "DevOps Engineer", location: "Stockholm, SE", deadline: "3 days", matchScore: 94, rateGuidance: "$95–115/hr", status: "new", urgent: true },
  { id: "rfq-2", title: "Senior React Developer — Berlin", role: "Senior Frontend Engineer", location: "Berlin, DE", deadline: "5 days", matchScore: 87, rateGuidance: "$90–110/hr", status: "new", urgent: false },
  { id: "rfq-3", title: "Data Engineer — Amsterdam", role: "Data Engineer", location: "Amsterdam, NL", deadline: "7 days", matchScore: 78, rateGuidance: "$100–125/hr", status: "viewed", urgent: false },
  { id: "rfq-4", title: "QA Lead — Copenhagen", role: "QA Lead", location: "Copenhagen, DK", deadline: "2 days", matchScore: 91, rateGuidance: "$85–100/hr", status: "new", urgent: true },
  { id: "rfq-5", title: "Cloud Architect — Helsinki", role: "Solutions Architect", location: "Helsinki, FI", deadline: "10 days", matchScore: 72, rateGuidance: "$120–150/hr", status: "viewed", urgent: false },
];

const recentSubmissions = [
  { rfq: "Platform Engineer — Oslo", status: "Under Review", date: "2 days ago" },
  { rfq: "Backend Developer — Tallinn", status: "Won", date: "1 week ago" },
  { rfq: "SRE — Stockholm", status: "Lost", date: "2 weeks ago" },
];

interface Props {
  onSelectRFQ: (id: string) => void;
}

export function VendorDashboard({ onSelectRFQ }: Props) {
  return (
    <div className="space-y-6">
      {/* Stats */}
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

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Open RFQs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-border bg-card shadow-card"
        >
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="font-heading text-sm font-semibold text-foreground">Open RFQs</h2>
            <p className="text-[11px] text-muted-foreground">
              {rfqs.filter((r) => r.status !== "submitted").length} opportunities · sorted by match score
            </p>
          </div>
          <div className="divide-y divide-border/60">
            {rfqs.map((rfq, i) => (
              <motion.div
                key={rfq.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
                onClick={() => onSelectRFQ(rfq.id)}
                className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-sunken/50"
              >
                {/* Match score */}
                <div className={cn(
                  "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-center",
                  rfq.matchScore >= 90 ? "bg-success/10" : rfq.matchScore >= 80 ? "bg-primary/10" : "bg-secondary"
                )}>
                  <span className={cn(
                    "text-[13px] font-bold",
                    rfq.matchScore >= 90 ? "text-success" : rfq.matchScore >= 80 ? "text-primary" : "text-muted-foreground"
                  )}>{rfq.matchScore}</span>
                  <span className="text-[8px] font-medium uppercase text-muted-foreground">match</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{rfq.title}</span>
                    {rfq.urgent && (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive">
                        Urgent
                      </span>
                    )}
                    {rfq.status === "new" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rfq.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rfq.deadline} left</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{rfq.rateGuidance}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectRFQ(rfq.id); }}
                    className="hidden items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 group-hover:flex"
                  >
                    Respond <ArrowRight className="h-3 w-3" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent submissions */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="h-fit rounded-xl border border-border bg-card shadow-card"
        >
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="font-heading text-sm font-semibold text-foreground">Recent Submissions</h2>
            <p className="text-[11px] text-muted-foreground">Your proposal history</p>
          </div>
          <div className="divide-y divide-border/60">
            {recentSubmissions.map((s) => (
              <div key={s.rfq} className="px-5 py-3 transition-colors hover:bg-surface-sunken/50">
                <p className="text-[12.5px] font-medium text-foreground">{s.rfq}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    s.status === "Won" && "bg-success/10 text-success",
                    s.status === "Lost" && "bg-destructive/10 text-destructive",
                    s.status === "Under Review" && "bg-warning/10 text-warning"
                  )}>{s.status}</span>
                  <span className="text-[11px] text-muted-foreground">{s.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-5 py-3">
            <button className="w-full rounded-md bg-secondary py-2 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-muted">
              View All Submissions →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
