# Public roadmap

This roadmap describes product direction without exposing private implementation details. Items move only after tests and CI verify the underlying changes.

## Available foundations

- run validation and state transitions
- deterministic sharding and parameter matrices
- worker leases, queue health, and cancellation
- result summaries, pagination, and artifact policies
- retry governance and flaky-test classification
- baseline comparisons and regression budgets

## v0.2 Test Operations

- persist exact baseline selections for repeatable comparisons
- expose flaky-test trends and quarantine state in the dashboard
- require quarantine ownership and review deadlines
- improve comparison summaries for release owners

## Next

- organization-level suites and reusable environment profiles
- configurable notification routing for blocked releases
- richer duration and reliability trend visualizations
- exportable audit packages for regulated workflows
- API examples for CI providers and webhook consumers

## Principles for prioritization

Work is prioritized by release risk reduced, operator time saved, and evidence quality improved. New automation must remain explainable and must not hide failures merely to make a gate pass.
