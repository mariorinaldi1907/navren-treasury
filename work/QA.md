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
