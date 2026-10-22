# Architecture

TestForge separates execution mechanics from policy decisions so each part can be tested and evolved independently.

## Control plane

The control plane accepts a versioned run manifest, validates configuration, expands parameter matrices, and produces deterministic shard plans. Priority and concurrency rules decide when each shard may enter the worker queue.

## Worker coordination

Workers acquire time-bound leases before starting work. Heartbeats renew active leases, while expired leases return unfinished work to the queue. Cancellation and timeout events are recorded rather than inferred from missing output.

## Result model

Every attempt produces a structured terminal result plus optional artifacts. Result fingerprints support deduplication, while summaries and pagination keep large suites navigable. Artifact retention rules are evaluated separately from test status.

## Policy layer

Retry eligibility, flaky-test classification, quarantine reviews, and regression budgets consume structured results. Each policy returns an explicit reason and evidence so reports can explain automated decisions.

## Reporting

Reports combine execution state, baseline comparison groups, budget violations, trends, and artifact references. The concise release verdict links back to the complete audit trail.

## Design constraints

- Deterministic inputs must produce deterministic plans.
- Invalid configuration fails before workers are scheduled.
- State transitions are append-only audit events.
- Policy decisions preserve their inputs and version.
- Private implementation details are not included in this public repository.
