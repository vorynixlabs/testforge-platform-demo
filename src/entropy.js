import { fingerprint, maskedPreview } from "./scanner.js";

const candidateExpression = /[A-Za-z0-9+/=_-]{24,}/g;
const commonDigestLengths = new Set([32, 40, 64, 128]);

export function shannonEntropy(value) {
  const counts = new Map();
  for (const character of value) {
    counts.set(character, (counts.get(character) ?? 0) + 1);
  }

  return [...counts.values()].reduce((entropy, count) => {
    const probability = count / value.length;
    return entropy - probability * Math.log2(probability);
  }, 0);
}

function looksLikeDigest(value) {
  return /^[a-f0-9]+$/i.test(value) && commonDigestLengths.has(value.length);
}

function hasMixedCharacterClasses(value) {
  return /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

function locationAt(text, offset) {
  const prefix = text.slice(0, offset);
  const lines = prefix.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

export function scanEntropy(text, options = {}) {
  const threshold = options.threshold ?? 4.2;
  const minimumLength = options.minimumLength ?? 24;
  const findings = [];

  for (const match of text.matchAll(candidateExpression)) {
    const value = match[0];
    const entropy = shannonEntropy(value);
    if (
      value.length < minimumLength ||
      entropy < threshold ||
      !hasMixedCharacterClasses(value) ||
      looksLikeDigest(value)
    ) {
      continue;
    }

    findings.push({
      ruleId: "high-entropy-token",
      description: "High-entropy token-like value",
      severity: "medium",
      ...locationAt(text, match.index),
      length: value.length,
      entropy: Number(entropy.toFixed(2)),
      fingerprint: fingerprint(value),
      preview: maskedPreview(value),
    });
  }

  return findings;
}
