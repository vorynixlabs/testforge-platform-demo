import assert from "node:assert/strict";
import test from "node:test";

import {
  isHighEntropyCandidate,
  scanEntropy,
  shannonEntropy,
} from "../src/entropy.js";

const syntheticToken = "pQ7vN2xK9mR4tY8wL3cF6hJ1sD5zB0uE";

test("calculates entropy in bits per character", () => {
  assert.equal(shannonEntropy("aaaaaaaa"), 0);
  assert.equal(shannonEntropy("aabb"), 1);
});

test("flags mixed high-entropy values", () => {
  assert.equal(isHighEntropyCandidate(syntheticToken), true);
  const [finding] = scanEntropy(`token=${syntheticToken}`);
  assert.equal(finding.ruleId, "high-entropy-token");
  assert.equal(finding.severity, "medium");
});

test("ignores digests and repetitive identifiers", () => {
  const digest = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  assert.equal(isHighEntropyCandidate(digest), false);
  assert.deepEqual(scanEntropy(`digest=${digest}\nvalue=aaaaaaaaaaaaaaaaaaaaaaaa`), []);
});
