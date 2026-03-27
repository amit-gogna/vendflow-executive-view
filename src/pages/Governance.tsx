import { AppSidebar } from "@/components/layout/AppSidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, ChevronDown, Shield, AlertTriangle, CheckCircle2, Clock, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GovernanceTimeline } from "@/components/governance/GovernanceTimeline";
import { AuditDetailPanel } from "@/components/governance/AuditDetailPanel";

const kpis = [
  { label: "AI Actions (30d)", value: "247", icon: Shield, accent: "text-primary" },
  { label: "Pending Approvals", value: "5", icon: AlertTriangle, accent: "text-amber-500" },
  { label: "Approved", value: "231", icon: CheckCircle2, accent: "text-emerald-500" },
  { label: "Avg Review Time", value: "1.4h", icon: Clock, accent: "text-muted-foreground" },
];

export default function Governance() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterVendor, setFilterVendor] = useState("all");

  const hasFilters = filterUser !== "all" || filterAction !== "all" || filterVendor !== "all";

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("flex flex-1 flex-col transition-all duration-300", collapsed ? "ml-16" : "ml-[260px]")}>
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-foreground">Governance & Audit</h1>
            <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">EU AI Act</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-64 items-center gap-2 rounded-md border border-input bg-background px-3">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Search audit logs..." className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"><Bell className="h-4 w-4" /></button>
            <div className="flex items-center gap-2 rounded-md border border-input px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary">AK</div>
              <span className="text-sm font-medium text-foreground">Acme Corp</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* KPI bar */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {kpis.map((k) => (
              <Card key={k.label} className="border-border bg-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <k.icon className={cn("h-4 w-4", k.accent)} />
                  </div>
                  <div>
                    <p className="text-[22px] font-semibold leading-tight text-foreground">{k.value}</p>
                    <p className="text-[12px] text-muted-foreground">{k.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-5 flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="User" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="anna">Anna K.</SelectItem>
                <SelectItem value="erik">Erik L.</SelectItem>
                <SelectItem value="system">System (AI)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue placeholder="Action Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="recommendation">AI Recommendation</SelectItem>
                <SelectItem value="approval">Human Approval</SelectItem>
                <SelectItem value="dispatch">RFQ Dispatch</SelectItem>
                <SelectItem value="flag">Anomaly Flag</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterVendor} onValueChange={setFilterVendor}>
              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Vendor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="nordops">NordOps AB</SelectItem>
                <SelectItem value="techflow">TechFlow Nordic</SelectItem>
                <SelectItem value="codecraft">CodeCraft Solutions</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => { setFilterUser("all"); setFilterAction("all"); setFilterVendor("all"); }}>
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          {/* Main content: timeline + detail */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <GovernanceTimeline selectedId={selectedEvent} onSelect={setSelectedEvent} />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <AuditDetailPanel eventId={selectedEvent} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
