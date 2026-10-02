export const NOW = new Date("2026-10-02T10:00:00+08:00").getTime();
export const QUOTE_TTL_MS = 300_000;
export const quoteSecondsRemaining = (quotedAt: number, now = Date.now()) =>
  Math.max(0, Math.ceil((quotedAt + QUOTE_TTL_MS - now) / 1000));
export const quoteExpired = (quotedAt: number, now = Date.now()) =>
  now >= quotedAt + QUOTE_TTL_MS;
const cents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export const money = (n: number, c = "SGD") =>
  new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace(/^\$/, "S$");
export const date = (n: number) =>
  new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
  }).format(n) + " SGT";
export interface Supplier {
  id: string;
  name: string;
  short: string;
  country: string;
  code: string;
  currency: string;
  rate: number;
  invoice: string;
  amount: number;
  bank: string;
  screened: boolean;
}
export const suppliers: Supplier[] = [
  {
    id: "siam",
    name: "Siam Precision Components Co., Ltd.",
    short: "Siam Precision",
    country: "Thailand",
    code: "TH",
    currency: "THB",
    rate: 25.6,
    invoice: "INV-2048",
    amount: 50000,
    bank: "•••• 4821",
    screened: true,
  },
  {
    id: "meranti",
    name: "Meranti Industrial Supplies Sdn. Bhd.",
    short: "Meranti Industrial",
    country: "Malaysia",
    code: "MY",
    currency: "MYR",
    rate: 3.32,
    invoice: "INV-2051",
    amount: 18500,
    bank: "•••• 7902",
    screened: true,
  },
  {
    id: "nusantara",
    name: "PT Nusantara Circuit Works",
    short: "Nusantara Circuit",
    country: "Indonesia",
    code: "ID",
    currency: "IDR",
    rate: 11800,
    invoice: "INV-2054",
    amount: 32000,
    bank: "•••• 3066",
    screened: true,
  },
  {
    id: "luzon",
    name: "Luzon Assembly & Packaging Inc.",
    short: "Luzon Assembly",
    country: "Philippines",
    code: "PH",
    currency: "PHP",
    rate: 43.5,
    invoice: "INV-2057",
    amount: 12600,
    bank: "•••• 5823",
    screened: false,
  },
];
export interface Instruction {
  supplierId: string;
  amount: number;
  invoice: string;
  purpose: string;
  deadline: string;
  priority: string;
}
export const initial: Instruction = {
  supplierId: "siam",
  amount: 50000,
  invoice: "INV-2048",
  purpose: "Supplier invoice",
  deadline: "2026-10-03T15:00",
  priority: "Balanced",
};
export interface Quote {
  id: string;
  name: string;
  type: string;
  spread: number;
  fee: number;
  intermediary: number;
  hours: number;
  reliability: number;
  reconcile: boolean;
  available: boolean;
  compliant: boolean;
  rate: number;
  fxCost: number;
  cost: number;
  receive: number;
  debit: number;
  meetsDeadline: boolean;
  eligible: boolean;
  reason: string;
  score: number;
}
export const deadlineTime = (v: string) => new Date(v + ":00+08:00").getTime();
export const demoControls = {
  companyVerified: true,
  sanctionsPassed: true,
  monitoringPassed: true,
};
export function quotes(i: Instruction, controls = demoControls): Quote[] {
  const s = suppliers.find((s) => s.id === i.supplierId)!;
  const base = [
    {
      id: "bank",
      name: "Correspondent bank",
      type: "Traditional banking",
      spread: 0.006,
      fee: 45,
      intermediary: 30,
      hours: 24,
      reliability: 99.4,
      reconcile: true,
      available: true,
      compliant: true,
    },
    {
      id: "partner",
      name: "Treasury partner",
      type: "Fintech payment provider",
      spread: 0.0025,
      fee: 20,
      intermediary: 0,
      hours: 4,
      reliability: 99.7,
      reconcile: true,
      available: true,
      compliant: true,
    },
    {
      id: "instant",
      name: "Regional instant",
      type: "IPS connectivity · concept",
      spread: 0.0018,
      fee: 16,
      intermediary: 0,
      hours: 0.25,
      reliability: 99.8,
      reconcile: true,
      available: ["TH", "MY"].includes(s.code) && i.amount <= 75000,
      compliant: true,
    },
    {
      id: "economy",
      name: "Scheduled transfer",
      type: "Batched fintech payment",
      spread: 0.0012,
      fee: 10,
      intermediary: 0,
      hours: 72,
      reliability: 98.8,
      reconcile: true,
      available: true,
      compliant: true,
    },
  ];
  const calculated = base.map((r) => {
    const compliant =
      r.compliant &&
      s.screened &&
      controls.companyVerified &&
      controls.sanctionsPassed &&
      controls.monitoringPassed;
    const meets = NOW + r.hours * 3600000 <= deadlineTime(i.deadline);
    const reason = !compliant
      ? !s.screened
        ? "Beneficiary review required"
        : "Mandatory compliance review required"
      : !r.available
        ? "Unavailable for this corridor or amount"
        : !meets
          ? "Arrives after your deadline"
          : "";
    const fxCost = cents(i.amount * r.spread);
    return {
      ...r,
      compliant,
      rate: s.rate * (1 - r.spread),
      fxCost,
      cost: cents(fxCost + r.fee + r.intermediary),
      receive: cents(i.amount * s.rate * (1 - r.spread)),
      debit: cents(i.amount + r.fee + r.intermediary),
      meetsDeadline: meets,
      eligible: !reason,
      reason,
      score: 0,
    };
  });
  const maxCost = Math.max(
    1,
    ...calculated.filter((r) => r.eligible).map((r) => r.cost),
  );
  return calculated.map((r) => ({
    ...r,
    score: r.eligible
      ? 100 *
        ((1 - r.cost / maxCost) * 0.35 +
          (1 - r.hours / 72) * 0.25 +
          (r.reliability / 100) * 0.15 +
          (1 - r.spread / 0.006) * 0.15 +
          (r.reconcile ? 0.1 : 0))
      : 0,
  }));
}
export function recommended(q: Quote[], priority = "Balanced") {
  return q
    .filter((r) => r.eligible)
    .sort((a, b) =>
      priority === "Lowest cost"
        ? a.cost - b.cost || a.hours - b.hours || a.id.localeCompare(b.id)
        : priority === "Fastest arrival"
          ? a.hours - b.hours || a.cost - b.cost || a.id.localeCompare(b.id)
          : b.score - a.score || a.cost - b.cost || a.id.localeCompare(b.id),
    )[0];
}
export function cheapestExplanation(q: Quote[], best?: Quote) {
  const cheapest = [...q].sort((a, b) => a.cost - b.cost)[0];
  if (!best || !cheapest)
    return "No route meets all mandatory controls. Resolve the exclusions before comparing eligible trade-offs.";
  if (cheapest.id === best.id)
    return `${best.name} is the cheapest eligible route and meets your supplier's deadline.`;
  const saving = money(best.cost - cheapest.cost);
  if (!cheapest.compliant)
    return `${cheapest.name} costs ${saving} less, but requires compliance review. Mandatory controls cannot be traded for savings.`;
  if (!cheapest.available)
    return `${cheapest.name} costs ${saving} less, but is unavailable for this corridor or amount.`;
  if (!cheapest.meetsDeadline)
    return `${cheapest.name} costs ${saving} less, but its expected arrival is after the supplier's required deadline.`;
  return `${cheapest.name} costs ${saving} less and is eligible. Your selected treasury priority favors the recommendation's speed, reliability and operational fit.`;
}
export function validate(i: Instruction) {
  if (!Number.isFinite(i.amount) || i.amount <= 0 || i.amount > 500000)
    return "Enter an amount between S$0.01 and S$500,000.";
  if (!i.invoice.trim()) return "An invoice reference is required.";
  if (
    !Number.isFinite(deadlineTime(i.deadline)) ||
    deadlineTime(i.deadline) <= NOW
  )
    return "Choose an arrival deadline after 2 Oct 2026, 10:00 SGT.";
  return "";
}
export interface Payment {
  id: string;
  instruction: Instruction;
  quote: Quote;
  status: string;
  created: number;
}
export const history: Payment[] = [
  {
    id: "PAY-2026-10481",
    instruction: {
      ...initial,
      supplierId: "meranti",
      amount: 18500,
      invoice: "INV-2039",
    },
    quote: quotes({ ...initial, supplierId: "meranti", amount: 18500 })[2],
    status: "Reconciled",
    created: NOW - 86400000,
  },
  {
    id: "PAY-2026-10480",
    instruction: {
      ...initial,
      supplierId: "nusantara",
      amount: 32000,
      invoice: "INV-2035",
    },
    quote: quotes({ ...initial, supplierId: "nusantara", amount: 32000 })[1],
    status: "Processing",
    created: NOW - 7200000,
  },
  {
    id: "PAY-2026-10479",
    instruction: { ...initial, amount: 24000, invoice: "INV-2030" },
    quote: quotes({ ...initial, amount: 24000 })[2],
    status: "Reconciled",
    created: NOW - 172800000,
  },
];
export function sendGuard(
  i: Instruction,
  q: Quote,
  quoteAt: number,
  balance: number,
) {
  const inputError = validate(i);
  if (inputError) return inputError;
  const current = quotes(i).find((r) => r.id === q.id);
  return (
    (!current?.eligible ? "The route no longer meets payment controls." : "") ||
    (!current ||
    ![
      "rate",
      "fxCost",
      "cost",
      "receive",
      "debit",
      "fee",
      "intermediary",
      "hours",
    ].every((key) => current[key as keyof Quote] === q[key as keyof Quote])
      ? "Payment instruction changed. Refresh routes before approving."
      : "") ||
    (quoteExpired(quoteAt)
      ? "Your quote has expired. Refresh routes before approving."
      : "") ||
    (q.debit > balance ? "Insufficient available SGD balance." : "") ||
    (i.amount > 100000
      ? "A second approver is required. Execution is held in this demo."
      : "")
  );
}
