import { AppLayout } from "@/components/layout/AppLayout";
import { ProposalSummary } from "@/components/proposals/ProposalSummary";
import { ProposalTable } from "@/components/proposals/ProposalTable";
import { AIRecommendation } from "@/components/proposals/AIRecommendation";
import { motion } from "framer-motion";

export default function Proposals() {
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
            Proposal Comparison
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Evaluate vendor proposals side-by-side with AI-powered scoring and anomaly detection.
          </p>
        </motion.div>

        <ProposalSummary />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
          <ProposalTable />
          <AIRecommendation />
        </div>
      </div>
    </AppLayout>
  );
}
