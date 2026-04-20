import { create } from "zustand";

export type AuditType = "recommendation" | "approval" | "dispatch" | "flag" | "override" | "ingest" | "submission" | "award";

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: AuditType;
  actor: string;
  actorType: "ai" | "human" | "vendor" | "system";
  summary: string;
  vendor?: string;
  inputData?: { label: string; value: string }[];
  aiReasoning?: string;
  decision?: string;
  decisionStatus?: "approved" | "pending" | "rejected";
  references?: string[];
  isNew?: boolean;
}

export interface RateRow {
  id: string;
  role: string;
  seniority: string;
  geography: string;
  vendorRate: number;
  marketMedian: number;
  variance: number;
  vendor: string;
  flagged: boolean;
  source?: string;
  isNew?: boolean;
}

export interface RFQ {
  id: string;
  title: string;
  role: string;
  seniority: string;
  location: string;
  duration: string;
  rateRange: string;
  vendors: string[];
  status: "draft" | "dispatched" | "closed";
  createdAt: string;
}

export interface ProposalEntry {
  id: string;
  rfqId: string;
  vendor: string;
  initials: string;
  rate: string;
  rateNum: number;
  candidate: string;
  status: "submitted" | "awarded" | "rejected";
  submittedAt: string;
  isNew?: boolean;
}

interface MockStore {
  rates: RateRow[];
  rfqs: RFQ[];
  proposals: ProposalEntry[];
  auditLog: AuditEvent[];

  addRates: (rows: RateRow[]) => void;
  addRFQ: (rfq: RFQ) => void;
  addProposal: (p: ProposalEntry) => void;
  awardProposal: (id: string) => void;
  logAction: (e: Omit<AuditEvent, "id" | "timestamp" | "isNew">) => void;
  approveAudit: (id: string) => void;
  rejectAudit: (id: string) => void;
  clearNewFlag: (id: string) => void;
}

const now = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const seedRates: RateRow[] = [
  { id: "r1", role: "Backend Engineer", seniority: "Senior", geography: "Stockholm", vendorRate: 145, marketMedian: 118, variance: 22.9, vendor: "TechCorp Nordic", flagged: true },
  { id: "r2", role: "DevOps Engineer", seniority: "Mid", geography: "Berlin", vendorRate: 112, marketMedian: 105, variance: 6.7, vendor: "CloudWorks GmbH", flagged: false },
  { id: "r3", role: "Data Scientist", seniority: "Senior", geography: "London", vendorRate: 165, marketMedian: 140, variance: 17.9, vendor: "DataMinds UK", flagged: true },
  { id: "r4", role: "Frontend Engineer", seniority: "Junior", geography: "Warsaw", vendorRate: 58, marketMedian: 62, variance: -6.5, vendor: "SoftHouse PL", flagged: false },
  { id: "r5", role: "QA Engineer", seniority: "Mid", geography: "Lisbon", vendorRate: 72, marketMedian: 70, variance: 2.9, vendor: "QualityFirst PT", flagged: false },
  { id: "r6", role: "Solutions Architect", seniority: "Senior", geography: "Amsterdam", vendorRate: 178, marketMedian: 148, variance: 20.3, vendor: "ArchTech NL", flagged: true },
  { id: "r7", role: "Project Manager", seniority: "Senior", geography: "Copenhagen", vendorRate: 130, marketMedian: 125, variance: 4.0, vendor: "NordManage", flagged: false },
  { id: "r8", role: "Security Engineer", seniority: "Mid", geography: "Helsinki", vendorRate: 125, marketMedian: 108, variance: 15.7, vendor: "SecureNorth", flagged: true },
];

const seedAudit: AuditEvent[] = [
  { id: "a1", timestamp: "2026-03-27 09:42", type: "recommendation", actor: "Vendflow AI", actorType: "ai", summary: "Recommended NordOps AB for Senior DevOps RFQ (Match: 94%)", vendor: "NordOps AB" },
  { id: "a2", timestamp: "2026-03-27 09:45", type: "approval", actor: "Anna Karlsson", actorType: "human", summary: "Approved RFQ dispatch to NordOps AB", decisionStatus: "approved" },
  { id: "a3", timestamp: "2026-03-27 10:12", type: "dispatch", actor: "System", actorType: "system", summary: "RFQ-2026-047 sent to 3 vendors (NordOps, TechFlow, CodeCraft)" },
  { id: "a4", timestamp: "2026-03-26 16:30", type: "flag", actor: "Vendflow AI", actorType: "ai", summary: "Rate anomaly detected: TechFlow Senior Backend +22% vs market", vendor: "TechFlow Nordic" },
  { id: "a5", timestamp: "2026-03-26 14:15", type: "recommendation", actor: "Vendflow AI", actorType: "ai", summary: "Auto-ranked proposals for RFQ-2026-044. Top pick: NordOps AB" },
  { id: "a6", timestamp: "2026-03-26 11:00", type: "override", actor: "Erik Lindqvist", actorType: "human", summary: "Overrode AI recommendation — selected CodeCraft Solutions for compliance reasons", decisionStatus: "approved" },
  { id: "a7", timestamp: "2026-03-25 15:22", type: "approval", actor: "Anna Karlsson", actorType: "human", summary: "Pending: Approve rate card update for NordOps AB (3 roles affected)", decisionStatus: "pending" },
  { id: "a8", timestamp: "2026-03-25 09:05", type: "flag", actor: "Vendflow AI", actorType: "ai", summary: "Vendor reliability alert: CodeCraft response time degraded by 40%", vendor: "CodeCraft Solutions" },
];

const seedRFQs: RFQ[] = [];
const seedProposals: ProposalEntry[] = [];

let counter = 1000;
const nextId = () => `id-${++counter}`;

export const useMockStore = create<MockStore>((set) => ({
  rates: seedRates,
  rfqs: seedRFQs,
  proposals: seedProposals,
  auditLog: seedAudit,

  addRates: (rows) =>
    set((s) => ({
      rates: [...rows.map((r) => ({ ...r, isNew: true })), ...s.rates],
    })),

  addRFQ: (rfq) => set((s) => ({ rfqs: [rfq, ...s.rfqs] })),

  addProposal: (p) =>
    set((s) => ({ proposals: [{ ...p, isNew: true }, ...s.proposals] })),

  awardProposal: (id) =>
    set((s) => ({
      proposals: s.proposals.map((p) =>
        p.id === id ? { ...p, status: "awarded" } : p
      ),
    })),

  logAction: (e) =>
    set((s) => ({
      auditLog: [
        { ...e, id: nextId(), timestamp: now(), isNew: true },
        ...s.auditLog,
      ],
    })),

  approveAudit: (id) =>
    set((s) => ({
      auditLog: s.auditLog.map((a) =>
        a.id === id ? { ...a, decisionStatus: "approved" } : a
      ),
    })),

  rejectAudit: (id) =>
    set((s) => ({
      auditLog: s.auditLog.map((a) =>
        a.id === id ? { ...a, decisionStatus: "rejected" } : a
      ),
    })),

  clearNewFlag: (id) =>
    set((s) => ({
      auditLog: s.auditLog.map((a) => (a.id === id ? { ...a, isNew: false } : a)),
      rates: s.rates.map((r) => (r.id === id ? { ...r, isNew: false } : r)),
      proposals: s.proposals.map((p) => (p.id === id ? { ...p, isNew: false } : p)),
    })),
}));

// Helpers
export function inferVarianceColor(v: number) {
  if (Math.abs(v) > 15 && v > 0) return "destructive";
  if (v > 0) return "warning";
  return "success";
}