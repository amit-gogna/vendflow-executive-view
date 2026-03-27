import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

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
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="font-heading text-sm font-semibold text-foreground">Upload Rate Data</h2>
        <p className="text-[11px] text-muted-foreground">
          Drop contracts, SOWs, or rate cards — AI will extract and benchmark rates automatically.
        </p>
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
          <button className="mt-3 rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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
    </motion.div>
  );
}
