import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { scanArtifact } from "../src/guard.js";
import { redactArtifact } from "../src/redact.js";

test("passes a clean report", async () => {
  const text = await readFile(new URL("fixtures/clean-report.txt", import.meta.url), "utf8");
  assert.deepEqual(scanArtifact(text), { safe: true, findingCount: 0, findings: [] });
});

test("consolidates overlapping explicit and entropy findings", async () => {
  const text = await readFile(new URL("fixtures/exposed-report.txt", import.meta.url), "utf8");
  const report = scanArtifact(text);

  assert.equal(report.safe, false);
  assert.equal(report.findingCount, 2);
  assert.deepEqual(report.findings.map((finding) => finding.ruleId), [
    "bearer-token",
    "aws-access-key",
  ]);
});

test("replaces detected values while preserving surrounding content", () => {
  const source = "before\npassword=syntheticPassword123\nafter";
  const result = redactArtifact(source);

  assert.equal(result.replacementCount, 1);
  assert.equal(result.redacted.includes("syntheticPassword123"), false);
  assert.match(result.redacted, /before\n\[REDACTED:credential-assignment\]\nafter/);
});
