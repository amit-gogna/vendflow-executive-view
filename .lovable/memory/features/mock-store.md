---
name: Mock Store Architecture
description: Frontend-only mock data layer (Zustand) cross-linking all 5 MVP modules
type: feature
---
Frontend mockup uses `src/lib/mock-store.ts` (Zustand) as the single source of truth.

State: `rates`, `rfqs`, `proposals`, `auditLog`.
Actions: `addRates`, `addRFQ`, `addProposal`, `awardProposal`, `logAction`, `approveAudit`, `rejectAudit`.

Cross-module flows (no backend, all simulated with setTimeout):
- Rate Intelligence upload → addRates + logAction (ingest)
- BulkImportModal → addRates (bulk) + logAction
- AI Sourcing "Send to Vendors" → addRFQ + addProposal (delayed) + logAction (dispatch)
- Vendor Portal submit → addProposal + logAction (submission)
- Proposals "Award" → awardProposal + logAction (award) — Decision Gate modal
- Governance: timeline reads auditLog; filters work; Approve/Reject mutates store; Export downloads JSON
- Sidebar shows live badges from store counts (pending approvals, new proposals, RFQs, new rates)

No real backend / Supabase / LLM. All "AI" is simulated.
**Why:** User explicitly requested frontend-only mockup.