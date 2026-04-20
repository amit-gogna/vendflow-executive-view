import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Brain,
  FileText,
  Building2,
  ShieldCheck,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockStore } from "@/lib/mock-store";

const navSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", path: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Rate Intelligence", path: "/rate-intelligence", icon: TrendingUp },
      { title: "AI Sourcing", path: "/ai-sourcing", icon: Brain },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Proposals", path: "/proposals", icon: FileText },
      { title: "Vendors", path: "/vendors", icon: Building2 },
    ],
  },
  {
    label: "Compliance",
    items: [
      { title: "Governance & Audit", path: "/governance", icon: ShieldCheck },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const proposals = useMockStore((s) => s.proposals);
  const rates = useMockStore((s) => s.rates);
  const auditLog = useMockStore((s) => s.auditLog);
  const rfqs = useMockStore((s) => s.rfqs);

  const badges: Record<string, number> = {
    "/rate-intelligence": rates.filter((r) => r.isNew).length,
    "/proposals": proposals.filter((p) => p.isNew).length,
    "/vendors": rfqs.length,
    "/governance": auditLog.filter((a) => a.decisionStatus === "pending").length,
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-heading text-[15px] font-semibold tracking-tight text-sidebar-accent-foreground">
            Vendflow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-widest text-sidebar-muted">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-sidebar-primary")} />
                      {!collapsed && <span className="flex-1">{item.title}</span>}
                      {!collapsed && badges[item.path] > 0 && (
                        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-bold text-sidebar-primary-foreground">
                          {badges[item.path]}
                        </span>
                      )}
                      {collapsed && badges[item.path] > 0 && (
                        <span className="absolute ml-5 -mt-3 h-2 w-2 rounded-full bg-sidebar-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-muted transition-colors hover:text-sidebar-accent-foreground"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
