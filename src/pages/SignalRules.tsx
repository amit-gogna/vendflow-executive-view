import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, Panel, SectionTitle, Tag } from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import { daysUntil, engagements as allEngagements, eur, type Criticality } from "@/lib/vendflow-data";
import { cn } from "@/lib/utils";
import { Check, Info, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const levelCopy = {
  "Personal view": "Only changes what you see. No one else is affected.",
  "Team rule": "Shared with your team. Changes what the team is asked to review.",
  "Organisation control": "Requires governance approval before it takes effect.",
} as const;

const criticalityOptions: Criticality[] = ["Business critical", "Important", "Standard"];

export default function SignalRules() {
  const { rules, toggleRule, updateRule, addRule } = usePrototype();
  const [selectedId, setSelectedId] = useState(rules[0]?.id ?? "");
  const [intent, setIntent] = useState("");
  const [drafting, setDrafting] = useState(false);

  const rule = rules.find((r) => r.id === selectedId) ?? rules[0];

  const preview = useMemo(() => {
    if (!rule) return [];
    return allEngagements
      .filter((e) => rule.criticality.includes(e.criticality))
      .filter((e) => e.committedAnnual >= rule.minValue)
      .filter((e) => (rule.leadTimeDays > 0 ? daysUntil(e.noticeDeadline) <= rule.leadTimeDays + 10 : true))
      .map((e) => ({
        engagement: e,
        reason:
          rule.leadTimeDays > 0
            ? `${daysUntil(e.noticeDeadline)} days to the notice deadline, committed value ${eur(e.committedAnnual)}`
            : `${e.criticality}, committed value ${eur(e.committedAnnual)}`,
      }));
  }, [rule]);

  const draftFromIntent = () => {
    if (intent.trim().length < 15) {
      toast({ title: "Describe the rule in a sentence", variant: "destructive" });
      return;
    }
    setDrafting(true);
    setTimeout(() => {
      const id = `rule-${Math.random().toString(36).slice(2, 7)}`;
      addRule({
        id,
        name: "Draft rule from your description",
        plainLanguage: intent.trim(),
        scope: "Business critical and important engagements",
        level: "Personal view",
        owner: "You, draft",
        active: false,
        leadTimeDays: /(\d+)\s*day/i.exec(intent)?.[1] ? Number(/(\d+)\s*day/i.exec(intent)![1]) : 90,
        minValue: 250_000,
        criticality: ["Business critical", "Important"],
        requiresApproval: false,
        assumptions: [
          "Continuing need counts as confirmed only when recorded by the budget owner this quarter.",
          "Value threshold set to €250,000; adjust it if your team uses a different level.",
          "Draft is inactive until you turn it on.",
        ],
        matchedEngagementIds: [],
      });
      setSelectedId(id);
      setIntent("");
      setDrafting(false);
      toast({
        title: "Draft rule prepared",
        description: "Check the assumptions and the preview, then turn it on.",
      });
    }, 900);
  };

  return (
    <AppLayout width="wide">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Set up"
          title="Signal rules"
          purpose="Decide what deserves attention, for which engagements, and when. Rules are written in business language and show exactly what they would catch before you turn them on."
        />

        <Panel className="px-5 py-4">
          <SectionTitle
            title="Describe a rule in your own words"
            hint="A draft rule, its assumptions and its matches are prepared for you to check."
          />
          <div className="flex items-start gap-3">
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={2}
              placeholder="Help us review business-critical engagements 90 days before their notice deadline when continuing need has not been confirmed."
              className="flex-1 rounded border border-input bg-card px-3 py-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={draftFromIntent}
              disabled={drafting}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Wand2 className="h-3.5 w-3.5" />
              {drafting ? "Preparing…" : "Prepare a draft"}
            </button>
          </div>
        </Panel>

        <div className="grid grid-cols-[300px_1fr] gap-4">
          <Panel className="divide-y divide-border">
            {rules.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  "block w-full px-4 py-3 text-left transition-colors",
                  r.id === rule?.id ? "bg-primary/[0.06]" : "hover:bg-surface-sunken",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-medium text-foreground">{r.name}</span>
                  <Tag tone={r.active ? "success" : "outline"}>{r.active ? "On" : "Off"}</Tag>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{r.level}</p>
              </button>
            ))}
          </Panel>

          {rule && (
            <div className="space-y-4">
              <Panel className="px-5 py-4">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="font-heading text-[15px] font-semibold text-foreground">{rule.name}</h2>
                    <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-foreground/85">
                      {rule.plainLanguage}
                    </p>
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      {rule.level} · owner {rule.owner}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{levelCopy[rule.level]}</p>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={cn(
                      "h-9 shrink-0 rounded-md border px-4 text-[13px] font-medium transition-colors",
                      rule.active
                        ? "border-border bg-card text-foreground hover:bg-secondary"
                        : "border-primary bg-primary text-primary-foreground hover:opacity-90",
                    )}
                  >
                    {rule.active ? "Pause rule" : "Turn rule on"}
                  </button>
                </div>

                {rule.requiresApproval && (
                  <p className="mt-3 inline-flex items-start gap-2 rounded border border-border bg-surface-sunken px-3 py-2 text-[12px] text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Changes to this rule go through governance approval before they affect the team.
                  </p>
                )}
              </Panel>

              <div className="grid grid-cols-2 gap-4">
                <Panel className="px-5 py-4">
                  <SectionTitle title="Conditions" hint="Adjust and see the effect immediately." />
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-baseline justify-between text-[12px] font-medium text-foreground">
                        Review lead time
                        <span className="text-muted-foreground">{rule.leadTimeDays} days before deadline</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        step={15}
                        value={rule.leadTimeDays}
                        onChange={(e) => updateRule(rule.id, { leadTimeDays: Number(e.target.value) })}
                        className="mt-2 w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="flex items-baseline justify-between text-[12px] font-medium text-foreground">
                        Minimum committed value
                        <span className="text-muted-foreground">{eur(rule.minValue)}</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={1_500_000}
                        step={50_000}
                        value={rule.minValue}
                        onChange={(e) => updateRule(rule.id, { minValue: Number(e.target.value) })}
                        className="mt-2 w-full accent-primary"
                      />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-foreground">Applies to</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {criticalityOptions.map((c) => {
                          const on = rule.criticality.includes(c);
                          return (
                            <button
                              key={c}
                              onClick={() =>
                                updateRule(rule.id, {
                                  criticality: on
                                    ? rule.criticality.filter((x) => x !== c)
                                    : [...rule.criticality, c],
                                })
                              }
                              className={cn(
                                "h-7 rounded border px-2.5 text-[12px] font-medium transition-colors",
                                on
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
                              )}
                            >
                              {on && <Check className="mr-1 inline h-3 w-3" />}
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel className="px-5 py-4">
                  <SectionTitle title="Assumptions" hint="What the rule takes for granted. Check these first." />
                  <ul className="space-y-2">
                    {rule.assumptions.map((a) => (
                      <li key={a} className="flex gap-2 text-[12px] leading-relaxed text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>

              <div>
                <SectionTitle
                  title="What this rule would raise"
                  hint="Live preview against the current engagement set, with the reason for each match."
                  right={<Tag tone="outline">{preview.length} matched</Tag>}
                />
                <Panel className="divide-y divide-border">
                  {preview.map(({ engagement, reason }) => (
                    <div key={engagement.id} className="flex items-center justify-between gap-6 px-4 py-3">
                      <div>
                        <Link
                          to={`/engagement/${engagement.id}`}
                          className="text-[13px] font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {engagement.title}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {engagement.supplier} · {engagement.reference}
                        </p>
                      </div>
                      <p className="max-w-sm text-right text-[12px] text-muted-foreground">{reason}</p>
                    </div>
                  ))}
                  {!preview.length && (
                    <div className="px-5 py-10 text-center">
                      <h3 className="font-heading text-[13px] font-semibold text-foreground">
                        Nothing would be raised
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted-foreground">
                        Widen the value threshold or the lead time to catch more engagements.
                      </p>
                    </div>
                  )}
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
