import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  quotes,
  recommended,
  sendGuard,
  validate,
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
