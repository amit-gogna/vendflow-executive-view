import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, Panel, Tag } from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

const filters = ["All", "Decisions", "Corrections", "Contributions", "Configuration"] as const;

const matches = (action: string, filter: (typeof filters)[number]) => {
  if (filter === "All") return true;
  if (filter === "Decisions") return action.startsWith("Recorded decision") || action.includes("Accepted") || action.includes("Rejected");
  if (filter === "Corrections") return action.startsWith("Corrected");
  if (filter === "Contributions") return action.includes("contribution");
  return action.includes("signal rule") || action.includes("Moved");
};

export default function AuditLog() {
  const { audit, engagements } = usePrototype();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = audit.filter((a) => matches(a.action, filter));
  const nameOf = (id?: string) => engagements.find((e) => e.id === id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Record"
          title="Decisions and changes"
          purpose="Who decided what, on which evidence, and what changed afterwards. Corrections keep their history rather than replacing it."
        />

        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-8 rounded-md border px-3 text-[12px] font-medium transition-colors",
                filter === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <Panel className="divide-y divide-border">
          {visible.map((entry) => {
            const eng = nameOf(entry.engagementId);
            return (
              <div key={entry.id} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-6">
                  <p className="text-[13px] font-medium text-foreground">{entry.action}</p>
                  <p className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(entry.at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {entry.actor} · {entry.role}
                  {eng && (
                    <>
                      {" · "}
                      <Link to={`/engagement/${eng.id}`} className="text-primary hover:underline">
                        {eng.reference} {eng.title}
                      </Link>
                    </>
                  )}
                </p>
                {entry.rationale && (
                  <p className="mt-2 rounded border-l-2 border-border bg-surface-sunken px-3 py-2 text-[12px] leading-relaxed text-foreground/80">
                    {entry.rationale}
                  </p>
                )}
                {entry.evidenceCited?.length ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Evidence cited:</span>
                    {entry.evidenceCited.map((c) => (
                      <Tag key={c} tone="outline">
                        {c}
                      </Tag>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          {!visible.length && (
            <div className="px-6 py-12 text-center">
              <h3 className="font-heading text-[14px] font-semibold text-foreground">No entries of this kind yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
                Record a decision or correct a fact on an engagement and it will appear here.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </AppLayout>
  );
}
