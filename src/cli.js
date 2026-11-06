#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

import { scanArtifact } from "./guard.js";
import { redactArtifact } from "./redact.js";

const help = `Usage: artifact-guard [options] <file...>

Scan test reports, logs, and other text artifacts before publication.

Options:
  --json          emit a machine-readable report
  --redact        print a redacted copy (requires exactly one file)
  --no-entropy    use explicit credential patterns only
  -h, --help      show this help
`;

function parseArguments(arguments_) {
  const options = { files: [], entropy: true, json: false, redact: false };
  for (const argument of arguments_) {
    if (argument === "--json") options.json = true;
    else if (argument === "--redact") options.redact = true;
    else if (argument === "--no-entropy") options.entropy = false;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else options.files.push(argument);
  }
  return options;
}

function formatText(results) {
  const lines = [];
  for (const result of results) {
    lines.push(`${result.safe ? "PASS" : "FAIL"} ${result.file}: ${result.findingCount} finding(s)`);
    for (const finding of result.findings) {
      lines.push(
        `  ${finding.line}:${finding.column} ${finding.severity} ${finding.ruleId} ${finding.preview} (${finding.fingerprint})`,
      );
    }
  }
  return lines.join("\n");
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(help);
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(help);
    return;
  }
  if (options.files.length === 0 || (options.redact && options.files.length !== 1)) {
    console.error(options.redact ? "--redact requires exactly one file." : "At least one file is required.");
    console.error(help);
    process.exitCode = 2;
    return;
  }

  const results = [];
  for (const file of options.files) {
    const text = await readFile(file, "utf8");
    results.push({ file, ...scanArtifact(text, { entropy: options.entropy }) });
  }

  if (options.redact) {
    const source = await readFile(options.files[0], "utf8");
    console.log(redactArtifact(source).redacted);
  } else if (options.json) {
    console.log(JSON.stringify({ safe: results.every((result) => result.safe), results }, null, 2));
  } else {
    console.log(formatText(results));
  }

  if (results.some((result) => !result.safe)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`artifact-guard: ${error.message}`);
  process.exitCode = 2;
});
