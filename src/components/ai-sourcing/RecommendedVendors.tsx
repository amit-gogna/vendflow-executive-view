import { motion } from "framer-motion";
import { Star, TrendingUp, Clock, DollarSign, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vendor {
  name: string;
  initials: string;
  rating: number;
  performance: string;
  availability: string;
  rateCompetitiveness: "low" | "mid" | "high";
  specialties: string[];
}

const vendors: Vendor[] = [
  {
    name: "CloudWorks GmbH",
    initials: "CW",
    rating: 4.8,
    performance: "98% on-time",
    availability: "Immediate",
    rateCompetitiveness: "high",
    specialties: ["DevOps", "Cloud Infra", "SRE"],
  },
  {
    name: "NordOps AB",
    initials: "NO",
    rating: 4.6,
    performance: "95% on-time",
    availability: "2 weeks",
    rateCompetitiveness: "high",
    specialties: ["DevOps", "Platform Eng"],
  },
  {
    name: "TechCorp Nordic",
    initials: "TC",
    rating: 4.3,
    performance: "91% on-time",
    availability: "Immediate",
    rateCompetitiveness: "mid",
    specialties: ["Full-stack", "DevOps", "Data"],
  },
  {
    name: "SoftHouse PL",
    initials: "SH",
    rating: 4.5,
    performance: "93% on-time",
    availability: "1 week",
    rateCompetitiveness: "high",
    specialties: ["Frontend", "Backend", "QA"],
  },
];

const rateLabels = {
  high: { text: "Competitive", className: "bg-success/10 text-success" },
  mid: { text: "Average", className: "bg-warning/10 text-warning" },
  low: { text: "Premium", className: "bg-destructive/10 text-destructive" },
};

export function RecommendedVendors() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-card">
      {/* Header */}
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="font-heading text-sm font-semibold text-foreground">Recommended Vendors</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Ranked by performance, availability & rate competitiveness
        </p>
      </div>

      {/* Vendor list */}
      <div className="flex-1 overflow-y-auto">
        {vendors.map((vendor, i) => {
          const rate = rateLabels[vendor.rateCompetitiveness];
          return (
            <motion.div
              key={vendor.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
              className="group cursor-pointer border-b border-border/60 px-5 py-3.5 transition-colors hover:bg-surface-sunken/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 font-heading text-[11px] font-bold text-primary">
                  {vendor.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">{vendor.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* Metrics row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning" />
                      {vendor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {vendor.performance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {vendor.availability}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", rate.className)}>
                      <DollarSign className="mr-0.5 inline h-2.5 w-2.5" />
                      {rate.text}
                    </span>
                    {vendor.specialties.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <button className="w-full rounded-md bg-secondary py-2 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-muted">
          View All Vendors →
        </button>
      </div>
    </div>
  );
}
