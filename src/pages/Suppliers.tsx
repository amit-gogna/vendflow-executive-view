import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, Panel, SectionTitle, Tag } from "@/components/vf/primitives";
import { suppliers, eur, shortDate } from "@/lib/vendflow-data";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function Suppliers() {
  const { engagements } = usePrototype();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <AppLayout width="wide">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Work"
          title="Suppliers"
          purpose="Delivery, commercial standing and assurance are kept as separate dimensions, so a strong delivery record never hides an expired review."
        />

        <SectionTitle
          title="Current suppliers"
          hint="Scores are drawn from service reviews and invoice analysis; assurance comes from the supplier register."
        />
        <Panel className="overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-sunken text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 font-medium">Supplier</th>
                <th className="px-3 py-2.5 font-medium">Engagements</th>
                <th className="px-3 py-2.5 text-right font-medium">Annual spend</th>
                <th className="px-3 py-2.5 font-medium">Delivery</th>
                <th className="px-3 py-2.5 font-medium">Commercial</th>
                <th className="px-5 py-2.5 font-medium">Assurance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {suppliers.map((s) => {
                const related = engagements.filter((e) => e.supplierId === s.id);
                const open = openId === s.id;
                return (
                  <>
                    <tr
                      key={s.id}
                      onClick={() => setOpenId(open ? null : s.id)}
                      className="cursor-pointer align-middle transition-colors hover:bg-surface-sunken"
                    >
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-semibold text-foreground">{s.name}</p>
                        <p className="mt-0.5 max-w-sm text-[12px] text-muted-foreground">{s.note}</p>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-foreground">{related.length}</td>
                      <td className="px-3 py-3 text-right text-[13px] font-medium text-foreground">
                        {eur(s.annualSpend)}
                      </td>
                      <td className="px-3 py-3">
                        <Score value={s.deliveryScore} />
                      </td>
                      <td className="px-3 py-3">
                        <Score value={s.commercialScore} />
                      </td>
                      <td className="px-5 py-3">
                        <Tag
                          tone={
                            s.assuranceStatus === "Current"
                              ? "success"
                              : s.assuranceStatus === "Review due"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {s.assuranceStatus}
                        </Tag>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Last review {shortDate(s.lastReview)}
                        </p>
                      </td>
                    </tr>
                    {open && (
                      <tr key={`${s.id}-detail`} className="bg-surface-sunken">
                        <td colSpan={6} className="px-5 py-4">
                          <p className="text-[12px] font-medium text-foreground">Engagements with this supplier</p>
                          <ul className="mt-2 space-y-1.5">
                            {related.map((e) => (
                              <li key={e.id} className="flex items-center justify-between gap-6">
                                <Link
                                  to={`/engagement/${e.id}`}
                                  className="text-[13px] text-foreground hover:text-primary hover:underline"
                                >
                                  {e.reference} · {e.title}
                                </Link>
                                <span className="text-[12px] text-muted-foreground">
                                  {eur(e.committedAnnual)} per year · notice by {shortDate(e.noticeDeadline)}
                                </span>
                              </li>
                            ))}
                            {!related.length && (
                              <li className="text-[12px] text-muted-foreground">
                                No active engagements in the current set.
                              </li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </AppLayout>
  );
}

function Score({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            value >= 80 ? "bg-success" : value >= 65 ? "bg-warning" : "bg-destructive",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[12px] tabular-nums text-foreground">{value}</span>
    </div>
  );
}
