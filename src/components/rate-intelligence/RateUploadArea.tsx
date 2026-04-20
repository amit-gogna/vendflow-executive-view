import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, FileSpreadsheet } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";
import { BulkImportModal } from "./BulkImportModal";

interface UploadedFile {
  name: string;
  size: string;
  status: "processing" | "complete";
}

export function RateUploadArea() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "Acme_RateCard_2025.xlsx", size: "245 KB", status: "complete" },
    { name: "CloudWorks_SOW_Q1.pdf", size: "1.2 MB", status: "processing" },
  ]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addRates, logAction } = useMockStore();

  const simulateParse = useCallback(
    (name: string, sizeBytes: number) => {
      const size = sizeBytes > 1_000_000 ? `${(sizeBytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
      setFiles((f) => [{ name, size, status: "processing" }, ...f]);

      setTimeout(() => {
        // Generate a fake extracted rate
        const roles = ["Senior Backend Engineer", "Mid DevOps Engineer", "Lead Data Scientist", "Senior QA Engineer"];
        const geos = ["Stockholm", "Berlin", "Amsterdam", "Helsinki"];
        const vendors = ["NordOps AB", "CloudWorks GmbH", "TechCorp Nordic", "DataMinds UK"];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const geo = geos[Math.floor(Math.random() * geos.length)];
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        const market = 90 + Math.floor(Math.random() * 60);
        const variancePct = -8 + Math.random() * 30;
        const rate = Math.round(market * (1 + variancePct / 100));
        const flagged = variancePct > 15;
        const id = `parsed-${Date.now()}`;

        addRates([
          {
            id,
            role: role.split(" ").slice(1).join(" "),
            seniority: role.split(" ")[0],
            geography: geo,
            vendor,
            vendorRate: rate,
            marketMedian: market,
            variance: parseFloat(variancePct.toFixed(1)),
            flagged,
            source: name,
          },
        ]);

        logAction({
          type: "ingest",
          actor: "Vendflow AI",
          actorType: "ai",
          summary: `Parsed ${name} — extracted ${role} rate ($${rate}/hr) for ${vendor}`,
          vendor,
          inputData: [
            { label: "File", value: name },
            { label: "Role", value: role },
            { label: "Geography", value: geo },
            { label: "Extracted Rate", value: `$${rate}/hr` },
            { label: "Market Median", value: `$${market}/hr` },
          ],
          aiReasoning: `Layout-aware extraction identified the rate cell for ${role} in ${vendor}'s rate card. Cross-referenced against the market benchmark database for ${geo} (${market}/hr median).`,
          decision: flagged ? "Flagged as rate leakage" : "Within market range",
          decisionStatus: flagged ? "pending" : "approved",
        });

        if (flagged) {
          toast.warning(`Rate leakage detected in ${name}`, {
            description: `${role} at ${vendor}: +${variancePct.toFixed(1)}% above market`,
          });
        } else {
          toast.success(`${name} parsed successfully`, {
            description: `${role} rate extracted and benchmarked`,
          });
        }

        setFiles((f) =>
          f.map((file) => (file.name === name ? { ...file, status: "complete" } : file))
        );
      }, 2500);
    },
    [addRates, logAction]
  );

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => simulateParse(f.name, f.size));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [simulateParse]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      <div className="border-b border-border px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">Upload Rate Data</h2>
            <p className="text-[11px] text-muted-foreground">
              Drop contracts, SOWs, or rate cards — AI will extract and benchmark rates automatically.
            </p>
          </div>
          <button
            onClick={() => setBulkOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Bulk CSV Import
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition-all",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-surface-sunken/50 hover:border-muted-foreground/30"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <p className="mt-3 text-[13px] font-medium text-foreground">
            Drag & drop files here
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            PDF, XLSX, CSV, DOCX — up to 20MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-3 rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Files
          </button>
        </div>

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-sunken/30 px-4 py-2.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{file.size}</p>
                </div>
                {file.status === "processing" ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Parsing…
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Analyzed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BulkImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </motion.div>
  );
}
