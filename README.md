# TestForge Platform Demo

A runnable, source-safe collection of TestForge ideas for dependable software
testing and release operations.

> The production implementation is maintained privately. Everything here is an
> independently written public example with synthetic data and no private source,
> configuration, credentials, or internal links.

## Runnable showcase: Artifact Guard

Artifact Guard is a zero-dependency Node.js scanner that catches credentials
accidentally captured in test logs and reports before those files are published as
CI artifacts. It combines explicit credential formats with conservative entropy
detection, emits masked findings, and can produce a redacted copy.

```console
$ node src/cli.js examples/sample-test-report.json
PASS examples/sample-test-report.json: 0 finding(s)
```

Scan one or more files. Exit code `0` means the artifacts are clear, `1` means
findings should block publication, and `2` means the command could not run.

```bash
node src/cli.js test-results/**/*.json
node src/cli.js --json test-results/report.json > guard-report.json
node src/cli.js --redact test-results/report.json > report.redacted.json
node src/cli.js --no-entropy test-results/report.json
```

The scanner never includes the complete match in a finding. It reports a masked
preview, location, rule, severity, length, and stable fingerprint instead.

### Run locally

Artifact Guard requires Node.js 20 or newer and has no runtime dependencies.

```bash
npm test
npm run check
npm run scan:example
```

See [CI integration](docs/artifact-guard-ci.md) and the
[detection policy](docs/artifact-guard-policy.md) for operational guidance.

## Runnable showcase: Query Plan Guard

Query Plan Guard checks PostgreSQL `EXPLAIN (FORMAT JSON)` files for plan
regressions that functional database assertions may miss. Policies can deny
specific node types, allow intentional scans on tiny relations, and bound root
cost and estimated rows.

```console
$ node src/plan-cli.js --policy examples/query-plan-policy.json examples/postgres-explain.json
PASS examples/postgres-explain.json: 1 node(s), 0 finding(s), root cost 8.17
```

Use `--json` for CI reports. Exit code `0` means every plan passed, `1` means a
regression was found, and `2` means the input or command was invalid. The tool
only reads saved plans; it never connects to a database or includes query
parameters in findings.

See the [Query Plan Guard guide](docs/query-plan-guard.md) for safe plan capture,
policy design, and CI examples.

## Platform capabilities

| Area | Capability |
| --- | --- |
| Test execution | Run manifests, validation, priorities, cancellation, and progress tracking |
| Scale | Deterministic sharding, worker leases, queue health, and parameter matrices |
| Reliability | Retry policies, timeout budgets, flaky-test scoring, and quarantine reviews |
| Reporting | Result summaries, trend analysis, artifact indexing, and retention rules |
| Release confidence | Baseline comparisons, regression budgets, and auditable verdicts |
| Integrations | Webhook signatures, retry handling, and structured event records |
| Database testing | Offline PostgreSQL plan validation and configurable regression gates |

## Typical workflow

1. Validate a versioned run manifest.
2. Expand parameters and create deterministic shards.
3. Schedule work under concurrency and timeout budgets.
4. Record attempts, events, artifacts, and worker leases.
5. Compare results with a compatible successful baseline.
6. Apply retry, quarantine, and regression policies.
7. Publish a concise verdict with complete supporting evidence.

## Documentation

- [Artifact Guard CI integration](docs/artifact-guard-ci.md)
- [Artifact Guard policy and safety boundary](docs/artifact-guard-policy.md)
- [Query Plan Guard](docs/query-plan-guard.md)
- [Architecture](docs/architecture.md)
- [Execution and release workflow](docs/workflows.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## Status

TestForge is under active development. Public examples evolve only when a useful,
tested concept can be shared without exposing private implementation details.
