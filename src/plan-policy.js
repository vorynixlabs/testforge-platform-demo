const nodeTypePattern = /^[A-Za-z][A-Za-z ]{1,63}$/;
const relationPattern = /^[A-Za-z_][A-Za-z0-9_.]{0,126}$/;

function finiteLimit(value, fallback, name) {
  const resolved = value ?? fallback;
  if (typeof resolved !== "number" || !Number.isFinite(resolved) || resolved <= 0) {
    throw new TypeError(`${name} must be a positive finite number`);
  }
  return resolved;
}

export function compilePlanPolicy(input = {}) {
  if (input === null || Array.isArray(input) || typeof input !== "object") {
    throw new TypeError("policy must be an object");
  }

  const deniedNodeTypes = input.deniedNodeTypes ?? ["Seq Scan"];
  if (
    !Array.isArray(deniedNodeTypes) ||
    deniedNodeTypes.some((nodeType) => typeof nodeType !== "string" || !nodeTypePattern.test(nodeType))
  ) {
    throw new TypeError("deniedNodeTypes must contain valid PostgreSQL node names");
  }

  const sequentialScanAllowlist = input.sequentialScanAllowlist ?? [];
  if (
    !Array.isArray(sequentialScanAllowlist) ||
    sequentialScanAllowlist.some((relation) => typeof relation !== "string" || !relationPattern.test(relation))
  ) {
    throw new TypeError("sequentialScanAllowlist must contain valid relation names");
  }

  return Object.freeze({
    deniedNodeTypes: Object.freeze([...new Set(deniedNodeTypes)].sort()),
    sequentialScanAllowlist: Object.freeze([...new Set(sequentialScanAllowlist)].sort()),
    maxRootCost: finiteLimit(input.maxRootCost, 1000, "maxRootCost"),
    maxEstimatedRows: finiteLimit(input.maxEstimatedRows, 10000, "maxEstimatedRows"),
  });
}
