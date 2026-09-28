/**
 * Single coherent fictional dataset for the Vendflow prototype.
 * All dates, rates and amounts below are demo data and must stay consistent
 * across every screen. Reference "today" for the dataset is 2026-09-28.
 */

export const TODAY = new Date("2026-09-28T00:00:00Z");

export type Currency = "EUR";

export type EngagementType =
  | "Individual contractor"
  | "Consultancy team"
  | "Deliverable project"
  | "Managed service";

export type Criticality = "Business critical" | "Important" | "Standard";

/**
 * The five recurring, high-impact decisions this prototype is designed around,
 * plus a closeout case for engagements already decided.
 */
export type UseCase =
  | "Renewal cliff"
  | "Scope change"
  | "Rate drift"
  | "Service failure"
  | "Tenure risk"
  | "Closeout";

export const useCaseLabels: Record<UseCase, { short: string; explain: string }> = {
  "Renewal cliff": {
    short: "Renewal cliff",
    explain: "A notice deadline is approaching and the contract renews itself if nothing is done.",
  },
  "Scope change": {
    short: "Scope change",
    explain: "A change request adds cost or time to agreed work.",
  },
  "Rate drift": {
    short: "Rate drift",
    explain: "What is billed no longer matches the agreed rate or seniority mix.",
  },
  "Service failure": {
    short: "Service failure",
    explain: "Service targets were missed often enough to open a remedy or exit right.",
  },
  "Tenure risk": {
    short: "Tenure risk",
    explain: "A long-running individual engagement carries employment and dependency risk.",
  },
  Closeout: {
    short: "Closeout",
    explain: "Decided already, with conditions still to verify.",
  },
};

export type DecisionState =
  | "Needs review"
  | "In review"
  | "Awaiting contribution"
  | "Decision recorded"
  | "Monitoring";

export type EvidenceConfidence = "Verified" | "Unverified" | "Stale" | "Conflicting" | "Missing";

export type EvidenceLens = "Commercial" | "Delivery" | "Risk & legal" | "Finance";

export interface EvidenceItem {
  id: string;
  lens: EvidenceLens;
  label: string;
  value: string;
  detail: string;
  source: string;
  observedOn: string;
  confidence: EvidenceConfidence;
  limitation?: string;
  editable?: boolean;
}

export interface OptionItem {
  id: string;
  title: string;
  summary: string;
  commercialEffect: string;
  deliveryEffect: string;
  riskEffect: string;
  effort: "Low" | "Medium" | "High";
  annualDelta: number; // negative = saving
  recommended?: boolean;
}

export interface ContributionRequest {
  id: string;
  ask: string;
  owner: string;
  role: string;
  status: "Requested" | "Received" | "Not requested" | "Overdue";
  dueOn?: string;
  response?: string;
}

export interface Engagement {
  id: string;
  reference: string;
  title: string;
  supplier: string;
  supplierId: string;
  type: EngagementType;
  criticality: Criticality;
  useCase: UseCase;
  owner: string;
  ownerRole: string;
  costCentre: string;
  currency: Currency;
  rate?: number; // hourly, EUR
  benchmarkRate?: number;
  committedAnnual: number;
  spendToDate: number;
  startedOn: string;
  contractExpiry: string;
  noticeDeadline: string;
  noticePeriodDays: number;
  autoRenews: boolean;
  decisionState: DecisionState;
  situation: string;
  whyItMatters: string;
  /** What is financially at stake in this specific decision. */
  stakeAmount: number;
  stakeLabel: string;
  /** The single sentence that says what happens if nobody acts. */
  ifNothingHappens: string;
  /** Pre-drafted rationale the decision owner edits before recording. */
  draftRationale: string;
  signalIds: string[];
  evidence: EvidenceItem[];
  options: OptionItem[];
  contributions: ContributionRequest[];
  openQuestions: string[];
}

export interface SignalRule {
  id: string;
  name: string;
  plainLanguage: string;
  scope: string;
  level: "Personal view" | "Team rule" | "Organisation control";
  owner: string;
  active: boolean;
  leadTimeDays: number;
  minValue: number;
  criticality: Criticality[];
  requiresApproval: boolean;
  assumptions: string[];
  matchedEngagementIds: string[];
}

export type ValueStage =
  | "Potential opportunity"
  | "Agreed improvement"
  | "Operational realisation"
  | "Verified impact";

export interface ValueItem {
  id: string;
  label: string;
  engagementId: string;
  amountAnnual: number;
  stage: ValueStage;
  basis: string;
  confirmedBy?: string;
  confirmedOn?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  engagementId?: string;
  rationale?: string;
  evidenceCited?: string[];
}

export const daysUntil = (iso: string) =>
  Math.round((new Date(iso).getTime() - TODAY.getTime()) / 86_400_000);

export const eur = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/* ------------------------------------------------------------------ */
/* Engagements                                                         */
/* ------------------------------------------------------------------ */

export const engagements: Engagement[] = [
  {
    id: "eng-1041",
    reference: "ENG-1041",
    title: "Cloud platform architecture lead",
    supplier: "Cybercom Nordics",
    supplierId: "sup-cyb",
    type: "Individual contractor",
    criticality: "Business critical",
    useCase: "Renewal cliff",
    owner: "Johan Lindqvist",
    ownerRole: "IT Manager, Platform",
    costCentre: "IT-PLATFORM-204",
    currency: "EUR",
    rate: 165,
    benchmarkRate: 142,
    committedAnnual: 297_000,
    spendToDate: 512_400,
    startedOn: "2024-04-01",
    contractExpiry: "2027-03-31",
    noticeDeadline: "2026-12-31",
    noticePeriodDays: 90,
    autoRenews: true,
    decisionState: "Needs review",
    situation:
      "Notice deadline falls in 94 days and the contract renews automatically for a further 12 months if no notice is given.",
    whyItMatters:
      "The engagement holds sole knowledge of the landing-zone design used by four migration workstreams, and its rate sits 16% above the current Nordic benchmark.",
    stakeAmount: 41_400,
    stakeLabel: "paid above market per year if it renews unchanged",
    ifNothingHappens:
      "The contract renews to 31 Mar 2028 at €165/h, with knowledge transfer and the expired security review still unaddressed.",
    draftRationale:
      "Continuing need for external platform architecture is confirmed to March 2028, but the contracted rate is 16% above the verified Nordic median. Counter at €148/h with a two-year term, documented handover of the landing-zone design as a deliverable, and a refreshed security review as a condition of signature. The June–July invoice variance of €4,455 is settled before the amendment is signed.",
    signalIds: ["rule-notice-90", "rule-rate-gap"],
    evidence: [
      {
        id: "ev-1",
        lens: "Commercial",
        label: "Contracted rate vs market",
        value: "€165/h vs €142/h median",
        detail:
          "16.2% above median for Cloud Architect, Nordics, senior band. Equivalent to €41,400 per year at the current 1,800-hour commitment.",
        source: "Nordic Tech Rate Index, Q3 2026",
        observedOn: "2026-08-14",
        confidence: "Verified",
        limitation: "42 observations; 11 from Sweden only, so the median may skew to Stockholm pricing.",
        editable: true,
      },
      {
        id: "ev-2",
        lens: "Commercial",
        label: "Rate review clause",
        value: "Annual indexation capped at 3%",
        detail:
          "Clause 7.3 permits a supplier-initiated increase once per contract year, capped at CPI or 3%, whichever is lower.",
        source: "Master services agreement, §7.3 (uploaded 12 Aug 2026)",
        observedOn: "2026-08-12",
        confidence: "Verified",
        editable: true,
      },
      {
        id: "ev-3",
        lens: "Delivery",
        label: "Delivery performance",
        value: "On track, 3 of 4 milestones early",
        detail:
          "Landing zone, identity federation and network segmentation delivered ahead of plan. Observability workstream is two weeks behind.",
        source: "Programme status report, week 38",
        observedOn: "2026-09-21",
        confidence: "Verified",
      },
      {
        id: "ev-4",
        lens: "Delivery",
        label: "Knowledge transfer",
        value: "Not confirmed",
        detail:
          "No documented handover of landing-zone design decisions. Internal platform team has not been named as a receiving party.",
        source: "No source on file",
        observedOn: "2026-09-28",
        confidence: "Missing",
        limitation: "Needs confirmation from the platform team before any exit or ramp-down option is viable.",
      },
      {
        id: "ev-5",
        lens: "Delivery",
        label: "Dependent workstreams",
        value: "4 active",
        detail:
          "Payments migration, data platform, branch network refresh and regulatory reporting all consume the landing-zone pattern.",
        source: "Programme dependency register",
        observedOn: "2026-09-15",
        confidence: "Verified",
      },
      {
        id: "ev-6",
        lens: "Risk & legal",
        label: "Notice obligation",
        value: "90 days before expiry",
        detail:
          "Written notice by 31 Dec 2026 to prevent automatic renewal to 31 Mar 2028. Contract expiry itself is 31 Mar 2027.",
        source: "Master services agreement, §12.1",
        observedOn: "2026-08-12",
        confidence: "Verified",
      },
      {
        id: "ev-7",
        lens: "Risk & legal",
        label: "Security review",
        value: "Expired 4 months ago",
        detail: "Supplier security assessment last completed 28 May 2026; policy requires review every 12 months for privileged access.",
        source: "Supplier assurance register",
        observedOn: "2026-05-28",
        confidence: "Stale",
        limitation: "Privileged production access is in scope, so a refreshed review is required before renewal.",
      },
      {
        id: "ev-8",
        lens: "Finance",
        label: "Budget position",
        value: "€297,000 committed, €63,000 headroom",
        detail:
          "FY27 platform budget holds €360,000 for external architecture. Invoiced to date across the engagement is €512,400.",
        source: "Finance ledger extract",
        observedOn: "2026-09-25",
        confidence: "Verified",
      },
      {
        id: "ev-9",
        lens: "Finance",
        label: "Invoice variance",
        value: "Two months conflict with timesheets",
        detail:
          "June and July invoices bill 168 hours each; approved timesheets show 152 and 161 hours. Difference is €4,455 at the contracted rate.",
        source: "Invoice set INV-2026-0611 / 0712 vs timesheet export",
        observedOn: "2026-09-02",
        confidence: "Conflicting",
        limitation: "Unresolved. Should be settled before agreeing new commercial terms.",
        editable: true,
      },
    ],
    options: [
      {
        id: "opt-a",
        title: "Renew unchanged",
        summary: "Let the contract auto-renew for 12 months at €165/h with no changes.",
        commercialEffect: "Keeps a 16% premium to benchmark. €41,400 above market over the year.",
        deliveryEffect: "No disruption to the four dependent workstreams.",
        riskEffect: "Leaves knowledge transfer unaddressed and the security review expired.",
        effort: "Low",
        annualDelta: 0,
      },
      {
        id: "opt-b",
        title: "Negotiate rate to benchmark",
        summary: "Counter at €148/h with a two-year term and a knowledge-transfer commitment.",
        commercialEffect: "€30,600 lower annual cost. Still 4% above median to reflect scarce platform knowledge.",
        deliveryEffect: "Continuity preserved; handover documentation becomes a contractual deliverable.",
        riskEffect: "Requires a refreshed security review as a condition of signature.",
        effort: "Medium",
        annualDelta: -30_600,
        recommended: true,
      },
      {
        id: "opt-c",
        title: "Convert to deliverable-based scope",
        summary: "Replace hourly billing with a fixed-price statement of work across four milestones.",
        commercialEffect: "€252,000 fixed for the remaining scope; removes hourly drift but adds change-request overhead.",
        deliveryEffect: "Clear acceptance criteria per milestone; less flexibility for unplanned platform work.",
        riskEffect: "Assumption quality becomes critical; scope gaps surface as change requests.",
        effort: "High",
        annualDelta: -45_000,
      },
      {
        id: "opt-d",
        title: "Ramp down and internalise",
        summary: "Six-month taper while an internal architect takes ownership.",
        commercialEffect: "€148,500 in the taper year, then no external cost.",
        deliveryEffect: "Depends on an internal hire that is not yet approved.",
        riskEffect: "High: knowledge transfer is unconfirmed and four workstreams depend on the pattern.",
        effort: "High",
        annualDelta: -148_500,
      },
    ],
    contributions: [
      {
        id: "con-1",
        ask: "Confirm whether a named internal owner can receive the landing-zone design",
        owner: "Anna Berg",
        role: "Head of Platform Engineering",
        status: "Requested",
        dueOn: "2026-10-09",
      },
      {
        id: "con-2",
        ask: "Refresh supplier security assessment for privileged production access",
        owner: "Marcus Öhman",
        role: "Information Security",
        status: "Overdue",
        dueOn: "2026-09-19",
      },
      {
        id: "con-3",
        ask: "Validate rate benchmark and prepare negotiation position",
        owner: "Priya Raman",
        role: "Procurement Lead",
        status: "Received",
        dueOn: "2026-09-22",
        response:
          "Benchmark holds. Recommend opening at €142/h, settling no higher than €150/h, and tying any increase to documented handover.",
      },
      {
        id: "con-4",
        ask: "Confirm FY27 budget treatment if term extends beyond March 2027",
        owner: "Elin Dahl",
        role: "Finance Business Partner",
        status: "Not requested",
      },
    ],
    openQuestions: [
      "Is continuing need for an external architecture lead confirmed beyond March 2027?",
      "Who receives the landing-zone design if the engagement ends?",
      "Should the June–July invoice variance be settled before new terms are agreed?",
    ],
  },
  {
    id: "eng-1088",
    reference: "ENG-1088",
    title: "Payments migration delivery team",
    supplier: "Nordlys Consulting",
    supplierId: "sup-nor",
    type: "Consultancy team",
    criticality: "Business critical",
    useCase: "Scope change",
    owner: "Sofia Almqvist",
    ownerRole: "Programme Director",
    costCentre: "IT-PAY-118",
    currency: "EUR",
    committedAnnual: 1_240_000,
    spendToDate: 806_500,
    startedOn: "2025-09-01",
    contractExpiry: "2027-08-31",
    noticeDeadline: "2027-05-31",
    noticePeriodDays: 90,
    autoRenews: false,
    decisionState: "Awaiting contribution",
    situation:
      "A change request adds €180,000 for regulatory reporting scope that was excluded from the original statement of work.",
    whyItMatters:
      "The change consumes the remaining programme contingency and the acceptance criteria for two milestones are ambiguous.",
    stakeAmount: 180_000,
    stakeLabel: "change request value awaiting a decision",
    ifNothingHappens:
      "The added scope stays unpriced and the regulatory reporting date slips past the supervisory expectation.",
    draftRationale:
      "The added regulatory reporting scope is needed, but the €180,000 price rests on a blended day rate with no role breakdown and two milestones have no measurable acceptance test. Approve in principle, conditional on a role-level price against schedule 2 and measurable acceptance criteria for milestones 3 and 4. Expected reduction of €22,000 and a two-week delay to the start of the added scope are accepted.",
    signalIds: ["rule-sow-change"],
    evidence: [
      {
        id: "ev-20",
        lens: "Commercial",
        label: "Change request value",
        value: "€180,000",
        detail: "Priced at blended €1,150/day across 156 days. No day-rate breakdown supplied.",
        source: "Change request CR-014, received 18 Sep 2026",
        observedOn: "2026-09-18",
        confidence: "Unverified",
        limitation: "Blended rate cannot be compared to the rate card without a role split.",
        editable: true,
      },
      {
        id: "ev-21",
        lens: "Delivery",
        label: "Acceptance criteria",
        value: "Ambiguous on 2 of 5 milestones",
        detail:
          "Milestones 3 and 4 state 'reporting capability demonstrated' with no measurable test or data-quality threshold.",
        source: "Statement of work v2.1, §4",
        observedOn: "2026-09-19",
        confidence: "Conflicting",
      },
      {
        id: "ev-22",
        lens: "Finance",
        label: "Remaining contingency",
        value: "€196,000",
        detail: "Approving the change leaves €16,000 of programme contingency for the final nine months.",
        source: "Programme financial tracker",
        observedOn: "2026-09-25",
        confidence: "Verified",
      },
    ],
    options: [
      {
        id: "opt-e",
        title: "Approve as submitted",
        summary: "Accept the change at €180,000 with the current wording.",
        commercialEffect: "Exhausts contingency to €16,000.",
        deliveryEffect: "No schedule change, but ambiguous acceptance remains.",
        riskEffect: "Disputes likely at milestone sign-off.",
        effort: "Low",
        annualDelta: 180_000,
      },
      {
        id: "opt-f",
        title: "Approve with tightened acceptance criteria",
        summary: "Request measurable criteria and a role-level rate breakdown before sign-off.",
        commercialEffect: "Expected €22,000 reduction once roles are priced against the rate card.",
        deliveryEffect: "Two-week delay to start of the added scope.",
        riskEffect: "Removes the main source of milestone dispute.",
        effort: "Medium",
        annualDelta: 158_000,
        recommended: true,
      },
      {
        id: "opt-g",
        title: "Defer to the next programme increment",
        summary: "Hold the scope until FY28 planning.",
        commercialEffect: "No cost this year.",
        deliveryEffect: "Regulatory reporting date slips beyond the supervisory expectation.",
        riskEffect: "Compliance exposure; needs legal opinion.",
        effort: "Low",
        annualDelta: 0,
      },
    ],
    contributions: [
      {
        id: "con-10",
        ask: "Draft measurable acceptance criteria for milestones 3 and 4",
        owner: "Sofia Almqvist",
        role: "Programme Director",
        status: "Requested",
        dueOn: "2026-10-03",
      },
      {
        id: "con-11",
        ask: "Opinion on regulatory reporting deadline if deferred",
        owner: "Hanna Ek",
        role: "Legal Counsel",
        status: "Requested",
        dueOn: "2026-10-06",
      },
    ],
    openQuestions: [
      "What is the role-level composition behind the blended day rate?",
      "Is the reporting deadline externally fixed?",
    ],
  },
  {
    id: "eng-0977",
    reference: "ENG-0977",
    title: "End-user device managed service",
    supplier: "Helix Managed IT",
    supplierId: "sup-hel",
    type: "Managed service",
    criticality: "Important",
    useCase: "Service failure",
    owner: "Tomas Ek",
    ownerRole: "Service Owner, Workplace",
    costCentre: "IT-WORK-090",
    currency: "EUR",
    committedAnnual: 640_000,
    spendToDate: 1_880_000,
    startedOn: "2023-07-01",
    contractExpiry: "2027-06-30",
    noticeDeadline: "2027-03-31",
    noticePeriodDays: 90,
    autoRenews: true,
    decisionState: "Monitoring",
    situation: "Service credits triggered in three of the last four months against the incident resolution target.",
    whyItMatters:
      "Repeated breaches give a termination-for-cause right that expires if not exercised within 60 days of the last breach.",
    signalIds: ["rule-service-credit"],
    evidence: [
      {
        id: "ev-30",
        lens: "Delivery",
        label: "Resolution target",
        value: "Missed 3 of 4 months",
        detail: "P2 resolution within 8 hours achieved on 91%, 88% and 93% against a 95% target.",
        source: "Service review pack, Sep 2026",
        observedOn: "2026-09-10",
        confidence: "Verified",
      },
      {
        id: "ev-31",
        lens: "Commercial",
        label: "Service credits applied",
        value: "€18,400 year to date",
        detail: "Credits capped at 8% of monthly charge; the cap was reached in July.",
        source: "Invoice reconciliation",
        observedOn: "2026-09-12",
        confidence: "Verified",
      },
      {
        id: "ev-32",
        lens: "Risk & legal",
        label: "Termination right window",
        value: "Open until 9 Nov 2026",
        detail: "Clause 15.4 allows termination for repeated breach within 60 days of the most recent failure.",
        source: "Service agreement, §15.4",
        observedOn: "2026-09-10",
        confidence: "Verified",
      },
    ],
    options: [
      {
        id: "opt-h",
        title: "Agree a remediation plan",
        summary: "Formal 90-day improvement plan with weekly reporting and a credit uplift if missed.",
        commercialEffect: "No direct cost change; stronger credit terms.",
        deliveryEffect: "Keeps the incumbent and avoids transition risk.",
        riskEffect: "Preserves the termination right only if explicitly reserved in writing.",
        effort: "Medium",
        annualDelta: 0,
        recommended: true,
      },
      {
        id: "opt-i",
        title: "Exercise termination for cause",
        summary: "Serve notice under clause 15.4 and run a replacement tender.",
        commercialEffect: "Transition cost estimated at €95,000.",
        deliveryEffect: "Six-month transition across 4,200 devices.",
        riskEffect: "High operational risk during transition.",
        effort: "High",
        annualDelta: 95_000,
      },
    ],
    contributions: [
      {
        id: "con-20",
        ask: "Confirm whether the termination right should be reserved in the remediation letter",
        owner: "Hanna Ek",
        role: "Legal Counsel",
        status: "Received",
        dueOn: "2026-09-24",
        response: "Reserve it expressly. Agreeing a plan without reservation waives the clause 15.4 right.",
      },
    ],
    openQuestions: ["Would a replacement supplier accept the current device estate without a refresh?"],
  },
  {
    id: "eng-1102",
    reference: "ENG-1102",
    title: "Data platform engineering squad",
    supplier: "Cybercom Nordics",
    supplierId: "sup-cyb",
    type: "Consultancy team",
    criticality: "Important",
    owner: "Johan Lindqvist",
    ownerRole: "IT Manager, Platform",
    costCentre: "IT-DATA-141",
    currency: "EUR",
    rate: 138,
    benchmarkRate: 135,
    committedAnnual: 745_000,
    spendToDate: 310_800,
    startedOn: "2026-02-01",
    contractExpiry: "2027-01-31",
    noticeDeadline: "2026-11-02",
    noticePeriodDays: 90,
    autoRenews: false,
    decisionState: "In review",
    situation: "Continuing need is confirmed but the squad shape has drifted from the agreed profile mix.",
    whyItMatters: "Two senior profiles were replaced by mid-level engineers while the rate stayed unchanged.",
    signalIds: ["rule-notice-90", "rule-profile-drift"],
    evidence: [
      {
        id: "ev-40",
        lens: "Commercial",
        label: "Profile mix vs agreement",
        value: "2 seniors billed, 4 agreed",
        detail: "Blended rate should fall to €129/h at the current mix. Overcharge estimated at €13,500 to date.",
        source: "Timesheet roles vs schedule 2",
        observedOn: "2026-09-08",
        confidence: "Unverified",
        limitation: "Role titles in timesheets are supplier-maintained and not independently verified.",
        editable: true,
      },
      {
        id: "ev-41",
        lens: "Delivery",
        label: "Throughput",
        value: "Stable",
        detail: "Delivery velocity unchanged over two quarters despite the profile change.",
        source: "Delivery metrics export",
        observedOn: "2026-09-20",
        confidence: "Verified",
      },
    ],
    options: [
      {
        id: "opt-j",
        title: "Reprice to actual mix",
        summary: "Adjust the blended rate to €129/h and credit the difference.",
        commercialEffect: "€48,000 annual reduction plus €13,500 credit.",
        deliveryEffect: "None; team stays as is.",
        riskEffect: "Low.",
        effort: "Medium",
        annualDelta: -48_000,
        recommended: true,
      },
      {
        id: "opt-k",
        title: "Restore the agreed seniority mix",
        summary: "Require two senior engineers back on the squad at the current rate.",
        commercialEffect: "No change in cost.",
        deliveryEffect: "Onboarding of two new profiles over four weeks.",
        riskEffect: "Medium; availability not confirmed.",
        effort: "Medium",
        annualDelta: 0,
      },
    ],
    contributions: [
      {
        id: "con-30",
        ask: "Verify timesheet role titles against CVs on file",
        owner: "Priya Raman",
        role: "Procurement Lead",
        status: "Requested",
        dueOn: "2026-10-02",
      },
    ],
    openQuestions: ["Are the current engineers delivering at senior level despite their titles?"],
  },
  {
    id: "eng-1115",
    reference: "ENG-1115",
    title: "Identity modernisation fixed-price project",
    supplier: "Aurora Digital",
    supplierId: "sup-aur",
    type: "Deliverable project",
    criticality: "Standard",
    owner: "Karin Sund",
    ownerRole: "Delivery Manager",
    costCentre: "IT-SEC-073",
    currency: "EUR",
    committedAnnual: 410_000,
    spendToDate: 287_000,
    startedOn: "2026-01-15",
    contractExpiry: "2026-12-15",
    noticeDeadline: "2026-11-15",
    noticePeriodDays: 30,
    autoRenews: false,
    decisionState: "Decision recorded",
    situation: "Final milestone accepted with two conditions recorded at sign-off.",
    whyItMatters: "Conditions must be verified before the retention payment is released in December.",
    signalIds: [],
    evidence: [
      {
        id: "ev-50",
        lens: "Delivery",
        label: "Milestone acceptance",
        value: "5 of 5 accepted",
        detail: "Final acceptance signed 12 Sep 2026 with conditions on documentation and load testing evidence.",
        source: "Acceptance certificate AC-1115-05",
        observedOn: "2026-09-12",
        confidence: "Verified",
      },
      {
        id: "ev-51",
        lens: "Finance",
        label: "Retention held",
        value: "€41,000",
        detail: "10% retention released on evidence of both conditions being met.",
        source: "Contract schedule 4",
        observedOn: "2026-09-12",
        confidence: "Verified",
      },
    ],
    options: [],
    contributions: [
      {
        id: "con-40",
        ask: "Provide load-test evidence pack",
        owner: "Aurora Digital",
        role: "Supplier",
        status: "Requested",
        dueOn: "2026-11-30",
      },
    ],
    openQuestions: [],
  },
];

export const engagementById = (id: string) => engagements.find((e) => e.id === id);

/* ------------------------------------------------------------------ */
/* Signal rules                                                        */
/* ------------------------------------------------------------------ */

export const signalRules: SignalRule[] = [
  {
    id: "rule-notice-90",
    name: "Business-critical renewal review",
    plainLanguage:
      "Review business-critical engagements 90 days before their notice deadline when continuing need has not been confirmed.",
    scope: "Business critical, committed value above €250,000",
    level: "Team rule",
    owner: "Priya Raman, Procurement Lead",
    active: true,
    leadTimeDays: 90,
    minValue: 250_000,
    criticality: ["Business critical"],
    requiresApproval: true,
    assumptions: [
      "Continuing need counts as confirmed only when the budget owner has recorded it in the current quarter.",
      "Notice deadline is taken from the contract clause, not from contract expiry.",
      "Engagements already in review are not raised again.",
    ],
    matchedEngagementIds: ["eng-1041", "eng-1102"],
  },
  {
    id: "rule-rate-gap",
    name: "Rate above benchmark",
    plainLanguage: "Flag engagements where the contracted rate is more than 12% above the current market median.",
    scope: "All hourly engagements with a benchmark match",
    level: "Team rule",
    owner: "Priya Raman, Procurement Lead",
    active: true,
    leadTimeDays: 0,
    minValue: 0,
    criticality: ["Business critical", "Important", "Standard"],
    requiresApproval: false,
    assumptions: [
      "Benchmark requires at least 25 observations in the role and region.",
      "Comparison uses median, not mean.",
    ],
    matchedEngagementIds: ["eng-1041"],
  },
  {
    id: "rule-sow-change",
    name: "Change request over threshold",
    plainLanguage: "Raise a review when a change request exceeds €100,000 or 10% of the original contract value.",
    scope: "Deliverable projects and consultancy teams",
    level: "Organisation control",
    owner: "Finance governance",
    active: true,
    leadTimeDays: 0,
    minValue: 100_000,
    criticality: ["Business critical", "Important", "Standard"],
    requiresApproval: true,
    assumptions: ["Cumulative changes are assessed together, not individually."],
    matchedEngagementIds: ["eng-1088"],
  },
  {
    id: "rule-service-credit",
    name: "Repeated service credit",
    plainLanguage: "Raise a review when service credits are triggered in three of any four consecutive months.",
    scope: "Managed services",
    level: "Team rule",
    owner: "Tomas Ek, Service Owner",
    active: true,
    leadTimeDays: 0,
    minValue: 0,
    criticality: ["Business critical", "Important", "Standard"],
    requiresApproval: false,
    assumptions: ["A month counts as a breach when any target in the service schedule is missed."],
    matchedEngagementIds: ["eng-0977"],
  },
  {
    id: "rule-profile-drift",
    name: "Profile mix drift",
    plainLanguage: "Flag consultancy teams where the billed seniority mix differs from the agreed mix for two months.",
    scope: "Consultancy teams",
    level: "Personal view",
    owner: "Johan Lindqvist, IT Manager",
    active: false,
    leadTimeDays: 0,
    minValue: 0,
    criticality: ["Business critical", "Important"],
    requiresApproval: false,
    assumptions: ["Role titles come from supplier timesheets and are not independently verified."],
    matchedEngagementIds: ["eng-1102"],
  },
];

/* ------------------------------------------------------------------ */
/* Value ledger                                                        */
/* ------------------------------------------------------------------ */

export const valueItems: ValueItem[] = [
  {
    id: "val-1",
    label: "Architecture lead rate gap",
    engagementId: "eng-1041",
    amountAnnual: 41_400,
    stage: "Potential opportunity",
    basis: "Benchmark gap of €23/h over 1,800 contracted hours. Not agreed with the supplier.",
  },
  {
    id: "val-2",
    label: "Data squad reprice to actual mix",
    engagementId: "eng-1102",
    amountAnnual: 48_000,
    stage: "Potential opportunity",
    basis: "Depends on verification of timesheet role titles.",
  },
  {
    id: "val-3",
    label: "Change request scope tightening",
    engagementId: "eng-1088",
    amountAnnual: 22_000,
    stage: "Agreed improvement",
    basis: "Supplier accepted role-level pricing on 24 Sep 2026; amendment not yet signed.",
    confirmedBy: "Priya Raman, Procurement Lead",
    confirmedOn: "2026-09-24",
  },
  {
    id: "val-4",
    label: "Device service credit recovery",
    engagementId: "eng-0977",
    amountAnnual: 18_400,
    stage: "Operational realisation",
    basis: "Credits applied to July, August and September invoices. Awaiting finance confirmation of receipt.",
    confirmedBy: "Elin Dahl, Finance Business Partner",
    confirmedOn: "2026-09-12",
  },
  {
    id: "val-5",
    label: "Identity project fixed-price conversion",
    engagementId: "eng-1115",
    amountAnnual: 36_500,
    stage: "Verified impact",
    basis: "Actual cost €410,000 against a €446,500 time-and-materials forecast. Verified in the FY26 close.",
    confirmedBy: "Elin Dahl, Finance Business Partner",
    confirmedOn: "2026-09-05",
  },
];

/* ------------------------------------------------------------------ */
/* Audit trail                                                         */
/* ------------------------------------------------------------------ */

export const auditSeed: AuditEntry[] = [
  {
    id: "aud-1",
    at: "2026-09-26T09:14:00Z",
    actor: "Vendflow assistant",
    role: "Prepared work",
    action: "Assembled renewal evidence for ENG-1041 and flagged 1 missing and 2 unreliable facts",
    engagementId: "eng-1041",
  },
  {
    id: "aud-2",
    at: "2026-09-24T15:02:00Z",
    actor: "Priya Raman",
    role: "Procurement Lead",
    action: "Recorded negotiation position for ENG-1041",
    engagementId: "eng-1041",
    rationale: "Benchmark verified at €142/h median. Opening position €142/h, ceiling €150/h.",
    evidenceCited: ["Nordic Tech Rate Index, Q3 2026"],
  },
  {
    id: "aud-3",
    at: "2026-09-24T11:30:00Z",
    actor: "Hanna Ek",
    role: "Legal Counsel",
    action: "Returned contribution on ENG-0977 termination right",
    engagementId: "eng-0977",
    rationale: "Remediation plan must expressly reserve the clause 15.4 right.",
    evidenceCited: ["Service agreement, §15.4"],
  },
  {
    id: "aud-4",
    at: "2026-09-19T08:45:00Z",
    actor: "Sofia Almqvist",
    role: "Programme Director",
    action: "Rejected change request CR-014 as submitted on ENG-1088",
    engagementId: "eng-1088",
    rationale: "Acceptance criteria for milestones 3 and 4 are not measurable and the day rate is not broken down.",
    evidenceCited: ["Statement of work v2.1, §4", "Change request CR-014"],
  },
  {
    id: "aud-5",
    at: "2026-09-12T16:20:00Z",
    actor: "Karin Sund",
    role: "Delivery Manager",
    action: "Accepted final milestone on ENG-1115 with two conditions",
    engagementId: "eng-1115",
    rationale: "Functionality demonstrated. Documentation and load-test evidence outstanding; retention held.",
    evidenceCited: ["Acceptance certificate AC-1115-05"],
  },
];

/* ------------------------------------------------------------------ */
/* Rate benchmark reference data                                       */
/* ------------------------------------------------------------------ */

export interface BenchmarkRow {
  id: string;
  role: string;
  region: string;
  band: string;
  contracted?: number;
  median: number;
  lower: number;
  upper: number;
  observations: number;
  observedOn: string;
  engagementId?: string;
  note?: string;
}

export const benchmarkRows: BenchmarkRow[] = [
  {
    id: "bm-1",
    role: "Cloud architect",
    region: "Nordics",
    band: "Senior",
    contracted: 165,
    median: 142,
    lower: 128,
    upper: 158,
    observations: 42,
    observedOn: "2026-08-14",
    engagementId: "eng-1041",
    note: "11 of 42 observations are Stockholm only.",
  },
  {
    id: "bm-2",
    role: "Data engineer",
    region: "Nordics",
    band: "Blended squad",
    contracted: 138,
    median: 135,
    lower: 121,
    upper: 149,
    observations: 66,
    observedOn: "2026-08-14",
    engagementId: "eng-1102",
  },
  {
    id: "bm-3",
    role: "Identity specialist",
    region: "Nordics",
    band: "Senior",
    median: 151,
    lower: 138,
    upper: 166,
    observations: 19,
    observedOn: "2026-06-30",
    note: "Fewer than 25 observations, so this comparator is indicative only.",
  },
  {
    id: "bm-4",
    role: "Service desk analyst",
    region: "Nordics",
    band: "Standard",
    median: 58,
    lower: 49,
    upper: 67,
    observations: 140,
    observedOn: "2026-08-14",
  },
  {
    id: "bm-5",
    role: "Programme manager",
    region: "Nordics",
    band: "Senior",
    median: 149,
    lower: 132,
    upper: 171,
    observations: 51,
    observedOn: "2026-08-14",
  },
];

export interface Supplier {
  id: string;
  name: string;
  engagements: number;
  annualSpend: number;
  deliveryScore: number;
  commercialScore: number;
  assuranceStatus: "Current" | "Review due" | "Expired";
  lastReview: string;
  note: string;
}

export const suppliers: Supplier[] = [
  {
    id: "sup-cyb",
    name: "Cybercom Nordics",
    engagements: 2,
    annualSpend: 1_042_000,
    deliveryScore: 82,
    commercialScore: 58,
    assuranceStatus: "Expired",
    lastReview: "2026-05-28",
    note: "Strong delivery record; rates above benchmark on the architecture engagement.",
  },
  {
    id: "sup-nor",
    name: "Nordlys Consulting",
    engagements: 1,
    annualSpend: 1_240_000,
    deliveryScore: 76,
    commercialScore: 64,
    assuranceStatus: "Current",
    lastReview: "2026-04-11",
    note: "Change requests priced on blended rates without role breakdown.",
  },
  {
    id: "sup-hel",
    name: "Helix Managed IT",
    engagements: 1,
    annualSpend: 640_000,
    deliveryScore: 61,
    commercialScore: 71,
    assuranceStatus: "Current",
    lastReview: "2026-02-20",
    note: "Service credits triggered in three of the last four months.",
  },
  {
    id: "sup-aur",
    name: "Aurora Digital",
    engagements: 1,
    annualSpend: 410_000,
    deliveryScore: 88,
    commercialScore: 79,
    assuranceStatus: "Review due",
    lastReview: "2025-11-30",
    note: "Delivered fixed-price identity project below forecast cost.",
  },
];
