import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  quotes,
  recommended,
  sendGuard,
  validate,
  demoControls,
  quoteSecondsRemaining,
  quoteExpired,
  cheapestExplanation,
} from "../src/model.ts";
test("fees and embedded FX spread are not double counted", () => {
  const q = quotes(initial)[2];
  assert.equal(q.cost, 106);
  assert.equal(q.debit, 50016);
  assert.ok(Math.abs(q.receive - 1277696) < 0.001);
  assert.equal(q.rate, 25.6 * (1 - 0.0018));
});
test("default recommendation meets deadline and cheaper route is blocked", () => {
  const qs = quotes(initial);
  assert.equal(recommended(qs)?.id, "instant");
  assert.equal(qs[3].eligible, false);
  assert.ok(qs[3].cost < qs[2].cost);
});
test("relaxed deadline and cost priority favor scheduled route", () => {
  assert.equal(
    recommended(
      quotes({
        ...initial,
        deadline: "2026-10-07T15:00",
        priority: "Lowest cost",
      }),
      "Lowest cost",
    )?.id,
    "economy",
  );
});
test("screening is a mandatory gate across routes", () => {
  assert.ok(
    quotes({ ...initial, supplierId: "luzon" }).every((q) => !q.eligible),
  );
  assert.equal(
    recommended(quotes({ ...initial, supplierId: "luzon" })),
    undefined,
  );
});
test("availability varies by corridor and principal limit", () => {
  assert.equal(
    quotes({ ...initial, supplierId: "nusantara" })[2].available,
    false,
  );
  assert.equal(quotes({ ...initial, amount: 80000 })[2].available, false);
});
test("impossible deadline prevents recommendation", () => {
  assert.equal(
    recommended(quotes({ ...initial, deadline: "2026-10-02T10:01" })),
    undefined,
  );
});
test("expiry, balance, authority and mandatory screening checked at approval", () => {
  const q = quotes(initial)[2];
  assert.match(sendGuard(initial, q, Date.now() - 300001, 250000), /expired/);
  assert.match(sendGuard(initial, q, Date.now(), 1), /Insufficient/);
  const large = { ...initial, amount: 150000 };
  assert.match(
    sendGuard(large, quotes(large)[1], Date.now(), 250000),
    /second approver/,
  );
  assert.match(
    sendGuard({ ...initial, supplierId: "luzon" }, q, Date.now(), 250000),
    /controls/,
  );
});
test("invalid principal, reference and dates rejected", () => {
  assert.ok(validate({ ...initial, amount: -1 }));
  assert.ok(validate({ ...initial, invoice: "" }));
  assert.ok(validate({ ...initial, deadline: "2020-01-01T10:00" }));
  assert.equal(validate(initial), "");
});

test("all treasury priorities enforce every eligibility gate", () => {
  for (const priority of ["Lowest cost", "Balanced", "Fastest arrival"]) {
    for (const instruction of [
      initial,
      { ...initial, supplierId: "nusantara" },
      { ...initial, amount: 80000 },
    ]) {
      const q = quotes(instruction);
      const best = recommended(q, priority);
      assert.ok(best?.eligible);
      assert.ok(best?.compliant && best?.available && best?.meetsDeadline);
    }
    assert.equal(
      recommended(quotes({ ...initial, supplierId: "luzon" }), priority),
      undefined,
    );
    assert.equal(
      recommended(
        quotes({ ...initial, deadline: "2026-10-02T10:01" }),
        priority,
      ),
      undefined,
    );
  }
});
test("lowest cost and fastest arrival are exact preferences, even when weighted scores disagree", () => {
  const q = quotes({ ...initial, deadline: "2026-10-07T15:00" });
  assert.equal(
    recommended(q, "Lowest cost")?.cost,
    Math.min(...q.filter((r) => r.eligible).map((r) => r.cost)),
  );
  assert.equal(
    recommended(q, "Fastest arrival")?.hours,
    Math.min(...q.filter((r) => r.eligible).map((r) => r.hours)),
  );
  const adversarial = q.map((r) => ({
    ...r,
    score: r.id === "bank" ? 10000 : 0,
  }));
  assert.equal(recommended(adversarial, "Lowest cost")?.id, "economy");
  assert.equal(recommended(adversarial, "Fastest arrival")?.id, "instant");
});
test("company, sanctions and monitoring fixtures each fail closed", () => {
  for (const control of [
    "companyVerified",
    "sanctionsPassed",
    "monitoringPassed",
  ]) {
    const q = quotes(initial, { ...demoControls, [control]: false });
    assert.ok(q.every((r) => !r.eligible && !r.compliant));
    assert.equal(recommended(q), undefined);
  }
});
test("quote countdown boundaries and refresh cannot yield a negative value", () => {
  const at = 100000;
  assert.equal(quoteSecondsRemaining(at, at), 300);
  assert.equal(quoteSecondsRemaining(at, at + 299999), 1);
  assert.equal(quoteExpired(at, at + 299999), false);
  assert.equal(quoteExpired(at, at + 300000), true);
  assert.equal(quoteSecondsRemaining(at, at + 900000), 0);
  assert.equal(quoteSecondsRemaining(at + 900000, at + 900000), 300);
});
test("cheapest-route rationale reports the derived difference and correct reason", () => {
  const q = quotes(initial);
  assert.match(cheapestExplanation(q, recommended(q)), /S\$36.00 less.*after/);
  const review = quotes({ ...initial, supplierId: "luzon" });
  assert.match(
    cheapestExplanation(review, recommended(review)),
    /No route meets/,
  );
  const flexible = quotes({ ...initial, deadline: "2026-10-07T15:00" });
  assert.match(
    cheapestExplanation(flexible, recommended(flexible, "Lowest cost")),
    /cheapest eligible/,
  );
});
test("approval rejects an instruction changed after quote creation", () => {
  assert.match(
    sendGuard(
      { ...initial, amount: 45000 },
      quotes(initial)[2],
      Date.now(),
      250000,
    ),
    /instruction changed/,
  );
});
test("principal and receipt are consistent with displayed FX precision", () => {
  const q = quotes(initial)[2];
  assert.equal(
    q.receive,
    Math.round(initial.amount * Number(q.rate.toFixed(5)) * 100) / 100,
  );
  assert.equal(q.cost, q.fxCost + q.fee + q.intermediary);
  assert.equal(q.debit, initial.amount + q.fee + q.intermediary);
});
