import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = new URL("../src/plan-cli.js", import.meta.url).pathname;
const policy = new URL("../examples/query-plan-policy.json", import.meta.url).pathname;
const passing = new URL("../examples/postgres-explain.json", import.meta.url).pathname;
const failing = new URL("fixtures/regressed-plan.json", import.meta.url).pathname;

function run(...arguments_) {
  return spawnSync(process.execPath, [cli, ...arguments_], { encoding: "utf8" });
}

test("returns zero for an acceptable query plan", () => {
  const result = run("--policy", policy, passing);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^PASS/);
});

test("returns one with structured regression findings", () => {
  const result = run("--policy", policy, "--json", failing);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.passed, false);
  assert.deepEqual(report.results[0].findings.map((item) => item.ruleId), [
    "denied-node",
    "estimated-rows",
    "root-cost",
  ]);
});

test("returns two for invalid command usage", () => {
  const result = run("--unknown");
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown option/);
});
