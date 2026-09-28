import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  FileSearch,
  GaugeCircle,
  ListChecks,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrototype } from "@/lib/prototype-store";

const sections = [
  {
    label: "Work",
    items: [
      { title: "Decisions", path: "/", icon: ListChecks, hint: "What needs attention" },
      { title: "Suppliers", path: "/suppliers", icon: Building2, hint: "Relationships and assurance" },
      { title: "New demand", path: "/sourcing", icon: ClipboardList, hint: "Structure a new need" },
    ],
  },
  {
    label: "Evidence",
    items: [
      { title: "Rates & terms", path: "/rates", icon: FileSearch, hint: "Benchmarks with sources" },
      { title: "Value", path: "/value", icon: GaugeCircle, hint: "Opportunity to verified impact" },
    ],
  },
  {
    label: "Set up",
    items: [
      { title: "Signal rules", path: "/rules", icon: SlidersHorizontal, hint: "What deserves attention" },
      { title: "Record", path: "/audit", icon: ScrollText, hint: "Decisions and changes" },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { engagements, currentUser } = usePrototype();
  const needsAttention = engagements.filter(
    (e) => e.decisionState === "Needs review" || e.decisionState === "Awaiting contribution",
  ).length;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[248px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-sidebar-primary font-heading text-[13px] font-bold text-sidebar-primary-foreground">
          V
        </div>
        <div className="leading-none">
          <span className="font-heading text-[14px] font-semibold tracking-tight text-sidebar-accent-foreground">
            Vendflow
          </span>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">Acme Group</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.path === "/"
                    ? location.pathname === "/" || location.pathname.startsWith("/engagement")
                    : location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon
                        className={cn("h-[16px] w-[16px] shrink-0", active && "text-sidebar-primary")}
                      />
                      <span className="flex-1">{item.title}</span>
                      {item.path === "/" && needsAttention > 0 && (
                        <span className="rounded bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                          {needsAttention}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[12px] font-medium text-sidebar-accent-foreground">{currentUser.name}</p>
        <p className="text-[11px] text-sidebar-muted">{currentUser.role}</p>
      </div>
    </aside>
  );
}
