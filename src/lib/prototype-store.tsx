import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  AuditEntry,
  ContributionRequest,
  Engagement,
  EvidenceItem,
  SignalRule,
  ValueItem,
  auditSeed,
  engagements as engagementSeed,
  signalRules as ruleSeed,
  valueItems as valueSeed,
} from "./vendflow-data";

export interface RecordedDecision {
  engagementId: string;
  optionId: string;
  optionTitle: string;
  rationale: string;
  conditions: string;
  decidedBy: string;
  role: string;
  decidedOn: string;
  evidenceCited: string[];
}

export interface EvidenceCorrection {
  evidenceId: string;
  previousValue: string;
  newValue: string;
  reason: string;
  correctedBy: string;
  correctedOn: string;
}

interface StoreValue {
  engagements: Engagement[];
  rules: SignalRule[];
  value: ValueItem[];
  audit: AuditEntry[];
  decisions: RecordedDecision[];
  corrections: EvidenceCorrection[];
  currentUser: { name: string; role: string };
  correctEvidence: (engagementId: string, evidenceId: string, newValue: string, reason: string) => void;
  requestContribution: (engagementId: string, contributionId: string) => void;
  recordDecision: (input: Omit<RecordedDecision, "decidedOn" | "decidedBy" | "role">) => void;
  toggleRule: (ruleId: string) => void;
  updateRule: (ruleId: string, patch: Partial<SignalRule>) => void;
  addRule: (rule: SignalRule) => void;
  log: (entry: Omit<AuditEntry, "id" | "at">) => void;
  advanceValueStage: (valueId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const nowIso = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

const CURRENT_USER = { name: "Johan Lindqvist", role: "IT Manager, Platform" };

export function PrototypeStoreProvider({ children }: { children: React.ReactNode }) {
  const [engagements, setEngagements] = useState<Engagement[]>(engagementSeed);
  const [rules, setRules] = useState<SignalRule[]>(ruleSeed);
  const [value, setValue] = useState<ValueItem[]>(valueSeed);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [decisions, setDecisions] = useState<RecordedDecision[]>([]);
  const [corrections, setCorrections] = useState<EvidenceCorrection[]>([]);

  const log = useCallback((entry: Omit<AuditEntry, "id" | "at">) => {
    setAudit((prev) => [{ ...entry, id: uid("aud"), at: nowIso() }, ...prev]);
  }, []);

  const correctEvidence = useCallback<StoreValue["correctEvidence"]>(
    (engagementId, evidenceId, newValue, reason) => {
      let previous = "";
      let label = "";
      setEngagements((prev) =>
        prev.map((eng) => {
          if (eng.id !== engagementId) return eng;
          return {
            ...eng,
            evidence: eng.evidence.map((ev: EvidenceItem) => {
              if (ev.id !== evidenceId) return ev;
              previous = ev.value;
              label = ev.label;
              return {
                ...ev,
                value: newValue,
                confidence: "Verified",
                observedOn: nowIso().slice(0, 10),
                source: `${ev.source} · corrected by ${CURRENT_USER.name}`,
              };
            }),
          };
        }),
      );
      setCorrections((prev) => [
        {
          evidenceId,
          previousValue: previous,
          newValue,
          reason,
          correctedBy: CURRENT_USER.name,
          correctedOn: nowIso(),
        },
        ...prev,
      ]);
      log({
        actor: CURRENT_USER.name,
        role: CURRENT_USER.role,
        action: `Corrected evidence "${label}" from ${previous || "—"} to ${newValue}`,
        engagementId,
        rationale: reason,
      });
    },
    [log],
  );

  const requestContribution = useCallback<StoreValue["requestContribution"]>(
    (engagementId, contributionId) => {
      let ask = "";
      let owner = "";
      setEngagements((prev) =>
        prev.map((eng) => {
          if (eng.id !== engagementId) return eng;
          return {
            ...eng,
            decisionState: eng.decisionState === "Needs review" ? "Awaiting contribution" : eng.decisionState,
            contributions: eng.contributions.map((c: ContributionRequest) => {
              if (c.id !== contributionId) return c;
              ask = c.ask;
              owner = c.owner;
              return { ...c, status: "Requested", dueOn: c.dueOn ?? nowIso().slice(0, 10) };
            }),
          };
        }),
      );
      log({
        actor: CURRENT_USER.name,
        role: CURRENT_USER.role,
        action: `Requested contribution from ${owner}: ${ask}`,
        engagementId,
      });
    },
    [log],
  );

  const recordDecision = useCallback<StoreValue["recordDecision"]>(
    (input) => {
      const entry: RecordedDecision = {
        ...input,
        decidedBy: CURRENT_USER.name,
        role: CURRENT_USER.role,
        decidedOn: nowIso(),
      };
      setDecisions((prev) => [entry, ...prev]);
      setEngagements((prev) =>
        prev.map((eng) =>
          eng.id === input.engagementId ? { ...eng, decisionState: "Decision recorded" } : eng,
        ),
      );
      setValue((prev) =>
        prev.map((v) =>
          v.engagementId === input.engagementId && v.stage === "Potential opportunity"
            ? {
                ...v,
                stage: "Agreed improvement",
                basis: `${v.basis} Decision recorded: ${input.optionTitle}.`,
                confirmedBy: `${CURRENT_USER.name}, ${CURRENT_USER.role}`,
                confirmedOn: nowIso().slice(0, 10),
              }
            : v,
        ),
      );
      log({
        actor: CURRENT_USER.name,
        role: CURRENT_USER.role,
        action: `Recorded decision: ${input.optionTitle}`,
        engagementId: input.engagementId,
        rationale: input.rationale,
        evidenceCited: input.evidenceCited,
      });
    },
    [log],
  );

  const toggleRule = useCallback<StoreValue["toggleRule"]>(
    (ruleId) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== ruleId) return r;
          log({
            actor: CURRENT_USER.name,
            role: CURRENT_USER.role,
            action: `${r.active ? "Paused" : "Activated"} signal rule "${r.name}"`,
          });
          return { ...r, active: !r.active };
        }),
      );
    },
    [log],
  );

  const updateRule = useCallback<StoreValue["updateRule"]>(
    (ruleId, patch) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== ruleId) return r;
          log({
            actor: CURRENT_USER.name,
            role: CURRENT_USER.role,
            action: `Updated signal rule "${r.name}"`,
            rationale: Object.keys(patch).join(", "),
          });
          return { ...r, ...patch };
        }),
      );
    },
    [log],
  );

  const addRule = useCallback<StoreValue["addRule"]>(
    (rule) => {
      setRules((prev) => [rule, ...prev]);
      log({
        actor: CURRENT_USER.name,
        role: CURRENT_USER.role,
        action: `Created signal rule "${rule.name}"`,
        rationale: rule.plainLanguage,
      });
    },
    [log],
  );

  const advanceValueStage = useCallback<StoreValue["advanceValueStage"]>(
    (valueId) => {
      const order = [
        "Potential opportunity",
        "Agreed improvement",
        "Operational realisation",
        "Verified impact",
      ] as const;
      setValue((prev) =>
        prev.map((v) => {
          if (v.id !== valueId) return v;
          const i = order.indexOf(v.stage);
          if (i === order.length - 1) return v;
          const next = order[i + 1];
          log({
            actor: CURRENT_USER.name,
            role: CURRENT_USER.role,
            action: `Moved "${v.label}" from ${v.stage} to ${next}`,
            engagementId: v.engagementId,
          });
          return {
            ...v,
            stage: next,
            confirmedBy: `${CURRENT_USER.name}, ${CURRENT_USER.role}`,
            confirmedOn: nowIso().slice(0, 10),
          };
        }),
      );
    },
    [log],
  );

  const api = useMemo<StoreValue>(
    () => ({
      engagements,
      rules,
      value,
      audit,
      decisions,
      corrections,
      currentUser: CURRENT_USER,
      correctEvidence,
      requestContribution,
      recordDecision,
      toggleRule,
      updateRule,
      addRule,
      log,
      advanceValueStage,
    }),
    [
      engagements,
      rules,
      value,
      audit,
      decisions,
      corrections,
      correctEvidence,
      requestContribution,
      recordDecision,
      toggleRule,
      updateRule,
      addRule,
      log,
      advanceValueStage,
    ],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function usePrototype() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("usePrototype must be used inside PrototypeStoreProvider");
  return ctx;
}
