import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  LogOut,
  Sparkles,
  ArrowRight,
  Award,
  XCircle,
  Zap,
} from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CandidatePortal() {
  const navigate = useNavigate();
  const session = useMockStore((s) => s.candidateSession);
  const candidates = useMockStore((s) => s.candidates);
  const opportunities = useMockStore((s) => s.opportunities);
  const acceptOpportunity = useMockStore((s) => s.acceptOpportunity);
  const declineOpportunity = useMockStore((s) => s.declineOpportunity);
  const logoutCandidate = useMockStore((s) => s.logoutCandidate);
  const logAction = useMockStore((s) => s.logAction);

  useEffect(() => {
    if (!session) navigate("/candidate-login", { replace: true });
  }, [session, navigate]);

  const candidate = useMemo(
    () => candidates.find((c) => c.id === session?.candidateId),
    [candidates, session]
  );

  const myOpps = useMemo(
    () => opportunities.filter((o) => o.candidateId === session?.candidateId),
    [opportunities, session]
  );

  if (!candidate) return null;

  const open = myOpps.filter((o) => o.status === "matched");
  const submitted = myOpps.filter((o) => o.status === "submitted" || o.status === "interviewing");
  const won = myOpps.filter((o) => o.status === "awarded");
  const total = myOpps.filter((o) => o.status !== "matched").length;
  const winRate = total > 0 ? Math.round((won.length / total) * 100) : 0;

  const handleAccept = (id: string, title: string) => {
    acceptOpportunity(id);
    logAction({
      type: "submission",
      actor: candidate.name,
      actorType: "vendor",
      summary: `${candidate.name} accepted opportunity: ${title}`,
      vendor: candidate.vendor,
    });
    toast.success("Application submitted");
  };

  const handleDecline = (id: string, title: string) => {
    declineOpportunity(id);
    logAction({
      type: "flag",
      actor: candidate.name,
      actorType: "vendor",
      summary: `${candidate.name} declined opportunity: ${title}`,
      vendor: candidate.vendor,
    });
    toast("Opportunity declined");
  };

  const handleLogout = () => {
    logoutCandidate();
    navigate("/candidate-login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar">
              <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
              Vendflow <span className="text-muted-foreground font-normal">/ Candidate</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {candidate.avatarInitials}
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium leading-tight text-foreground">{candidate.name}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{candidate.vendor}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-1 font-heading text-[28px] font-semibold tracking-tight text-foreground">
            Hi {candidate.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 max-w-xl text-[14px] text-muted-foreground">
            You have <span className="font-semibold text-foreground">{open.length} new {open.length === 1 ? "opportunity" : "opportunities"}</span> matched to your profile.
          </p>
        </motion.section>

        {/* KPIs */}
        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <KPI icon={Sparkles} label="New matches" value={open.length} accent="text-primary" bg="bg-primary/10" />
          <KPI icon={Clock} label="In progress" value={submitted.length} accent="text-warning" bg="bg-warning/10" />
          <KPI icon={Award} label="Awarded" value={won.length} accent="text-success" bg="bg-success/10" />
          <KPI icon={TrendingUp} label="Win rate" value={`${winRate}%`} accent="text-accent" bg="bg-accent/10" />
        </section>

        {/* Profile + opportunities */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Profile card */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-[14px] font-semibold text-primary">
                  {candidate.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-heading text-[14px] font-semibold text-foreground">{candidate.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{candidate.title}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-[12px]">
                <Row label="Seniority" value={candidate.seniority} />
                <Row label="Location" value={candidate.location} icon={MapPin} />
                <Row label="Day rate" value={`$${candidate.rate}/h`} />
                <Row label="Vendor" value={candidate.vendor} />
                <Row label="Status" value={
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    candidate.availability === "available" && "bg-success/10 text-success",
                    candidate.availability === "engaged" && "bg-muted text-muted-foreground",
                    candidate.availability === "interviewing" && "bg-warning/10 text-warning",
                  )}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {candidate.availability}
                  </span>
                } />
              </dl>
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s) => (
                    <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Opportunities */}
          <div className="space-y-6">
            <Section title="New matches" subtitle="AI-recommended opportunities aligned to your profile" count={open.length}>
              {open.length === 0 ? (
                <Empty>No new matches right now. We'll notify you the moment one appears.</Empty>
              ) : (
                open.map((o) => (
                  <OpportunityCard
                    key={o.id}
                    opp={o}
                    actions={
                      <>
                        <button
                          onClick={() => handleDecline(o.id, o.rfqTitle)}
                          className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Decline
                        </button>
                        <button
                          onClick={() => handleAccept(o.id, o.rfqTitle)}
                          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          One-click apply <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </>
                    }
                  />
                ))
              )}
            </Section>

            <Section title="In progress" subtitle="Submitted or in interview" count={submitted.length}>
              {submitted.length === 0 ? (
                <Empty>Nothing in flight.</Empty>
              ) : (
                submitted.map((o) => <OpportunityCard key={o.id} opp={o} />)
              )}
            </Section>

            <Section title="Won" subtitle="Contracts awarded" count={won.length}>
              {won.length === 0 ? (
                <Empty>No wins yet — keep going.</Empty>
              ) : (
                won.map((o) => <OpportunityCard key={o.id} opp={o} />)
              )}
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value, accent, bg }: { icon: any; label: string; value: number | string; accent: string; bg: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", bg, accent)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-2 font-heading text-[24px] font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function Section({ title, subtitle, count, children }: { title: string; subtitle: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-[16px] font-semibold text-foreground">{title}</h2>
          <p className="text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function OpportunityCard({ opp, actions }: { opp: ReturnType<typeof useMockStore.getState>["opportunities"][number]; actions?: React.ReactNode }) {
  const statusStyles: Record<string, string> = {
    matched: "bg-primary/10 text-primary",
    submitted: "bg-warning/10 text-warning",
    interviewing: "bg-accent/10 text-accent",
    awarded: "bg-success/10 text-success",
    rejected: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg border border-border bg-card p-4 shadow-card transition-all hover:border-primary/40 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="truncate text-[13px] font-medium text-foreground">{opp.rfqTitle}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusStyles[opp.status])}>
              {opp.status}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            <span>{opp.client}</span>
            <span>·</span>
            <span>{opp.role}</span>
            <span>·</span>
            <span className="font-medium text-foreground">{opp.rateRange}</span>
            {opp.submittedAt && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {opp.submittedAt}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Match</span>
            <span className="font-mono text-[13px] font-semibold text-foreground">{opp.matchScore}%</span>
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
      {/* Match bar */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${opp.matchScore}%` }}
        />
      </div>
    </motion.div>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1 font-medium text-foreground">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        {value}
      </dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-sunken p-6 text-center text-[13px] text-muted-foreground">
      {children}
    </div>
  );
}