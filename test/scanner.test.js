import assert from "node:assert/strict";
import test from "node:test";

import { fingerprint, maskedPreview, scanPatterns } from "../src/scanner.js";

test("finds credential formats with stable locations", () => {
  const findings = scanPatterns("status=ok\napi_key=abcdefghijklmnop\n");

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, "credential-assignment");
  assert.equal(findings[0].line, 2);
  assert.equal(findings[0].column, 1);
});

test("reports fingerprints and masked previews without exposing values", () => {
  const value = "Bearer abcdefghijklmnopqrstuvwxyz";
  const [finding] = scanPatterns(value);

  assert.equal(finding.fingerprint, fingerprint(value));
  assert.equal(finding.preview, maskedPreview(value));
  assert.equal(finding.preview.includes("abcdefghijklmnopqrstuvwxyz"), false);
  assert.equal(JSON.stringify(finding).includes(value), false);
});

test("does not flag ordinary test output", () => {
  assert.deepEqual(scanPatterns("suite=checkout\nstatus=passed\nduration=31ms"), []);
});
