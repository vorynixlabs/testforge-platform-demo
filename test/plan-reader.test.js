import assert from "node:assert/strict";
import test from "node:test";

import { readExplainJson } from "../src/plan-reader.js";

const document = [
  {
    Plan: {
      "Node Type": "Nested Loop",
      "Total Cost": 18.5,
      "Plan Rows": 2,
      Plans: [
        {
          "Node Type": "Index Scan",
          "Relation Name": "test_runs",
          "Index Name": "test_runs_pkey",
          "Total Cost": 8.2,
          "Plan Rows": 1,
        },
      ],
    },
  },
];

test("reads and flattens nested PostgreSQL plans", () => {
  const plan = readExplainJson(document);
  assert.equal(plan.root.nodeType, "Nested Loop");
  assert.deepEqual(plan.nodes.map(({ path, nodeType }) => ({ path, nodeType })), [
    { path: "0", nodeType: "Nested Loop" },
    { path: "0.0", nodeType: "Index Scan" },
  ]);
  assert.equal(plan.nodes[1].index, "test_runs_pkey");
});

test("rejects malformed EXPLAIN JSON", () => {
  assert.throws(() => readExplainJson({ Plan: {} }), /array/);
  assert.throws(
    () => readExplainJson([{ Plan: { "Node Type": "Seq Scan", "Total Cost": -1, "Plan Rows": 2 } }]),
    /Total Cost/,
  );
  assert.throws(
    () => readExplainJson([{ Plan: { "Node Type": "Seq Scan", "Total Cost": 1, "Plan Rows": 2.5 } }]),
    /Plan Rows/,
  );
});
