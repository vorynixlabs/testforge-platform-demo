function optionalName(value, field) {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "" || value.length > 128) {
    throw new TypeError(`${field} must be a non-empty string when provided`);
  }
  return value;
}

function normalizeNode(input, path, depth) {
  if (depth > 64) throw new TypeError("query plan nesting exceeds 64 levels");
  if (input === null || Array.isArray(input) || typeof input !== "object") {
    throw new TypeError(`plan node ${path} must be an object`);
  }
  if (typeof input["Node Type"] !== "string" || input["Node Type"].trim() === "") {
    throw new TypeError(`plan node ${path} is missing Node Type`);
  }
  if (
    typeof input["Total Cost"] !== "number" ||
    !Number.isFinite(input["Total Cost"]) ||
    input["Total Cost"] < 0
  ) {
    throw new TypeError(`plan node ${path} has invalid Total Cost`);
  }
  if (!Number.isSafeInteger(input["Plan Rows"]) || input["Plan Rows"] < 0) {
    throw new TypeError(`plan node ${path} has invalid Plan Rows`);
  }

  const childInputs = input.Plans ?? [];
  if (!Array.isArray(childInputs)) throw new TypeError(`plan node ${path} Plans must be an array`);
  const children = childInputs.map((child, index) =>
    normalizeNode(child, `${path}.${index}`, depth + 1),
  );

  return Object.freeze({
    path,
    nodeType: input["Node Type"],
    relation: optionalName(input["Relation Name"], "Relation Name"),
    index: optionalName(input["Index Name"], "Index Name"),
    totalCost: input["Total Cost"],
    estimatedRows: input["Plan Rows"],
    children: Object.freeze(children),
  });
}

export function readExplainJson(document) {
  if (!Array.isArray(document) || document.length !== 1 || !document[0]?.Plan) {
    throw new TypeError("EXPLAIN JSON must be an array containing exactly one Plan");
  }
  const root = normalizeNode(document[0].Plan, "0", 0);
  const nodes = [];
  const visit = (node) => {
    nodes.push(node);
    node.children.forEach(visit);
  };
  visit(root);
  return Object.freeze({ root, nodes: Object.freeze(nodes) });
}
