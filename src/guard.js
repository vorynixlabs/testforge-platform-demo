import { scanEntropy } from "./entropy.js";
import { scanPatterns } from "./scanner.js";

export function scanArtifact(text, options = {}) {
  const patternFindings = scanPatterns(text);
  const entropyFindings = options.entropy === false ? [] : scanEntropy(text, options);
  const isCoveredByPattern = (finding) =>
    patternFindings.some(
      (patternFinding) =>
        patternFinding.line === finding.line &&
        finding.column >= patternFinding.column &&
        finding.column + finding.length <= patternFinding.column + patternFinding.length,
    );

  const findings = [
    ...patternFindings,
    ...entropyFindings.filter((finding) => !isCoveredByPattern(finding)),
  ].sort((left, right) =>
    left.line === right.line ? left.column - right.column : left.line - right.line,
  );

  return {
    safe: findings.length === 0,
    findingCount: findings.length,
    findings,
  };
}
