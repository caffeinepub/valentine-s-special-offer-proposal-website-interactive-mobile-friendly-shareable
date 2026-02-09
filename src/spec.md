# Specification

## Summary
**Goal:** Allow users to start mining immediately after saving a mining configuration, even if no MiningState exists yet, and ensure the dashboard and events update correctly.

**Planned changes:**
- Backend: Make `getMiningState` return a sensible default non-null MiningState when a MiningConfig exists but MiningState is missing.
- Backend: Update `startMining` to transition to Active without requiring an existing MiningState, while preserving cumulative totals across start/stop cycles and handling “already active” calls predictably.
- Frontend: Update dashboard gating logic to rely on saved `miningConfig` (not `miningState.config`) so start/stop controls appear whenever configuration exists; otherwise show an English configuration-required message with a clear path to Settings.
- Frontend: Ensure Start/Stop triggers react-query invalidation/refetch so status flips to Active/Inactive within one refresh cycle; show actionable English toast errors on failures without stuck loading.
- Both: Ensure the recent activity/events list updates immediately after Start/Stop (including first-ever start) and surfaces backend English errors when actions are rejected.

**User-visible outcome:** After saving Mining Settings, the dashboard shows Start/Stop controls and starting mining works on the first attempt; status and the recent activity list update right away, and any failures show clear English error messages.
