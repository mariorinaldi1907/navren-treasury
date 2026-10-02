import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Plug,
  ShieldCheck,
  Settings,
  Plus,
  Check,
  ChevronRight,
  Clock,
  Search,
  RefreshCw,
  Download,
  Menu,
  X,
  Route,
  CheckCircle2,
} from "lucide-react";
import {
  money,
  date,
  NOW,
  suppliers,
  initial,
  quotes,
  recommended,
  validate,
  sendGuard,
  history,
  deadlineTime,
  quoteExpired,
  quoteSecondsRemaining,
  type Instruction,
  type Payment,
  type Quote,
} from "./model";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/libre-caslon-display/400.css";
import "./styles.css";
import { RouteEvaluation } from "./RouteEvaluation";
const nav = [
  ["Overview", LayoutDashboard],
  ["Payments", ArrowLeftRight],
  ["Suppliers", Users],
  ["Integrations", Plug],
  ["Controls", ShieldCheck],
  ["Company", Settings],
] as const;
const steps = [
  "Instruction",
  "Compare routes",
  "Review & approve",
  "Track & reconcile",
];
function Badge({
  children,
  tone = "good",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}
function PaymentTable({
  compact = false,
  all,
  filter,
  query,
  inspect,
}: {
  compact?: boolean;
  all: Payment[];
  filter: string;
  query: string;
  inspect: (p: Payment) => void;
}) {
  const ps = all.filter(
    (p) =>
      (filter === "All statuses" || p.status === filter) &&
      (
        p.id +
        " " +
        suppliers.find((s) => s.id === p.instruction.supplierId)!.name
      )
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Supplier / reference</th>
            <th>Corridor</th>
            <th className="num">Amount sent</th>
            <th>Route</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {ps.slice(0, compact ? 4 : 100).map((p) => {
            const s = suppliers.find((s) => s.id === p.instruction.supplierId)!;
            return (
              <tr key={p.id}>
                <td>
                  <button
                    className="text-button supplier-link"
                    onClick={() => inspect(p)}
                  >
                    {s.short}
                  </button>
                  <small>{p.id}</small>
                </td>
                <td>
                  <span className="country small">{s.code}</span> SG → {s.code}
                </td>
                <td className="num strong">{money(p.instruction.amount)}</td>
                <td>{p.quote.name}</td>
                <td>
                  <Badge tone={p.status === "Processing" ? "warm" : "good"}>
                    {p.status}
                  </Badge>
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={"View " + p.id}
                    onClick={() => inspect(p)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!ps.length && (
        <div className="empty">No payments match these filters.</div>
      )}
    </div>
  );
}
function App() {
  const [page, setPage] = useState("Overview"),
    [mobile, setMobile] = useState(false),
    [stage, setStage] = useState(0),
    [i, setI] = useState<Instruction>(initial),
    [routes, setRoutes] = useState<Quote[]>([]),
    [selected, setSelected] = useState(""),
    [quoteAt, setQuoteAt] = useState(0),
    [loading, setLoading] = useState(false),
    [loadStep, setLoadStep] = useState(0),
    [error, setError] = useState(""),
    [tick, setTick] = useState(0),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All statuses"),
    [active, setActive] = useState<Payment | null>(null),
    [progress, setProgress] = useState(0),
    [toast, setToast] = useState(""),
    [saved, setSaved] = useState<Payment[]>(() => {
      try {
        return JSON.parse(localStorage.getItem("navren-payments") || "[]");
      } catch {
        return [];
      }
    }),
    [company, setCompany] = useState(
      () =>
        localStorage.getItem("navren-company") || "Straits Circuit Pte. Ltd.",
    );
  const all = [...saved, ...history],
    supplier = suppliers.find((s) => s.id === i.supplierId)!,
    chosen = routes.find((r) => r.id === selected),
    best = recommended(routes, i.priority),
    balance = 248650 - saved.reduce((a, p) => a + p.quote.debit, 0),
    expired = quoteAt > 0 && quoteExpired(quoteAt);
  useEffect(() => {
    const t = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadStep((s) => Math.min(s + 1, 4)), 280);
    const done = setTimeout(() => {
      const q = quotes(i);
      setRoutes(q);
      setSelected(
        (current) =>
          q.find((r) => r.id === current && r.eligible)?.id ||
          recommended(q, i.priority)?.id ||
          "",
      );
      setQuoteAt(Date.now());
      setStage(1);
      setLoading(false);
    }, 1500);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [loading, i]);
  useEffect(() => {
    if (
      stage !== 3 ||
      !active ||
      active.status === "Reconciled" ||
      !saved.some((p) => p.id === active.id)
    )
      return;
    const t = setInterval(() => setProgress((p) => Math.min(6, p + 1)), 1100);
    return () => clearInterval(t);
  }, [stage, active, saved]);
  useEffect(() => {
    if (progress === 6 && active && active.status !== "Reconciled") {
      const next = { ...active, status: "Reconciled" };
      setActive(next);
      setSaved((ps) => {
        const n = ps.map((p) => (p.id === next.id ? next : p));
        localStorage.setItem("navren-payments", JSON.stringify(n));
        return n;
      });
    }
  }, [progress, active]);
  function go(p: string) {
    setLoading(false);
    setPage(p);
    setMobile(false);
    setError("");
  }
  function start(id = "siam") {
    const s = suppliers.find((s) => s.id === id)!;
    setI({
      ...initial,
      supplierId: id,
      invoice: s.invoice,
      amount: s.amount,
      deadline:
        s.id === "siam"
          ? initial.deadline
          : "2026-10-0" + (6 + suppliers.indexOf(s) - 1) + "T15:00",
    });
    setStage(0);
    setSelected("");
    setLoading(false);
    setRoutes([]);
    setError("");
    setPage("New payment");
  }
  function retrieve() {
    const e = validate(i);
    setError(e);
    if (!e) {
      setLoadStep(0);
      setLoading(true);
    }
  }
  function approve() {
    if (!chosen) return;
    const e = saved.some(
      (p) =>
        p.instruction.invoice === i.invoice &&
        p.instruction.supplierId === i.supplierId,
    )
      ? "This invoice already has a demo payment. Use a new reference or reset the demo."
      : sendGuard(i, chosen, quoteAt, balance);
    setError(e);
    if (e) return;
    const p: Payment = {
      id: "PAY-2026-" + (10482 + saved.length),
      instruction: { ...i },
      quote: { ...chosen },
      status: "Processing",
      created: NOW,
    };
    const n = [p, ...saved];
    setSaved(n);
    localStorage.setItem("navren-payments", JSON.stringify(n));
    setActive(p);
    setProgress(0);
    setStage(3);
  }
  function inspect(p: Payment) {
    setActive(p);
    setProgress(p.status === "Reconciled" ? 6 : 2);
    setStage(3);
    setPage("New payment");
  }
  function exportCsv() {
    const rows = [
      "Reference,Supplier,Amount SGD,Route,Status",
      ...all.map((p) =>
        [
          p.id,
          suppliers.find((s) => s.id === p.instruction.supplierId)!.short,
          p.instruction.amount,
          p.quote.name,
          p.status,
        ].join(","),
      ),
    ];
    const u = URL.createObjectURL(
      new Blob([rows.join("\n")], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "navren-transactions.csv";
    a.click();
    URL.revokeObjectURL(u);
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("Overview");
          }}
        >
          <span className="brand-mark">n</span>navren
          <span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="avatar">SC</span>
          <div>
            <b>{company.replace(" Pte. Ltd.", "")}</b>
            <small>Singapore workspace</small>
          </div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={
                page === label ||
                (label === "Payments" && page === "New payment")
                  ? "nav active"
                  : "nav"
              }
              onClick={() => go(label)}
            >
              <Icon size={18} />
              {label}
              {label === "Payments" && (
                <span className="nav-count">{all.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sandbox">
            <span className="live-dot" /> PRESENTATION SANDBOX
            <p>
              Real decisions.
              <br />
              Simulated payments.
            </p>
          </div>
          <div className="profile">
            <span className="avatar">JL</span>
            <div>
              <b>Jamie Lim</b>
              <small>Finance manager</small>
            </div>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>
      <div className="shell">
        <header className="topbar">
          <div className="crumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </button>
            Workspace <ChevronRight size={14} /> <b>{page}</b>
          </div>
          <div className="top-right">
            <span className="demo-tag">DEMO · NO REAL FUNDS</span>
            <span className="clock">
              02 Oct 2026 <span>10:00 SGT</span>
            </span>
          </div>
        </header>
        <main id="main-content">
          {page === "Overview" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR CROSS-BORDER WORKSPACE</div>
                  <h1>A clearer route for every payment.</h1>
                  <p>Compare the cost. Meet the deadline. Keep control.</p>
                </div>
                <button className="primary" onClick={() => start()}>
                  <Plus size={18} /> New international payment
                </button>
              </div>
              <section className="metrics">
                <div>
                  <span>Available SGD balance</span>
                  <strong>{money(balance)}</strong>
                  <small>
                    <span className="live-dot" /> Demo operating account
                  </small>
                </div>
                <div>
                  <span>Cross-border volume</span>
                  <strong>
                    {money(all.reduce((a, p) => a + p.instruction.amount, 0))}
                  </strong>
                  <small>{all.length} payments in this demo period</small>
                </div>
                <div>
                  <span>Estimated routing savings</span>
                  <strong className="green">
                    {money(
                      all.reduce(
                        (a, p) =>
                          a +
                          Math.max(
                            0,
                            quotes(p.instruction)[0].cost - p.quote.cost,
                          ),
                        0,
                      ),
                    )}
                  </strong>
                  <small>Against correspondent bank estimates</small>
                </div>
              </section>
              <div className="dashboard-grid">
                <section className="panel obligations">
                  <div className="section-heading">
                    <div>
                      <div className="eyebrow">PAYABLES RADAR</div>
                      <h2>Next on your payment desk</h2>
                    </div>
                    <span className="subtle">
                      {
                        suppliers.filter(
                          (s) =>
                            !saved.some(
                              (p) => p.instruction.invoice === s.invoice,
                            ),
                        ).length
                      }{" "}
                      open invoices
                    </span>
                  </div>
                  {suppliers
                    .filter(
                      (s) =>
                        !saved.some((p) => p.instruction.invoice === s.invoice),
                    )
                    .map((s) => (
                      <div className="obligation" key={s.id}>
                        <span className={"country country-" + s.code}>
                          {s.code}
                        </span>
                        <div className="obligation-name">
                          <b>{s.short}</b>
                          <small>
                            {s.invoice} · {s.country}
                          </small>
                        </div>
                        <div className="obligation-amount">
                          <b>{money(s.amount)}</b>
                          <small>
                            {s.id === "siam"
                              ? "Due tomorrow, 15:00"
                              : "Due " + (5 + suppliers.indexOf(s)) + " Oct"}
                          </small>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={"Pay " + s.short}
                          onClick={() => start(s.id)}
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </div>
                    ))}
                  <div className="panel-foot">
                    <Clock size={15} />
                    <span>
                      {saved.some((p) => p.instruction.invoice === "INV-2048")
                        ? "Nearest supplier obligation funded in this demo."
                        : "One invoice due within 30 hours. Compare routes before approving."}
                    </span>
                  </div>
                </section>
                <section className="insight">
                  <div className="eyebrow">THE ORCHESTRATION ADVANTAGE</div>
                  <div className="route-art">
                    <span>SG</span>
                    <svg viewBox="0 0 230 90" aria-hidden="true">
                      <path d="M0 45 C90 45 115 8 230 8 M0 45 H230 M0 45 C90 45 115 82 230 82" />
                      <circle cx="150" cy="45" r="5" />
                    </svg>
                    <div>
                      <span>Bank</span>
                      <span className="highlight">Instant ↗</span>
                      <span>Partner</span>
                    </div>
                  </div>
                  <h2>
                    One instruction.
                    <br />
                    More informed decisions.
                  </h2>
                  <p>
                    Cost, arrival and controls, compared together. You make the
                    final call.
                  </p>
                  <button onClick={() => start()} className="light-button">
                    Find your next route <ArrowRight size={17} />
                  </button>
                  <small>
                    Illustrative routes · availability varies by corridor
                  </small>
                </section>
              </div>
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">PAYMENT ACTIVITY</div>
                    <h2>Recent payments</h2>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => go("Payments")}
                  >
                    View all payments <ArrowRight size={16} />
                  </button>
                </div>
                <PaymentTable
                  compact
                  all={all}
                  filter="All statuses"
                  query=""
                  inspect={inspect}
                />
              </section>
              <div className="bottom-strips">
                <button onClick={() => go("Integrations")}>
                  <Plug size={18} />
                  <div>
                    <b>Books connected</b>
                    <small>Demo ledger · automatic invoice matching</small>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => go("Controls")}>
                  <ShieldCheck size={18} />
                  <div>
                    <b>Controls in place</b>
                    <small>
                      1 beneficiary awaiting review · mandatory gates
                    </small>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
          {page === "New payment" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">INTERNATIONAL PAYMENTS</div>
                  <h1>
                    {stage === 3
                      ? "From approval to accounted for."
                      : "One payment. The right route."}
                  </h1>
                  <p>
                    {stage === 3
                      ? "A complete record of your payment and its accounting journey."
                      : "Transparent trade-offs, with you in control at every step."}
                  </p>
                </div>
                <button className="secondary" onClick={() => go("Payments")}>
                  All payments <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="stepper">
                {steps.map((s, n) => (
                  <div
                    className={
                      stage === n ? "current" : stage > n ? "done" : ""
                    }
                    key={s}
                  >
                    <span>{stage > n ? <Check size={15} /> : n + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
              {loading ? (
                <section className="loading panel" aria-live="polite">
                  <div className="loading-icon">
                    <Route size={34} />
                  </div>
                  <h2>Finding a route that fits.</h2>
                  <p>Comparing providers against your payment instruction.</p>
                  {[
                    "Checking route availability",
                    "Normalizing simulated FX quotes",
                    "Estimating settlement",
                    "Applying mandatory controls",
                    "Evaluating your supplier deadline",
                  ].map((s, n) => (
                    <div key={s} className={n <= loadStep ? "loaded" : ""}>
                      {n < loadStep ? (
                        <Check size={16} />
                      ) : (
                        <span className="loading-dot" />
                      )}
                      {s}
                    </div>
                  ))}
                </section>
              ) : (
                <>
                  {stage === 0 && (
                    <div className="form-grid">
                      <form
                        className="panel form-panel"
                        onSubmit={(e) => {
                          e.preventDefault();
                          retrieve();
                        }}
                      >
                        <div className="section-heading">
                          <h2>Payment instruction</h2>
                          <Badge tone="neutral">01 / 04</Badge>
                        </div>
                        <label>
                          Supplier
                          <select
                            value={i.supplierId}
                            onChange={(e) => {
                              const s = suppliers.find(
                                (s) => s.id === e.target.value,
                              )!;
                              setI({
                                ...i,
                                supplierId: s.id,
                                invoice: s.invoice,
                                amount: s.amount,
                              });
                            }}
                          >
                            {suppliers.map((s) => (
                              <option value={s.id} key={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="supplier-summary">
                          <span className="country">{supplier.code}</span>
                          <div>
                            <b>
                              {supplier.country} · {supplier.currency}
                            </b>
                            <small>Beneficiary account {supplier.bank}</small>
                          </div>
                          <Badge tone={supplier.screened ? "good" : "warm"}>
                            {supplier.screened
                              ? "Screening passed"
                              : "Review required"}
                          </Badge>
                        </div>
                        <div className="deadline-presets">
                          <span>Demo deadline:</span>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              setI({ ...i, deadline: "2026-10-03T15:00" })
                            }
                          >
                            Tomorrow
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              setI({ ...i, deadline: "2026-10-07T15:00" })
                            }
                          >
                            Flexible · 7 Oct
                          </button>
                        </div>
                        <div className="fields">
                          <label>
                            Amount to convert (SGD)
                            <input
                              type="number"
                              min="0.01"
                              max="500000"
                              step="0.01"
                              value={i.amount}
                              onChange={(e) =>
                                setI({ ...i, amount: Number(e.target.value) })
                              }
                              required
                            />
                          </label>
                          <label>
                            Supplier receives in
                            <input
                              readOnly
                              value={
                                supplier.currency + " · " + supplier.country
                              }
                            />
                          </label>
                          <label>
                            Invoice reference
                            <input
                              value={i.invoice}
                              onChange={(e) =>
                                setI({ ...i, invoice: e.target.value })
                              }
                              required
                            />
                          </label>
                          <label>
                            Purpose of payment
                            <select
                              value={i.purpose}
                              onChange={(e) =>
                                setI({ ...i, purpose: e.target.value })
                              }
                            >
                              <option>Supplier invoice</option>
                              <option>Equipment purchase</option>
                              <option>Professional services</option>
                            </select>
                          </label>
                          <label>
                            Required arrival (Singapore time)
                            <input
                              type="datetime-local"
                              value={i.deadline}
                              onInput={(e) => {
                                const value = e.currentTarget.value;
                                setI((prev) => ({ ...prev, deadline: value }));
                              }}
                              onChange={(e) =>
                                setI((prev) => ({
                                  ...prev,
                                  deadline: e.target.value,
                                }))
                              }
                              required
                            />
                          </label>
                          <label>
                            Treasury priority
                            <select
                              value={i.priority}
                              onChange={(e) =>
                                setI({ ...i, priority: e.target.value })
                              }
                            >
                              <option>Balanced</option>
                              <option>Lowest cost</option>
                              <option>Fastest arrival</option>
                            </select>
                          </label>
                        </div>
                        <p className="help">
                          Fees are added to the SGD principal. The supplier
                          amount depends on the chosen FX quote.
                        </p>
                        {error && (
                          <div role="alert" className="error">
                            {error}
                          </div>
                        )}
                        <div className="form-actions">
                          <span>
                            <ShieldCheck size={16} /> Your approval is always
                            required
                          </span>
                          <button className="primary" type="submit">
                            Compare available routes <ArrowRight size={17} />
                          </button>
                        </div>
                      </form>
                      <aside className="context-panel">
                        <div className="eyebrow">PAYMENT CONTEXT</div>
                        <h2>
                          Singapore <ArrowRight size={22} /> {supplier.country}
                        </h2>
                        <dl>
                          <dt>Available funds</dt>
                          <dd>{money(balance)}</dd>
                          <dt>Single approver limit</dt>
                          <dd>S$100,000.00</dd>
                          <dt>Company verification</dt>
                          <dd>
                            <Badge>KYB verified · demo</Badge>
                          </dd>
                        </dl>
                        <hr />
                        <h3>A better comparison starts here.</h3>
                        <p>
                          We compare FX cost and fees together, then exclude
                          routes that fail your deadline or mandatory controls.
                        </p>
                        <div className="note">
                          Demo clock: 2 Oct 2026, 10:00 SGT. Quotes and
                          settlement times are illustrative.
                        </div>
                      </aside>
                    </div>
                  )}
                  {stage === 1 && (
                    <>
                      <div className="instruction-strip">
                        <div>
                          <b>{supplier.short}</b>
                          <small>
                            Singapore → {supplier.country} · {i.invoice}
                          </small>
                        </div>
                        <div>
                          <b>{money(i.amount)}</b>
                          <small>Principal to convert</small>
                        </div>
                        <div>
                          <b>{date(deadlineTime(i.deadline))}</b>
                          <small>Required arrival</small>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => {
                            setStage(0);
                            setSelected("");
                          }}
                        >
                          Edit instruction
                        </button>
                      </div>
                      <div className="section-heading route-heading">
                        <div>
                          <h2>Four routes. Every trade-off visible.</h2>
                          <p>
                            Estimated economic cost includes FX spread and all
                            listed fees.
                          </p>
                        </div>
                        <button className="text-button" onClick={retrieve}>
                          <RefreshCw size={15} />
                          {expired
                            ? "Quote expired · refresh"
                            : "Quotes valid " +
                              quoteSecondsRemaining(quoteAt) +
                              "s"}
                        </button>
                      </div>
                      {best ? (
                        <div className="recommendation">
                          <span className="recommend-icon">
                            <Route size={23} />
                          </span>
                          <div>
                            <div className="eyebrow">
                              RECOMMENDED · {i.priority.toUpperCase()} PRIORITY
                            </div>
                            <h3>
                              {best.name} meets your deadline for{" "}
                              {money(best.cost)} economic cost.
                            </h3>
                            <p>
                              {money(routes[0].cost - best.cost)} less than the
                              bank estimate · screening passed ·{" "}
                              {best.reliability}% simulated reliability ·
                              automatic reconciliation
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="error">
                          No eligible route. Adjust the deadline or resolve
                          beneficiary screening before proceeding.
                        </div>
                      )}
                      <RouteEvaluation
                        routes={routes}
                        best={best}
                        priority={i.priority}
                      />
                      {expired && (
                        <div className="error" role="alert">
                          These quotes have expired. Refresh routes to get a new
                          five-minute quote window. Approval is paused.
                        </div>
                      )}
                      <div className="route-cards">
                        {routes.map((r) => (
                          <article
                            className={
                              "route-card " +
                              (selected === r.id ? "selected " : "") +
                              (!r.eligible ? "unavailable" : "")
                            }
                            key={r.id}
                          >
                            <div className="route-top">
                              <span className="eyebrow">{r.type}</span>
                              {best?.id === r.id && <Badge>Recommended</Badge>}
                            </div>
                            <h3>{r.name}</h3>
                            <div
                              className={
                                "route-exclusion " +
                                (r.eligible ? "eligible" : "")
                              }
                            >
                              <strong>
                                {!r.compliant
                                  ? "SCREENING REQUIRED"
                                  : !r.available
                                    ? "ROUTE UNAVAILABLE"
                                    : !r.meetsDeadline
                                      ? "MISSES DEADLINE"
                                      : "MEETS DEADLINE"}
                              </strong>
                              <dl>
                                <dt>Expected</dt>
                                <dd>{date(NOW + r.hours * 3600000)}</dd>
                                <dt>Required</dt>
                                <dd>{date(deadlineTime(i.deadline))}</dd>
                              </dl>
                            </div>
                            <div className="route-price">
                              {money(r.cost)}
                              <small>Total estimated economic cost</small>
                            </div>
                            <dl className="quote-breakdown">
                              <dt>
                                FX spread ({(r.spread * 100).toFixed(2)}%)
                              </dt>
                              <dd>{money(r.fxCost)}</dd>
                              <dt>Transfer fee</dt>
                              <dd>{money(r.fee)}</dd>
                              <dt>Intermediary estimate</dt>
                              <dd>{money(r.intermediary)}</dd>
                            </dl>
                            <div className="receive">
                              <span>Supplier receives</span>
                              <b>{money(r.receive, supplier.currency)}</b>
                              <small>
                                1 SGD = {r.rate.toFixed(5)} {supplier.currency}
                              </small>
                            </div>
                            <dl className="quote-details">
                              <dt>Expected arrival</dt>
                              <dd>{date(NOW + r.hours * 3600000)}</dd>
                              <dt>Settlement estimate</dt>
                              <dd>
                                {r.hours < 1
                                  ? "15 minutes"
                                  : r.hours + " hours"}
                              </dd>
                              <dt>Recent reliability</dt>
                              <dd>{r.reliability}% · simulated</dd>
                              <dt>Screening</dt>
                              <dd>
                                {r.compliant
                                  ? "Passed · demo"
                                  : "Review required"}
                              </dd>
                              <dt>Reconciliation</dt>
                              <dd>
                                {r.reconcile ? "Automatic" : "Manual export"}
                              </dd>
                              <dt>SGD account debit</dt>
                              <dd>{money(r.debit)}</dd>
                            </dl>
                            {!r.eligible && (
                              <p className="route-reason">{r.reason}</p>
                            )}
                            <button
                              className={
                                selected === r.id ? "primary" : "secondary"
                              }
                              disabled={!r.eligible || expired}
                              onClick={() => setSelected(r.id)}
                            >
                              {selected === r.id ? (
                                <>
                                  <Check size={16} /> Selected
                                </>
                              ) : (
                                "Select route"
                              )}
                            </button>
                          </article>
                        ))}
                      </div>
                      <p className="help">
                        FX cost is the spread against a simulated mid-market
                        rate of {supplier.rate} {supplier.currency}/SGD. It is
                        reflected in the conversion rate, not charged twice.
                        Intermediary charges and arrivals remain estimates.
                      </p>
                      <div className="form-actions">
                        <button
                          className="text-button"
                          onClick={() => {
                            setStage(0);
                            setSelected("");
                          }}
                        >
                          <ArrowLeft size={16} /> Back
                        </button>
                        <button
                          className="primary"
                          disabled={!chosen || expired || !chosen.eligible}
                          onClick={() => {
                            setError("");
                            setStage(2);
                          }}
                        >
                          Review selected route <ArrowRight size={17} />
                        </button>
                      </div>
                    </>
                  )}
                  {stage === 2 && chosen && (
                    <div className="form-grid">
                      <section className="panel review">
                        <div className="section-heading">
                          <h2>Review your payment</h2>
                          <Badge tone="neutral">Awaiting approval</Badge>
                        </div>
                        <div className="review-amount">
                          <small>YOU CONVERT</small>
                          <strong>{money(i.amount)}</strong>
                          <span>
                            <ArrowRight size={18} />{" "}
                            {money(chosen.receive, supplier.currency)} to
                            supplier
                          </span>
                        </div>
                        <dl>
                          <dt>Beneficiary</dt>
                          <dd>
                            {supplier.name}
                            <small>
                              {supplier.country} · account {supplier.bank}
                            </small>
                          </dd>
                          <dt>Invoice / purpose</dt>
                          <dd>
                            {i.invoice} · {i.purpose}
                          </dd>
                          <dt>Selected route</dt>
                          <dd>{chosen.name}</dd>
                          <dt>FX quote</dt>
                          <dd>
                            1 SGD = {chosen.rate.toFixed(5)} {supplier.currency}
                          </dd>
                          <dt>Fees added to principal</dt>
                          <dd>{money(chosen.fee + chosen.intermediary)}</dd>
                          <dt>Total account debit</dt>
                          <dd>
                            <b>{money(chosen.debit)}</b>
                          </dd>
                          <dt>Total economic cost</dt>
                          <dd>
                            {money(chosen.cost)}{" "}
                            <small>
                              Includes {money(chosen.fxCost)} embedded FX spread
                            </small>
                          </dd>
                          <dt>Expected arrival</dt>
                          <dd>{date(NOW + chosen.hours * 3600000)}</dd>
                          <dt>Required arrival</dt>
                          <dd>{date(deadlineTime(i.deadline))}</dd>
                        </dl>
                        {chosen.debit > balance && (
                          <div className="error">
                            Insufficient available SGD balance for this debit.
                          </div>
                        )}
                        {error && (
                          <div className="error" role="alert">
                            {error}
                          </div>
                        )}
                        {expired && (
                          <div className="error">
                            Quote expired. Refresh routes to approve.{" "}
                            <button className="text-button" onClick={retrieve}>
                              <RefreshCw size={15} /> Refresh routes
                            </button>
                          </div>
                        )}
                        <div className="form-actions">
                          <button
                            className="text-button"
                            onClick={() => setStage(1)}
                          >
                            <ArrowLeft size={16} /> Change route
                          </button>
                          <button
                            className="primary"
                            disabled={
                              !chosen.eligible ||
                              expired ||
                              i.amount > 100000 ||
                              chosen.debit > balance
                            }
                            onClick={approve}
                          >
                            Approve & send <ArrowRight size={17} />
                          </button>
                        </div>
                        <p className="help">
                          This sends a simulated payment. No real funds move.
                        </p>
                      </section>
                      <aside className="context-panel">
                        <div className="eyebrow">MANDATORY CONTROLS</div>
                        <h2>Confidence before approval.</h2>
                        {[
                          "Company KYB verified",
                          "Beneficiary screening passed",
                          "Sanctions screening passed",
                          "Transaction monitoring: no flags",
                          "Purpose of payment recorded",
                          "Audit record prepared",
                        ].map((s) => (
                          <div className="control-line" key={s}>
                            <CheckCircle2 size={18} />
                            {s}
                          </div>
                        ))}
                        <div className={i.amount > 100000 ? "error" : "note"}>
                          <b>
                            {i.amount > 100000
                              ? "Second approval required"
                              : "Within your approval limit"}
                          </b>
                          <p>
                            Payments over S$100,000 require two approvers. The
                            demo holds these payments without execution.
                          </p>
                        </div>
                        <p className="help">
                          All results simulated. Controls cannot be overridden
                          by route ranking.
                        </p>
                      </aside>
                    </div>
                  )}
                  {stage === 3 && active && (
                    <>
                      <div className="tracking-banner">
                        <div className="completion-icon">
                          <Check size={26} />
                        </div>
                        <div>
                          <div className="eyebrow">{active.id}</div>
                          <h2>
                            {progress === 6
                              ? "Paid. Matched. Reconciled."
                              : "Your payment is on its way."}
                          </h2>
                          <p>
                            {money(active.instruction.amount)} →{" "}
                            {
                              suppliers.find(
                                (s) => s.id === active.instruction.supplierId,
                              )!.short
                            }{" "}
                            · {active.quote.name}
                          </p>
                        </div>
                        <Badge>
                          {progress === 6
                            ? "Reconciled"
                            : "Processing · simulation"}
                        </Badge>
                      </div>
                      <div className="form-grid">
                        <section className="panel timeline-panel">
                          <div className="section-heading">
                            <h2>Payment timeline</h2>
                            <span className="subtle">
                              {saved.some((p) => p.id === active.id)
                                ? "Accelerated demo playback"
                                : "Historical demo record"}
                            </span>
                          </div>
                          {[
                            "Payment approved",
                            "Compliance completed",
                            "Funds submitted",
                            "FX completed",
                            "Destination rail processing",
                            "Supplier credited",
                            "Reconciliation completed",
                          ].map((s, n) => (
                            <div
                              className={
                                "timeline-item " +
                                (n <= progress ? "complete" : "")
                              }
                              key={s}
                            >
                              <span>
                                {n <= progress ? <Check size={15} /> : n + 1}
                              </span>
                              <div>
                                <b>{s}</b>
                                <small>
                                  {n <= progress
                                    ? date(
                                        active.created +
                                          Math.min(n / 5, 1) *
                                            active.quote.hours *
                                            3600000 +
                                          (n === 6 ? 60000 : 0),
                                      )
                                    : "Awaiting previous event"}
                                </small>
                              </div>
                              {n === progress && progress < 6 && (
                                <Badge tone="warm">In progress</Badge>
                              )}
                            </div>
                          ))}
                        </section>
                        <aside className="context-panel ledger">
                          <div className="eyebrow">ACCOUNTING HANDOFF</div>
                          <h2>Close the loop.</h2>
                          <p>Your supplier payment, connected to the books.</p>
                          <dl>
                            <dt>Supplier</dt>
                            <dd>
                              {
                                suppliers.find(
                                  (s) => s.id === active.instruction.supplierId,
                                )!.name
                              }
                            </dd>
                            <dt>Invoice</dt>
                            <dd>{active.instruction.invoice}</dd>
                            <dt>Payment reference</dt>
                            <dd>{active.id}</dd>
                            <dt>
                              {progress >= 5
                                ? "Supplier credited"
                                : "Expected supplier amount"}
                            </dt>
                            <dd>
                              {money(
                                active.quote.receive,
                                suppliers.find(
                                  (s) => s.id === active.instruction.supplierId,
                                )!.currency,
                              )}
                            </dd>
                            <dt>Invoice match</dt>
                            <dd>
                              {progress === 6
                                ? "Matched · demo reference"
                                : "Pending"}
                            </dd>
                            <dt>Accounting sync</dt>
                            <dd>
                              {progress === 6
                                ? "Completed · demo ledger"
                                : "Waiting for settlement"}
                            </dd>
                            <dt>Ledger status</dt>
                            <dd>
                              <Badge tone={progress === 6 ? "good" : "neutral"}>
                                {progress === 6 ? "Reconciled" : "Pending"}
                              </Badge>
                            </dd>
                          </dl>
                          <details className="payment-facts">
                            <summary>Approved payment details</summary>
                            <dl>
                              {" "}
                              <dt>Principal</dt>
                              <dd>{money(active.instruction.amount)}</dd>
                              <dt>Selected route</dt>
                              <dd>{active.quote.name}</dd>
                              <dt>FX quote</dt>
                              <dd>
                                1 SGD = {active.quote.rate.toFixed(5)}{" "}
                                {
                                  suppliers.find(
                                    (s) =>
                                      s.id === active.instruction.supplierId,
                                  )!.currency
                                }
                              </dd>
                              <dt>Embedded FX cost</dt>
                              <dd>
                                {money(active.quote.fxCost)} (
                                {(active.quote.spread * 100).toFixed(2)}%)
                              </dd>
                              <dt>Transfer / intermediary fees</dt>
                              <dd>
                                {money(active.quote.fee)} /{" "}
                                {money(active.quote.intermediary)}
                              </dd>
                              <dt>Total economic cost</dt>
                              <dd>{money(active.quote.cost)}</dd>
                              <dt>Total account debit</dt>
                              <dd>{money(active.quote.debit)}</dd>
                              <dt>Expected arrival</dt>
                              <dd>
                                {date(
                                  active.created + active.quote.hours * 3600000,
                                )}
                              </dd>
                              <dt>Required arrival</dt>
                              <dd>
                                {date(
                                  deadlineTime(active.instruction.deadline),
                                )}
                              </dd>
                              <dt>Simulated reliability</dt>
                              <dd>{active.quote.reliability}%</dd>
                            </dl>
                          </details>
                          <p className="help">
                            Prototype match by invoice reference. Production
                            matching must validate invoice currency, open
                            balance and tolerances.
                          </p>
                          <button
                            className="secondary"
                            onClick={() => go("Payments")}
                          >
                            View transaction record <ArrowRight size={16} />
                          </button>
                        </aside>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
          {page === "Payments" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">PAYMENT REGISTER</div>
                  <h1>Every payment, accounted for.</h1>
                  <p>
                    Inspect the route, follow settlement and trace the invoice.
                  </p>
                </div>
                <button className="primary" onClick={() => start()}>
                  <Plus size={17} /> New international payment
                </button>
              </div>
              <section className="panel">
                <div className="toolbar">
                  <label className="search">
                    <Search size={17} />
                    <input
                      aria-label="Search payments"
                      placeholder="Search supplier or reference"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <select
                    aria-label="Filter status"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option>All statuses</option>
                    <option>Processing</option>
                    <option>Reconciled</option>
                  </select>
                  <button className="secondary" onClick={exportCsv}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <PaymentTable
                  all={all}
                  filter={filter}
                  query={query}
                  inspect={inspect}
                />
              </section>
            </>
          )}
          {page === "Suppliers" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">BENEFICIARY DIRECTORY</div>
                  <h1>Trusted relationships. Clear controls.</h1>
                  <p>
                    Fictional ASEAN suppliers, with payment details and
                    screening in one place.
                  </p>
                </div>
              </div>
              <div className="supplier-grid">
                {suppliers.map((s) => (
                  <section className="panel supplier-card" key={s.id}>
                    <div className="section-heading">
                      <span className="country">{s.code}</span>
                      <Badge tone={s.screened ? "good" : "warm"}>
                        {s.screened ? "Verified · demo" : "Review required"}
                      </Badge>
                    </div>
                    <h2>{s.name}</h2>
                    <p>
                      {s.country} · {s.currency}
                    </p>
                    <dl>
                      <dt>Bank account</dt>
                      <dd>{s.bank}</dd>
                      <dt>Invoice</dt>
                      <dd>{s.invoice}</dd>
                      <dt>Invoice principal</dt>
                      <dd>
                        {money(
                          saved.find(
                            (p) =>
                              p.instruction.supplierId === s.id &&
                              p.instruction.invoice === s.invoice,
                          )?.instruction.amount ?? s.amount,
                        )}
                      </dd>
                      <dt>Invoice status</dt>
                      <dd>
                        {saved.find(
                          (p) =>
                            p.instruction.supplierId === s.id &&
                            p.instruction.invoice === s.invoice,
                        )?.status || "Open"}
                      </dd>
                    </dl>
                    <button
                      className="secondary"
                      onClick={() => {
                        const paid = saved.find(
                          (p) =>
                            p.instruction.supplierId === s.id &&
                            p.instruction.invoice === s.invoice,
                        );
                        if (paid) inspect(paid);
                        else start(s.id);
                      }}
                    >
                      {saved.some(
                        (p) =>
                          p.instruction.supplierId === s.id &&
                          p.instruction.invoice === s.invoice,
                      )
                        ? "View payment"
                        : "Prepare payment"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </section>
                ))}
              </div>
            </>
          )}
          {page === "Integrations" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">CONNECTED WORKFLOWS</div>
                  <h1>From your account to your books.</h1>
                  <p>
                    A replaceable service layer. Every connection below is a
                    simulation.
                  </p>
                </div>
              </div>
              <div className="supplier-grid">
                {[
                  [
                    "Accounting / ERP",
                    "Navren Books",
                    "Invoice references, payment records and ledger status.",
                  ],
                  [
                    "Banking",
                    "SGD operating account",
                    "Simulated balance and payment funding.",
                  ],
                  [
                    "Payment providers",
                    "Multi-route quote adapter",
                    "Normalizes bank, fintech and conceptual IPS routes.",
                  ],
                  [
                    "FX data",
                    "Reference rate service",
                    "Fixed demo mid-market rates and explicit provider spreads.",
                  ],
                  [
                    "Compliance data",
                    "Screening adapter",
                    "Mock KYB, beneficiary and sanctions control results.",
                  ],
                ].map(([type, name, copy]) => (
                  <section className="panel integration" key={name}>
                    <div className="eyebrow">{type}</div>
                    <h2>{name}</h2>
                    <p>{copy}</p>
                    <Badge tone="neutral">Demo integration</Badge>
                    <button
                      className="text-button"
                      onClick={() =>
                        setToast(
                          name +
                            ": simulated connection healthy. No external API called.",
                        )
                      }
                    >
                      <RefreshCw size={15} /> Test demo connection
                    </button>
                  </section>
                ))}
              </div>
            </>
          )}
          {page === "Controls" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">RISK & GOVERNANCE</div>
                  <h1>Controls before optimization.</h1>
                  <p>
                    Mandatory gates protect each instruction. Recommendations
                    cannot bypass them.
                  </p>
                </div>
                <Badge tone="warm">1 review required</Badge>
              </div>
              <section className="panel controls-table">
                {[
                  [
                    "Company KYB",
                    "Verified",
                    "Fictional Straits Circuit business profile.",
                  ],
                  [
                    "Beneficiary screening",
                    "Review required",
                    "Luzon Assembly requires review; all its routes are blocked.",
                  ],
                  [
                    "Corridor availability",
                    "Enforced",
                    "Conceptual IPS route only in TH / MY, up to S$75,000.",
                  ],
                  [
                    "Dual approval",
                    "Enforced",
                    "Above S$100,000, execution is held for a second approver.",
                  ],
                  [
                    "Quote validity",
                    "5 minutes",
                    "Expired quotes must be refreshed before approval.",
                  ],
                  [
                    "Funds check",
                    "Enforced",
                    "Available SGD balance must cover principal plus fees.",
                  ],
                  [
                    "Audit trail",
                    "Recorded",
                    "Payment reference, instruction, quote and timeline retained locally.",
                  ],
                ].map(([name, state, copy]) => (
                  <div className="control-row" key={name}>
                    <ShieldCheck size={20} />
                    <div>
                      <h3>{name}</h3>
                      <p>{copy}</p>
                    </div>
                    <Badge tone={state === "Review required" ? "warm" : "good"}>
                      {state}
                    </Badge>
                  </div>
                ))}
              </section>
              <p className="help">
                Academic prototype. These controls are illustrative, not
                evidence of a licence, regulatory approval or production
                compliance.
              </p>
            </>
          )}
          {page === "Company" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">WORKSPACE SETTINGS</div>
                  <h1>Your company, your controls.</h1>
                  <p>
                    Manage presentation preferences and inspect the demo policy.
                  </p>
                </div>
              </div>
              <section className="panel settings">
                <label>
                  Company display name
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
                <label>
                  Base currency
                  <input readOnly value="SGD · Singapore dollar" />
                </label>
                <label>
                  Approval role
                  <input
                    readOnly
                    value="Jamie Lim · Finance manager · S$100,000 limit"
                  />
                </label>
                <button
                  className="primary"
                  onClick={() => {
                    localStorage.setItem("navren-company", company);
                    setToast("Company display name saved.");
                  }}
                >
                  Save preferences
                </button>
                <hr />
                <h2>Reset presentation data</h2>
                <p>
                  Clears locally created demo payments and restores the starting
                  balance.
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    setSaved([]);
                    localStorage.removeItem("navren-payments");
                    setToast("Demo reset. Starting balance restored.");
                  }}
                >
                  <RefreshCw size={16} /> Reset demo payments
                </button>
              </section>
            </>
          )}
          <footer>
            <span>Navren · Payment orchestration for growing businesses</span>
            <span>Academic prototype · simulated data & integrations</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      <span hidden>
        {tick}
        {company}
      </span>
    </div>
  );
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h1>Something interrupted this session.</h1>
        <button onClick={() => location.reload()}>Reload workspace</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
