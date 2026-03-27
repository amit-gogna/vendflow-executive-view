import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { VendorDashboard } from "@/components/vendors/VendorDashboard";
import { VendorRFQDetail } from "@/components/vendors/VendorRFQDetail";
import { motion } from "framer-motion";

export default function Vendors() {
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

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
            {selectedRFQ ? "RFQ Detail" : "Vendor Portal"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {selectedRFQ
              ? "Review requirements, submit candidates, and respond fast."
              : "Your open opportunities, submitted proposals, and performance overview."}
          </p>
          {selectedRFQ && (
            <button
              onClick={() => setSelectedRFQ(null)}
              className="mt-2 text-[12px] font-medium text-primary hover:underline"
            >
              ← Back to Dashboard
            </button>
          )}
        </motion.div>

        {selectedRFQ ? (
          <VendorRFQDetail rfqId={selectedRFQ} />
        ) : (
          <VendorDashboard onSelectRFQ={setSelectedRFQ} />
        )}
      </div>
    </AppLayout>
  );
}
