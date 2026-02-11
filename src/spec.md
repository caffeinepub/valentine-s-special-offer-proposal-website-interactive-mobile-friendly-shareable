# Specification

## Summary
**Goal:** Pivot the app into “Taskora Global,” a reward-based earning platform with VIP tiers, manual USDT transfers, and an admin panel (removing exchange-style navigation/pages/copy).

**Planned changes:**
- Replace exchange-focused landing/header/navigation with Taskora Global earning-focused structure and branding (site metadata + header brand).
- Add user pages: Dashboard (balance, VIP status, earnings summary, recent activity), Earn (Watch Ads / Complete Tasks with claim submission + Pending/Approved/Rejected history), VIP (tier comparison + upgrade request pending until admin approval), Transfers (manual USDT TRC20/ERC20 deposit addresses + deposit/withdraw requests with pending/completed statuses and clear manual-processing disclosure).
- Add Admin Panel (admin-only) to manage USDT deposit addresses, process deposits/withdrawals, approve/reject earning claims, and approve/reject VIP upgrade requests.
- Update backend Motoko actor with persistent models + methods for accounts (balance/VIP), earning items/claims, VIP requests, transfers (addresses + requests), and admin-only processing with consistent access control and clear English unauthorized errors.
- Add frontend React Query queries/mutations for new backend APIs with cache invalidation so dashboards/histories update immediately after user/admin actions.
- Apply a cohesive new visual theme for a modern rewards/fintech SaaS look, distinct from the current exchange styling.
- Add and use new Taskora Global static image assets (served from `frontend/public/assets/generated`) and replace the current exchange logo usage.

**User-visible outcome:** Users see a Taskora Global rewards platform (not a crypto exchange) where they can view their balance/VIP status, submit earning claims, request VIP upgrades, and create manual USDT deposit/withdraw requests; admins can manage addresses and approve/complete all pending requests from a restricted admin panel.
