# Specification

## Summary
**Goal:** Ensure the Earn page always shows working Ads/Tasks based on the user’s VIP tier, and update the Deposit flow to include optional transaction ID plus a locally stored screenshot proof (with backend support for storing the tx id/note only).

**Planned changes:**
- Add a simple VIP-tier-based Earn catalog (Basic/Bronze/Silver/Gold/Diamond) that always displays placeholder Ads and Tasks even if no backend earning items exist.
- Track and display daily remaining quotas for Ads and Tasks per VIP tier, resetting by the user’s local calendar day.
- Implement a simplified “Watch Ad” flow: 30-second countdown, then allow claim submission, decrementing the local daily Ad quota and showing an English success toast; disable when quota is exhausted.
- Implement a simplified “Complete Task” flow: minimal claim form, decrementing the local daily Task quota, and adding the claim to “Your Claims”; disable when quota is exhausted.
- Update the Deposit UI to include an optional Transaction ID input and a screenshot upload with local-only storage, preview, and an English note explaining screenshot stays on this device and deposits remain pending until admin approval.
- Extend backend deposit request records/API to accept and store an optional transaction ID/note and show it in Admin “Pending Deposits”.
- Update frontend deposit submission to send the optional transaction ID to the backend and keep React Query invalidation so transfer history updates immediately; show friendly English errors.

**User-visible outcome:** Users always see Ads and Tasks in Earn with VIP-based daily limits and simple claim flows, and can submit deposit requests with an optional transaction ID plus a locally stored screenshot proof while deposits remain pending until admin approval.
