import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, Panel, SectionTitle, Tag } from "@/components/vf/primitives";
import { usePrototype } from "@/lib/prototype-store";
import { eur, type ValueStage } from "@/lib/vendflow-data";
import { ArrowRight } from "lucide-react";

const stages: ValueStage[] = [
  "Potential opportunity",
  "Agreed improvement",
  "Operational realisation",
  "Verified impact",
];

const stageCopy: Record<ValueStage, string> = {
  "Potential opportunity": "Identified from evidence. Not agreed with anyone yet.",
  "Agreed improvement": "Agreed with the supplier or internally. Not yet in effect.",
  "Operational realisation": "In effect. Appears in invoices or service terms.",
  "Verified impact": "Confirmed by finance against actual spend.",
};

export default function ValueLedger() {
  const { value, engagements, advanceValueStage } = usePrototype();
  const nameOf = (id: string) => engagements.find((e) => e.id === id);

  return (
    <AppLayout width="wide">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Evidence"
          title="Value"
          purpose="A benchmark gap is not a saving. Each item moves through four stages, and only the final one counts as verified impact."
        />

        <div className="grid grid-cols-4 gap-3">
          {stages.map((stage) => {
            const items = value.filter((v) => v.stage === stage);
            const total = items.reduce((s, v) => s + v.amountAnnual, 0);
            return (
              <Panel key={stage} className="px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {stage}
                </p>
                <p className="mt-2 font-heading text-[18px] font-semibold tracking-tight text-foreground">
                  {eur(total)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {items.length} item{items.length === 1 ? "" : "s"} per year
                </p>
                <p className="mt-2 border-t border-dashed border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {stageCopy[stage]}
                </p>
              </Panel>
            );
          })}
        </div>

        <section>
          <SectionTitle title="Items" hint="Each item names its basis and who confirmed the current stage." />
          <Panel className="divide-y divide-border">
            {value.map((v) => {
              const eng = nameOf(v.engagementId);
              return (
                <div key={v.id} className="flex items-start justify-between gap-6 px-5 py-4">
                  <div className="min-w-0 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-foreground">{v.label}</span>
                      <Tag tone={v.stage === "Verified impact" ? "success" : "outline"}>{v.stage}</Tag>
                    </div>
                    {eng && (
                      <Link
                        to={`/engagement/${eng.id}`}
                        className="mt-0.5 block text-[12px] text-muted-foreground hover:text-primary hover:underline"
                      >
                        {eng.reference} {eng.title} · {eng.supplier}
                      </Link>
                    )}
                    <p className="mt-2 text-[12px] leading-relaxed text-foreground/80">{v.basis}</p>
                    {v.confirmedBy && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Stage confirmed by {v.confirmedBy}
                        {v.confirmedOn && ` on ${new Date(v.confirmedOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-[15px] font-semibold text-foreground">
                      {eur(v.amountAnnual)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">per year</p>
                    {v.stage !== "Verified impact" && (
                      <button
                        onClick={() => advanceValueStage(v.id)}
                        className="mt-2 inline-flex h-7 items-center gap-1.5 rounded border border-border bg-card px-2 text-[12px] font-medium text-foreground hover:bg-secondary"
                      >
                        Move on <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </Panel>
        </section>
      </div>
    </AppLayout>
  );
}
