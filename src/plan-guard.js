import { compilePlanPolicy } from "./plan-policy.js";
import { readExplainJson } from "./plan-reader.js";

function finding(ruleId, node, details = {}) {
  return Object.freeze({
    ruleId,
    path: node.path,
    nodeType: node.nodeType,
    relation: node.relation,
    ...details,
  });
}

export function inspectQueryPlan(document, policyInput = {}) {
  const policy = compilePlanPolicy(policyInput);
  const plan = readExplainJson(document);
  const findings = [];

  if (plan.root.totalCost > policy.maxRootCost) {
    findings.push(
      finding("root-cost", plan.root, {
        actual: plan.root.totalCost,
        limit: policy.maxRootCost,
      }),
    );
  }

  for (const node of plan.nodes) {
    const allowedSequentialScan =
      node.nodeType === "Seq Scan" &&
      node.relation !== null &&
      policy.sequentialScanAllowlist.includes(node.relation);
    if (policy.deniedNodeTypes.includes(node.nodeType) && !allowedSequentialScan) {
      findings.push(finding("denied-node", node));
    }
    if (node.estimatedRows > policy.maxEstimatedRows) {
      findings.push(
        finding("estimated-rows", node, {
          actual: node.estimatedRows,
          limit: policy.maxEstimatedRows,
        }),
      );
    }
  }

  findings.sort((left, right) =>
    left.path === right.path ? left.ruleId.localeCompare(right.ruleId) : left.path.localeCompare(right.path),
  );

  return Object.freeze({
    passed: findings.length === 0,
    nodeCount: plan.nodes.length,
    rootCost: plan.root.totalCost,
    findingCount: findings.length,
    findings: Object.freeze(findings),
  });
}
