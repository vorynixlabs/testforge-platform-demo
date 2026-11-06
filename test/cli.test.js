import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = new URL("../src/cli.js", import.meta.url).pathname;
const clean = new URL("fixtures/clean-report.txt", import.meta.url).pathname;
const exposed = new URL("fixtures/exposed-report.txt", import.meta.url).pathname;

function run(...arguments_) {
  return spawnSync(process.execPath, [cli, ...arguments_], {
    encoding: "utf8",
  });
}

test("returns zero for clean artifacts", () => {
  const result = run(clean);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^PASS/);
});

test("returns one and JSON findings for unsafe artifacts", () => {
  const result = spawnSync(process.execPath, [cli, "--json", exposed], { encoding: "utf8" });
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.safe, false);
  assert.equal(report.results[0].findingCount, 2);
});

test("prints a redacted artifact without leaked values", () => {
  const result = spawnSync(process.execPath, [cli, "--redact", exposed], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /\[REDACTED:bearer-token\]/);
  assert.equal(result.stdout.includes("pQ7vN2xK9mR4tY8wL3cF6hJ1sD5zB0uE"), false);
});
