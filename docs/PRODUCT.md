# Navren

One international payment instruction, compared across available routes with transparent costs, mandatory controls, explicit approval and accounting reconciliation.

## Stack and setup

React 19, TypeScript 5.8, Vite 6, Lucide icons, CSS and locally bundled DM Sans / Libre Caslon Display fonts. No backend, credentials or external accounts. Node 22+ recommended; built and tested with Node 25.2.0. Exact installed dependency versions are in package-lock.json.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. For a production bundle: `npm run build`. For financial/control tests: `npm test`. The local npm cache avoids writing to your global cache. The app has not been published.

## Presentation Demo Path

1. Open Overview. Point to open invoices, account balance and estimated routing savings.
2. Click **New international payment**.
3. Keep **Siam Precision Components Co., Ltd.**, **SGD 50,000**, **INV-2048**, **Supplier invoice**, tomorrow at **15:00 SGT**, and **Balanced**.
4. Click **Compare available routes**. The short sequence checks availability, quotes, settlement, controls and deadline.
5. Compare all four routes. **Regional instant** is recommended: S$106 economic cost versus S$375 for the correspondent bank. Account debit is S$50,016 and supplier receives THB 1,277,696.
6. Expand **Why not the cheapest route?** The S$70 scheduled transfer misses the deadline. Expand **How was this recommendation determined?** to show weights and mandatory gates.
7. Click **Review selected route**. Show debit, FX, destination amount, invoice and controls.
8. Click **Approve & send**. No real funds move.
9. Watch accelerated tracking finish in approximately seven seconds. The ledger shows invoice matched, accounting sync complete and reconciled.
10. Click **View transaction record**, then search `10482` to find the new payment.
11. Before repeating, choose **Company → Reset demo payments → Overview**.

### Optional committee questions

- Deadline trade-off: New payment → **Flexible · 7 Oct** → **Lowest cost** → Compare. Scheduled transfer becomes recommended at S$70.
- Screening gate: Choose Luzon Assembly. All four routes are blocked and review is disabled.
- Dual authorization: Enter S$150,000, compare, review. The prototype holds execution for a second approver.
- Quote expiry: quotes last five real minutes; refresh is required afterward. Arrival estimates use the fixed demo clock.
- Other corridors: Indonesia has no conceptual IPS route. TH/MY IPS is capped at S$75,000 as a prototype availability assumption.

## Main screens

Overview; Payments with search/status filter/CSV export; payment instruction; route comparison and explanation; review and approval; tracking and accounting handoff; Suppliers; Integrations; Controls; Company/reset.

## Financial conventions

- SGD principal is converted. Supplier proceeds = principal × mid-market rate × (1 − spread).
- Debit = principal + transfer fee + estimated intermediary charges.
- Economic cost = principal × spread + transfer fee + estimated intermediary charges. Embedded spread is not added to the debit again.
- Savings compare the same principal against the correspondent-bank economic-cost estimate. Different quotes deliver different destination amounts; this is not a fixed-destination-amount product.
- All amounts, balances, FX rates, reliability, provider availability, screening results, fees and settlement times are fictional.
- Mock intermediary fees are charged to sender; actual providers may handle deductions differently.
- Monetary arithmetic uses JavaScript numbers for this prototype. Production requires decimal or currency-minor-unit arithmetic and provider-specific rounding.

## Prototype assumptions and boundaries

The demo clock is 2 Oct 2026, 10:00 Singapore time. Timeline events compress hours into seconds; they are not actual processing speed measurements. Historical records are static; newly created records persist in browser localStorage. Data is local to the browser and resettable, not secure or shared storage. App navigation uses internal state; a refresh returns to Overview.

The recommendation is a deterministic explainable simulation of an orchestration engine, with no live LLM. Availability, screening and deadline are hard gates. Cost, settlement speed, reliability, FX quality and reconciliation are weighted ranking inputs; a separate FX factor intentionally emphasizes quote quality even though spread contributes to cost. Balanced weights are 35/25/15/15/10; Lowest cost 75/0/10/5/10; Fastest arrival 25/45/15/5/10. Weights total 100%. Compliance is never traded against price.

Company KYB and beneficiary checks are fixtures, not actual AML or sanctions screening. The second approver workflow is represented as an execution hold, not a real multi-user approval queue. New demo invoices match by reference; production requires invoice currency, outstanding amount, tolerance and partial-payment checks. All quoted providers are assumed to support the mock accounting adapter. No stablecoin route or live Project Nexus connection is claimed. There is no MAS licence or regulatory approval claim.

Names considered: Navren, Meridia, Ternwell. Navren selected for brevity and a navigation association. Basic public web search did not surface an obvious major payments company with this exact name; this is not trademark clearance.

## Research and future architecture

- BIS Project Nexus: https://www.bis.org/project/nexus — interconnection of domestic instant payment systems; used only as conceptual context.
- MAS payment regulations and guidance: https://www.mas.gov.sg/regulation/payments/regulations-and-guidance — context for visible risk controls, not a compliance assessment.

Production would require licensed provider partnerships, corridor/limit and holiday-aware settlement rules, live quote adapters and quote locking, secure authentication/RBAC, server-enforced policy and dual approval, idempotent payment submission, durable transaction state machines, verified provider webhooks, sanctions/AML services with human escalation, immutable audit records, secure ledger integration, exact currency arithmetic, invoice reconciliation tolerances and operational recovery. An optional LLM may explain structured evidence but cannot authorize transactions or override controls.

## Validation

See `../work/QA.md` for the executed checks and review outcomes. Eight automated model tests cover calculations, deadline recommendation, screening, route availability, expiry, funds, authorization and invalid instructions. Browser review covers the complete default journey, transaction search, navigation, integration simulation, reset, blocked beneficiary and the later-deadline recommendation.
