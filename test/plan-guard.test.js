import assert from "node:assert/strict";
import test from "node:test";

import { inspectQueryPlan } from "../src/plan-guard.js";

const explain = (node) => [{ Plan: node }];

test("passes a selective index scan", () => {
  const report = inspectQueryPlan(
    explain({
      "Node Type": "Index Scan",
      "Relation Name": "test_runs",
      "Index Name": "test_runs_pkey",
      "Total Cost": 8.2,
      "Plan Rows": 1,
    }),
    { maxRootCost: 20, maxEstimatedRows: 10 },
  );
  assert.deepEqual(report, {
    passed: true,
    nodeCount: 1,
    rootCost: 8.2,
    findingCount: 0,
    findings: [],
  });
});

test("reports cost, sequential scan, and cardinality regressions", () => {
  const report = inspectQueryPlan(
    explain({
      "Node Type": "Seq Scan",
      "Relation Name": "test_runs",
      "Total Cost": 750,
      "Plan Rows": 50000,
    }),
    { maxRootCost: 100, maxEstimatedRows: 1000 },
  );
  assert.equal(report.passed, false);
  assert.deepEqual(report.findings.map((item) => item.ruleId), [
    "denied-node",
    "estimated-rows",
    "root-cost",
  ]);
});

test("allows an intentional sequential scan on a tiny relation", () => {
  const report = inspectQueryPlan(
    explain({
      "Node Type": "Seq Scan",
      "Relation Name": "schema_migrations",
      "Total Cost": 2,
      "Plan Rows": 10,
    }),
    { sequentialScanAllowlist: ["schema_migrations"] },
  );
  assert.equal(report.passed, true);
});
