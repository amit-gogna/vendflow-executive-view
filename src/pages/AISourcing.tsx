import { AppLayout } from "@/components/layout/AppLayout";
import { AISourcingChat } from "@/components/ai-sourcing/AISourcingChat";
import { RecommendedVendors } from "@/components/ai-sourcing/RecommendedVendors";
import { motion } from "framer-motion";

export default function AISourcing() {
  return (
    <AppLayout>
      <div className="mx-auto flex h-[calc(100vh-var(--header-height)-3rem)] max-w-7xl gap-6">
        {/* Main chat area */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-w-0 flex-1 flex-col"
        >
          <div className="mb-4">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              AI Sourcing
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Describe what you need — the AI builds your RFQ in seconds.
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
