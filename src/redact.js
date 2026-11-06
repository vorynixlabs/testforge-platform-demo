import {
  entropyCandidateExpression,
  isHighEntropyCandidate,
} from "./entropy.js";
import { credentialPatterns } from "./patterns.js";

function collectRanges(text) {
  const ranges = [];

  for (const pattern of credentialPatterns) {
    const expression = new RegExp(pattern.expression.source, pattern.expression.flags);
    for (const match of text.matchAll(expression)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, ruleId: pattern.id });
    }
  }

  for (const match of text.matchAll(entropyCandidateExpression)) {
    if (isHighEntropyCandidate(match[0])) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        ruleId: "high-entropy-token",
      });
    }
  }

  const accepted = [];
  for (const range of ranges.sort(
    (left, right) => left.start - right.start || right.end - left.end,
  )) {
    if (accepted.length === 0 || range.start >= accepted.at(-1).end) {
      accepted.push(range);
    }
  }
  return accepted;
}

export function redactArtifact(text) {
  const ranges = collectRanges(text);
  let redacted = text;

  for (const range of ranges.toReversed()) {
    const replacement = `[REDACTED:${range.ruleId}]`;
    redacted = `${redacted.slice(0, range.start)}${replacement}${redacted.slice(range.end)}`;
  }

  return { redacted, replacementCount: ranges.length };
}
