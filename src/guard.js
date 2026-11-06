import { scanEntropy } from "./entropy.js";
import { scanPatterns } from "./scanner.js";

export function scanArtifact(text, options = {}) {
  const patternFindings = scanPatterns(text);
  const entropyFindings = options.entropy === false ? [] : scanEntropy(text, options);
  const occupied = new Set(
    patternFindings.map((finding) => `${finding.line}:${finding.column}:${finding.length}`),
  );

  const findings = [
    ...patternFindings,
    ...entropyFindings.filter(
      (finding) => !occupied.has(`${finding.line}:${finding.column}:${finding.length}`),
    ),
  ].sort((left, right) =>
    left.line === right.line ? left.column - right.column : left.line - right.line,
  );

  return {
    safe: findings.length === 0,
    findingCount: findings.length,
    findings,
  };
}
