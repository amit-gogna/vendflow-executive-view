import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, Panel, SectionTitle, Tag } from "@/components/vf/primitives";
import { benchmarkRows, shortDate } from "@/lib/vendflow-data";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function RatesAndTerms() {
  const { engagements } = usePrototype();

  return (
    <AppLayout width="wide">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Evidence"
          title="Rates and terms"
          purpose="Comparators with their observation date, sample size and known limits. A thin comparator is marked as indicative rather than presented as a market rate."
        />

        <SectionTitle
          title="Benchmark comparison"
          hint="Contracted rates are matched to role, region and seniority band."
        />
        <Panel className="overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-sunken text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-3 py-2.5 font-medium">Band</th>
                <th className="px-3 py-2.5 text-right font-medium">Contracted</th>
                <th className="px-3 py-2.5 text-right font-medium">Median</th>
                <th className="px-3 py-2.5 font-medium">Range</th>
                <th className="px-3 py-2.5 text-right font-medium">Gap</th>
                <th className="px-5 py-2.5 font-medium">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {benchmarkRows.map((r) => {
                const gap = r.contracted ? Math.round(((r.contracted - r.median) / r.median) * 1000) / 10 : null;
                const eng = engagements.find((e) => e.id === r.engagementId);
                const thin = r.observations < 25;
                return (
                  <tr key={r.id} className="align-top">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-foreground">{r.role}</p>
                      <p className="text-[12px] text-muted-foreground">{r.region}</p>
                      {eng && (
                        <Link
                          to={`/engagement/${eng.id}`}
                          className="mt-1 inline-block text-[12px] text-primary hover:underline"
                        >
                          {eng.reference}
                        </Link>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[13px] text-foreground">{r.band}</td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-foreground">
                      {r.contracted ? `€${r.contracted}` : "—"}
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-foreground">€{r.median}</td>
                    <td className="px-3 py-3 text-[12px] tabular-nums text-muted-foreground">
                      €{r.lower}–€{r.upper}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3 text-right text-[13px] font-semibold tabular-nums",
                        gap === null
                          ? "text-muted-foreground"
                          : gap > 12
                            ? "text-destructive"
                            : gap > 0
                              ? "text-warning"
                              : "text-success",
                      )}
                    >
                      {gap === null ? "—" : `${gap > 0 ? "+" : ""}${gap}%`}
                    </td>
                    <td className="max-w-[260px] px-5 py-3">
                      <p className="text-[12px] text-muted-foreground">
                        {r.observations} observations · observed {shortDate(r.observedOn)}
                      </p>
                      {thin && (
                        <Tag tone="warning">
                          Indicative only, fewer than 25 observations
                        </Tag>
                      )}
                      {r.note && (
                        <p className="mt-1 text-[11px] leading-relaxed text-warning">{r.note}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel className="px-5 py-4">
          <h2 className="font-heading text-[13px] font-semibold text-foreground">How to read a gap</h2>
          <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed text-muted-foreground">
            A gap is a question, not a saving. It becomes value only once an improvement is agreed, applied and then
            verified against actual spend. Follow an item through those stages on the{" "}
            <Link to="/value" className="text-primary hover:underline">
              value page
            </Link>
            .
          </p>
        </Panel>
      </div>
    </AppLayout>
  );
}
