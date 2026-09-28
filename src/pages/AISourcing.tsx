import { AppLayout } from "@/components/layout/AppLayout";
import { AISourcingChat } from "@/components/ai-sourcing/AISourcingChat";
import { RecommendedVendors } from "@/components/ai-sourcing/RecommendedVendors";
import { motion } from "framer-motion";

export default function AISourcing() {
  return (
    <AppLayout width="wide">
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Main chat area */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-w-0 flex-1 flex-col"
        >
          <div className="mb-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Work
            </p>
            <h1 className="font-heading text-[22px] font-semibold tracking-tight text-foreground">
              New demand
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              Describe the need in your own words. A structured brief is drafted for you to correct, covering either
              time-based work or a deliverable-based statement of work.
            </p>
          </div>
          <AISourcingChat />
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="hidden w-[320px] shrink-0 xl:block"
        >
          <RecommendedVendors />
        </motion.div>
      </div>
    </AppLayout>
  );
}
