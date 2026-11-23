import assert from "node:assert/strict";
import test from "node:test";

import { compilePlanPolicy } from "../src/plan-policy.js";

test("compiles stable query plan policy defaults", () => {
  assert.deepEqual(compilePlanPolicy(), {
    deniedNodeTypes: ["Seq Scan"],
    sequentialScanAllowlist: [],
    maxRootCost: 1000,
    maxEstimatedRows: 10000,
  });
});

test("deduplicates and sorts policy lists", () => {
  const policy = compilePlanPolicy({
    deniedNodeTypes: ["Sort", "Seq Scan", "Sort"],
    sequentialScanAllowlist: ["schema_migrations", "audit_events"],
    maxRootCost: 50,
    maxEstimatedRows: 200,
  });
  assert.deepEqual(policy.deniedNodeTypes, ["Seq Scan", "Sort"]);
  assert.deepEqual(policy.sequentialScanAllowlist, ["audit_events", "schema_migrations"]);
});

test("rejects invalid plan policy values", () => {
  assert.throws(() => compilePlanPolicy({ maxRootCost: 0 }), /maxRootCost/);
  assert.throws(() => compilePlanPolicy({ deniedNodeTypes: ["Seq Scan; DROP"] }), /node names/);
  assert.throws(() => compilePlanPolicy({ sequentialScanAllowlist: ["../users"] }), /relation names/);
});
