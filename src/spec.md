# Specification

## Summary
**Goal:** Pivot the app into a Bitcoin mining-themed web dashboard with a cohesive mining/Bitcoin visual style and no Valentine content or “educational/demo” wording in any user-facing text.

**Planned changes:**
- Replace Valentine proposal landing/header/main flow with Bitcoin mining-themed pages and copy (English-only), removing all Valentine-specific language, visuals, and CTAs.
- Add a mining dashboard UI with: Active/Inactive status, start/stop controls, current hashrate, session runtime, estimated earnings counters, and a recent activity/events list.
- Add authenticated user settings UI for mining configuration (profile name, target hashrate, power usage, electricity cost, Bitcoin payout address) with persistence via backend APIs.
- Extend the backend canister to store per-user mining configuration and mining state (active flag, timestamps, cumulative runtime/earnings, append-only events list) and expose methods to get state, update config, start, stop, and fetch events.
- Implement a payouts/withdrawals UI flow for signed-in users to request payouts to a Bitcoin address and view payout history pulled from the backend (including status updates).
- Replace the Valentine-themed visual system (colors/tokens/imagery usage) with a consistent Bitcoin/mining-themed style across the UI.
- Generate and swap in new Bitcoin/mining static image assets under `frontend/public/assets/generated`, removing usage of existing Valentine-generated images in primary hero/background areas.

**User-visible outcome:** Users sign in to a Bitcoin mining-themed dashboard where they can configure mining parameters, start/stop a mining session, view status/hashrate/runtime/estimated earnings and recent events, and request payouts while seeing payout history—all with consistent mining visuals and no Valentine or “educational/demo” wording.
