import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { email: "elin@nordops.se", name: "Elin Bergström", role: "Senior DevOps · Stockholm" },
  { email: "marcus@techflow.no", name: "Marcus Lindqvist", role: "Backend · Oslo" },
  { email: "sofia@codecraft.dk", name: "Sofia Hansen", role: "Full-Stack · Copenhagen" },
];

export default function CandidateLogin() {
  const navigate = useNavigate();
  const loginCandidate = useMockStore((s) => s.loginCandidate);
  const logAction = useMockStore((s) => s.logAction);

  const [email, setEmail] = useState("elin@nordops.se");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const candidate = loginCandidate(email.trim());
      setLoading(false);
      if (candidate) {
        logAction({
          type: "approval",
          actor: candidate.name,
          actorType: "human",
          summary: `Candidate signed in to portal (${candidate.email})`,
        });
        toast.success(`Welcome back, ${candidate.name.split(" ")[0]}`);
        navigate("/candidates");
      } else {
        toast.error("Invalid credentials");
      }
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background flourish */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[920px] overflow-hidden rounded-2xl border border-border bg-card shadow-elevated md:grid md:grid-cols-[1.1fr_1fr]"
      >
        {/* Left — brand panel */}
        <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-heading text-[16px] font-semibold tracking-tight text-sidebar-accent-foreground">
              Vendflow
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-sidebar-muted">
                Candidate portal
              </p>
              <h1 className="mt-2 font-heading text-[26px] font-semibold leading-tight text-sidebar-accent-foreground">
                Your opportunities,<br />in one calm place.
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-sidebar-foreground/80">
                Track open RFQs you're matched to, manage submissions, and respond in one click — no spreadsheets, no email chains.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-sidebar-border pt-5">
              <div>
                <p className="font-heading text-[20px] font-semibold text-sidebar-accent-foreground">94%</p>
                <p className="text-[11px] text-sidebar-muted">Avg. match</p>
              </div>
              <div>
                <p className="font-heading text-[20px] font-semibold text-sidebar-accent-foreground">2.1d</p>
                <p className="text-[11px] text-sidebar-muted">Time-to-respond</p>
              </div>
              <div>
                <p className="font-heading text-[20px] font-semibold text-sidebar-accent-foreground">38%</p>
                <p className="text-[11px] text-sidebar-muted">Win rate</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-sidebar-muted">
            © 2026 Vendflow · EU AI Act aligned
          </p>
        </div>

        {/* Right — form */}
        <div className="p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-[20px] font-semibold tracking-tight text-foreground">
                Sign in
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Access your candidate dashboard
              </p>
            </div>
            <Link
              to="/"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Buyer login →
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@vendor.com"
                  className="h-10 w-full rounded-md border border-input bg-surface-sunken pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[12px] font-medium text-foreground">
                  Password
                </label>
                <button type="button" className="text-[11px] font-medium text-muted-foreground hover:text-primary">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-md border border-input bg-surface-sunken pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-md border border-dashed border-border bg-surface-sunken p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Demo accounts
            </p>
            <ul className="mt-2 space-y-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email}>
                  <button
                    type="button"
                    onClick={() => setEmail(a.email)}
                    className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-[12px] hover:bg-card"
                  >
                    <span>
                      <span className="font-medium text-foreground">{a.name}</span>
                      <span className="ml-2 text-muted-foreground">{a.role}</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{a.email}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Any password works in demo mode.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}