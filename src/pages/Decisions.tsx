import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  CriticalityTag,
  DecisionStateTag,
  PageHeader,
  Panel,
  SectionTitle,
  Tag,
} from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import { daysUntil, eur, shortDate } from "@/lib/vendflow-data";
import { ArrowRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type Group = "Act now" | "Next 90 days" | "Watching" | "Closed";

const groupFor = (days: number, state: string): Group => {
  if (state === "Decision recorded") return "Closed";
  if (state === "Monitoring") return "Watching";
  if (days <= 100) return "Act now";
  return "Next 90 days";
};

const groupCopy: Record<Group, string> = {
  "Act now": "A deadline or right expires soon and no decision has been recorded.",
  "Next 90 days": "Coming up. Evidence can be prepared before the deadline window opens.",
  Watching: "Under observation, with a condition that would change the picture.",
  Closed: "Decision recorded. Follow-up conditions remain visible.",
};

export default function Decisions() {
  const { engagements, rules } = usePrototype();
  const [onlyMine, setOnlyMine] = useState(false);
  const { currentUser } = usePrototype();

  const rows = useMemo(() => {
    const list = onlyMine ? engagements.filter((e) => e.owner === currentUser.name) : engagements;
    return list
      .map((e) => ({ e, days: daysUntil(e.noticeDeadline) }))
      .sort((a, b) => a.days - b.days);
  }, [engagements, onlyMine, currentUser.name]);

  const groups: Group[] = ["Act now", "Next 90 days", "Watching", "Closed"];
  const activeRules = rules.filter((r) => r.active).length;

  return (
    <AppLayout width="wide">
      <div className="space-y-7">
        <PageHeader
          eyebrow="Your work"
          title="Decisions"
          purpose="Engagements where something must be decided, ordered by the date the choice closes. Contract expiry and notice deadline are shown separately."
          actions={
            <>
              <button
                onClick={() => setOnlyMine((v) => !v)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-medium transition-colors",
                  onlyMine
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Owned by me
              </button>
              <Link
                to="/rules"
                className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {activeRules} active signal rules
              </Link>
            </>
          }
        />

        {groups.map((group) => {
          const items = rows.filter(({ e, days }) => groupFor(days, e.decisionState) === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <SectionTitle
                title={group}
                hint={groupCopy[group]}
                right={<Tag tone="outline">{items.length}</Tag>}
              />
              <Panel className="divide-y divide-border overflow-hidden">
                {items.map(({ e, days }) => (
                  <Link
                    key={e.id}
                    to={`/engagement/${e.id}`}
                    className="group flex items-start gap-6 px-5 py-4 outline-none transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-[14px] font-semibold text-foreground">
                          {e.title}
                        </span>
                        <CriticalityTag value={e.criticality} />
                        <DecisionStateTag value={e.decisionState} />
                      </div>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {e.supplier} · {e.type} · {e.reference} · owner {e.owner}
                      </p>
                      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-foreground/80">
                        {e.situation}
                      </p>
                    </div>

                    <div className="w-[170px] shrink-0 text-right">
                      <p
                        className={cn(
                          "font-heading text-[15px] font-semibold",
                          days <= 100 && e.decisionState !== "Decision recorded"
                            ? "text-destructive"
                            : "text-foreground",
                        )}
                      >
                        {days > 0 ? `${days} days` : "passed"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        to notice deadline
                        <br />
                        {shortDate(e.noticeDeadline)}
                      </p>
                      <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                        Contract expires {shortDate(e.contractExpiry)}
                        {e.autoRenews && " · auto-renews"}
                      </p>
                    </div>

                    <div className="w-[130px] shrink-0 text-right">
                      <p className="font-heading text-[15px] font-semibold text-foreground">
                        {eur(e.committedAnnual)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">committed per year</p>
                    </div>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </Panel>
            </section>
          );
        })}

        {!rows.length && (
          <Panel className="px-6 py-14 text-center">
            <h3 className="font-heading text-[14px] font-semibold text-foreground">Nothing assigned to you</h3>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
              Turn off the owner filter to see the engagements handled by the wider team.
            </p>
          </Panel>
        )}
      </div>
    </AppLayout>
  );
}
