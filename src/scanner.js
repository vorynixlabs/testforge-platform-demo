import { createHash } from "node:crypto";

import { credentialPatterns } from "./patterns.js";

function locationAt(text, offset) {
  const prefix = text.slice(0, offset);
  const lines = prefix.split("\n");
  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

export function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export function maskedPreview(value) {
  const compact = value.replace(/\s+/g, " ");
  if (compact.length <= 8) return "*".repeat(compact.length);
  return `${compact.slice(0, 3)}${"*".repeat(Math.min(12, compact.length - 6))}${compact.slice(-3)}`;
}

export function scanPatterns(text, patterns = credentialPatterns) {
  const findings = [];

  for (const pattern of patterns) {
    const expression = new RegExp(pattern.expression.source, pattern.expression.flags);
    for (const match of text.matchAll(expression)) {
      const value = match[0];
      findings.push({
        ruleId: pattern.id,
        description: pattern.description,
        severity: "high",
        ...locationAt(text, match.index),
        length: value.length,
        fingerprint: fingerprint(value),
        preview: maskedPreview(value),
      });
    }
  }

  return findings.sort((left, right) =>
    left.line === right.line ? left.column - right.column : left.line - right.line,
  );
}
