#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

import { inspectQueryPlan } from "./plan-guard.js";

const help = `Usage: query-plan-guard --policy <policy.json> [--json] <explain.json...>

Check PostgreSQL EXPLAIN (FORMAT JSON) files for plan regressions.

Options:
  --policy <file>  policy JSON (required)
  --json           emit a machine-readable report
  -h, --help       show this help
`;

function parseArguments(arguments_) {
  const options = { files: [], json: false, policyFile: null };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--json") options.json = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--policy") {
      index += 1;
      if (!arguments_[index] || arguments_[index].startsWith("-")) {
        throw new Error("--policy requires a file path");
      }
      options.policyFile = arguments_[index];
    } else if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else options.files.push(argument);
  }
  return options;
}

async function readJson(file) {
  const source = await readFile(file, "utf8");
  try {
    return JSON.parse(source);
  } catch {
    throw new Error(`${file} is not valid JSON`);
  }
}

function formatText(results) {
  const lines = [];
  for (const result of results) {
    lines.push(
      `${result.passed ? "PASS" : "FAIL"} ${result.file}: ${result.nodeCount} node(s), ${result.findingCount} finding(s), root cost ${result.rootCost}`,
    );
    for (const finding of result.findings) {
      const relation = finding.relation ? ` relation=${finding.relation}` : "";
      const limit = finding.limit === undefined ? "" : ` actual=${finding.actual} limit=${finding.limit}`;
      lines.push(`  ${finding.path} ${finding.ruleId} node=${finding.nodeType}${relation}${limit}`);
    }
  }
  return lines.join("\n");
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(help);
    return;
  }
  if (!options.policyFile || options.files.length === 0) {
    throw new Error("A policy and at least one EXPLAIN JSON file are required");
  }

  const policy = await readJson(options.policyFile);
  const results = [];
  for (const file of options.files) {
    results.push({ file, ...inspectQueryPlan(await readJson(file), policy) });
  }

  if (options.json) console.log(JSON.stringify({ passed: results.every((item) => item.passed), results }, null, 2));
  else console.log(formatText(results));
  if (results.some((item) => !item.passed)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`query-plan-guard: ${error.message}`);
  console.error(help);
  process.exitCode = 2;
});
