import { AppLayout } from "@/components/layout/AppLayout";
import { RateKPIBar } from "@/components/rate-intelligence/RateKPIBar";
import { RateTable } from "@/components/rate-intelligence/RateTable";
import { AIInsightsPanel } from "@/components/rate-intelligence/AIInsightsPanel";
import { RateUploadArea } from "@/components/rate-intelligence/RateUploadArea";
import { motion } from "framer-motion";

export default function RateIntelligence() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Rate Intelligence
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Analyze vendor rates against market benchmarks. Detect leakage and surface savings.
          </p>
        </motion.div>

        <RateKPIBar />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <RateTable />
            <RateUploadArea />
          </div>
          <AIInsightsPanel />
        </div>
      </div>
    </AppLayout>
  );
}
