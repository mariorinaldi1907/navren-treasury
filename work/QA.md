# QA / product review — 2 October 2026

## Automated
- Production TypeScript and Vite build passed.
- Eight model tests passed: fee accounting; default selection; relaxed deadline / cost priority; mandatory screening; corridor and size limits; impossible deadline; expiry / funds / authority gates; invalid inputs.
- Test discovery revealed lowest-cost weighting still preferred instant settlement despite a flexible deadline. Corrected weights and confirmed scheduled transfer wins.

## Browser
- Executed Overview → New payment → Compare → Review → Approve → Tracking → Reconciliation.
- Confirmed S$50,000 principal, S$106 economic cost, S$50,016 debit and THB 1,277,696 proceeds across views.
- Confirmed completed record in payment search, invoice matching and accounting sync.
- Opened recommendation disclosures and inspected complete review screen.
- Tested Suppliers, Integrations, Controls and Company navigation. Tested integration feedback and demo reset.
- Confirmed Luzon blocks all four routes and disables review.
- Confirmed flexible 7 Oct deadline + Lowest cost chooses S$70 scheduled route.
- Console error/warning capture empty during primary journey.
- Dashboard visually inspected at laptop width 1440 and mobile width 390. Document width equals viewport at 390. Comparison inspected at laptop and narrow width; horizontal table scrolling is intentional.

## PM / visual / polishing corrections
- Separate source principal, cash debit and economic cost; no double counting of FX spread.
- Make SGD explicit with S$ formatting.
- Keep IPS conceptual; screen results and integrations visibly simulated.
- Block duplicate invoice payment; remove funded invoices from open obligations; debit local balance consistently.
- Prevent historical records from auto-mutating when opened.
- Label pending destination value as expected until supplier credit.
- Align supplier-credit timestamp with route arrival; reconciliation follows it.
- Compact route detail rows, increase small text, strengthen muted contrast and mobile touch targets.
- Hide off-screen mobile nav from keyboard/accessibility traversal when closed.
- Bundle fonts locally for presentation resilience.
- Currency figures use tabular numerals; form fields have labels; visible focus outlines; native disclosure and select controls; disabled states include reasons.

## Review outcome and practical limits
The primary SME story is understandable through the product: one instruction, route trade-offs, mandatory controls, approval, tracking and reconciliation. Anti-generic review retained restrained wine/ivory/copper colors, serif editorial headings, compact lists and purposeful route imagery without decorative charts or AI chat.

This is a frontend academic prototype, not a compliance-certified or production-tested payments system. No live integrations, real approval identities, provider SLAs or full accessibility certification. Screen reader basics and responsive layouts are addressed; exhaustive assistive-technology and cross-browser testing remain production work.

## Final refinement pass — 2 October 2026

Preserved the original implementation in an ignored local baseline archive before changes. No local Git metadata existed; the existing private GitHub `main` branch was inspected and remained at `e30c7fc1c5e4c3686032f862cb9f52c2b96ee9bc` before delivery. No unrelated remote work was observed.

### Executed validation

- Clean lockfile install (`npm ci --ignore-scripts`), dependency tree and npm audit: 183 packages installed, no dependency errors, zero reported vulnerabilities. ESLint 9 emits an upstream support/deprecation warning; it remains compatible with this existing Vite/TypeScript stack.
- TypeScript, ESLint with zero warnings, 15 financial/control model tests and production build passed. A repeat test run was interrupted by the desktop sandbox resetting after a new user message; permissions were renewed and the complete verification command rerun.
- Actual in-app browser inspection of Overview, instruction, comparison, expanded evaluation, approval and reconciliation at 1440px laptop dimensions. A 390px mobile form/comparison/navigation check showed no horizontal document overflow.
- Keyboard activation used throughout, with visible focus on disclosure/buttons. Native form labels, textual eligibility states, disabled invalid actions and a skip-to-content link verified.
- Default Siam / INV-2048 / S$50,000 / 3 Oct 15:00 SGT / Balanced journey completed. Regional instant: S$106 economic cost = S$90 embedded FX spread + S$16 explicit fee; account debit S$50,016; supplier receipt THB1,277,696 at 25.55392. These values remain in the approved payment snapshot and transaction record.
- Scheduled transfer remains visible at S$70, marked MISSES DEADLINE with 5 Oct 10:00 expected versus 3 Oct 15:00 required. Derived S$36 explanation and 4 evaluated / 3 eligible / 1 deadline-excluded counts verified.
- Lowest cost with flexible 7 Oct deadline selects Scheduled transfer. Fastest arrival selects Regional instant. Failed Luzon beneficiary screening blocks all routes and disables review.
- Back, edit instruction, route selection and Change route verified. Selecting Treasury partner carries S$145 economic cost, S$50,020 debit and THB1,276,800 to review.
- A real five-minute quote expiry was observed on Review: approval disabled. Compare displayed the expired alert; refresh restored 300 seconds and enabled the correct route for approval.
- Accelerated tracking completed with credit at 10:15 and reconciliation at 10:16. Invoice match, accounting sync and ledger status completed. Payment search/reopening and supplier View payment preserve the same record. Dashboard balance becomes S$198,634 and the open invoice disappears.
- Sidebar Suppliers, Integrations, Controls, Company and Overview work. Browser console error/warning logs were empty in both test tabs.

### PM / credibility review

The product now makes one instruction, eligibility gates, transparent route trade-offs, explainable recommendation, SME approval and accounting handoff visible without changing the brand or four-step journey. Cost and debit are explicitly distinct. Simulation labels remain on banking, screening, reliability and integrations. No live provider, regulatory approval or autonomous execution claims were added.

Remaining prototype boundaries: deterministic fixtures, a fixed scenario date, five real-minute quotes, accelerated tracking, browser-local records, reference-only invoice matching, and an execution hold rather than a real multi-user second-approval workflow. No application deployment performed.

Production preview (`npm run preview -- --port 4173`) was opened and the default instruction/comparison smoke-tested after the final build; the rendered counts/rationale were correct and console logs contained no errors or warnings. Delivery used authenticated GitHub browser commits because this source directory has no Git metadata and the CLI/connector has no access to the private repository. Existing remote history is preserved; teammates can clone/pull `main` normally.
