# Query Plan Guard

Query Plan Guard is a zero-dependency CLI and JavaScript library for checking PostgreSQL `EXPLAIN (FORMAT JSON)` output in CI. It helps catch performance regressions that functional database tests can miss, such as an indexed lookup changing to a sequential scan or a cardinality estimate growing unexpectedly.

## Capture a plan safely

Use a read-only test database account and parameterized SQL. Save only the JSON plan—do not include credentials, production values, or query results.

```sql
EXPLAIN (FORMAT JSON)
SELECT id, status FROM test_runs WHERE id = $1;
```

## Configure the gate

```json
{
  "deniedNodeTypes": ["Seq Scan"],
  "sequentialScanAllowlist": ["schema_migrations"],
  "maxRootCost": 100,
  "maxEstimatedRows": 1000
}
```

Allowlist sequential scans only for deliberately tiny relations. Review cost and row limits alongside schema migrations and representative fixture statistics; PostgreSQL cost units are planner estimates, not elapsed milliseconds.

## Run in CI

```bash
node src/plan-cli.js --policy policy.json explain.json
node src/plan-cli.js --policy policy.json --json explain.json > plan-report.json
```

Exit code `0` means every plan passed, `1` means at least one regression was found, and `2` means the command or input was invalid. JSON findings contain rule, node path, node type, relation, actual value, and configured limit without including query parameters.

The bundled example and all tests use synthetic data. Query Plan Guard reads existing files and never connects to a database.
