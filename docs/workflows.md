# Execution and release workflow

## 1. Prepare

A run begins with a validated manifest containing suite selection, environment, parameters, deadlines, and artifact policy. Configuration schemas reject unsupported values before capacity is reserved.

## 2. Plan

The planner expands parameter combinations under a maximum-combination budget, then creates stable shards. Repeating the same inputs produces the same ordering and shard membership.

## 3. Execute

Workers lease shards, emit progress events, and return terminal results. Retries are scheduled only for eligible statuses while attempts remain. Exponential delays prevent transient failures from overwhelming shared dependencies.

## 4. Interpret

Recent histories produce flaky-test scores. High-confidence instability enters a review workflow with an owner and review date. Quarantined tests continue to run and remain visible in reports.

## 5. Compare

The candidate run is compared with a compatible successful baseline. Tests are grouped as regressed, improved, unchanged, added, or removed. Removed tests stay visible because they may signal lost coverage.

## 6. Gate

Regression-count and failure-rate budgets produce a pass or blocked verdict. Reviewed exceptions are explicit and do not remove the underlying result from the report.

## 7. Publish

The final report includes the verdict, policy reasons, source run identifiers, attempt history, and retained artifacts. CI may merge only after required validation completes successfully.
