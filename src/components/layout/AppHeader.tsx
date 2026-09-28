import { Search } from "lucide-react";
import { DemoNote } from "@/components/vf/primitives";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-6 border-b border-border bg-card/90 px-8 backdrop-blur">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          aria-label="Search engagements, suppliers, contracts"
          placeholder="Search an engagement, supplier or contract…"
          className="h-9 w-full rounded-md border border-input bg-surface-sunken pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-3">
        <DemoNote>Demonstration data, 28 Sep 2026</DemoNote>
      </div>
    </header>
  );
}
