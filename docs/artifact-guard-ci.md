# Artifact Guard in CI

Run the scanner after tests produce reports and before an artifact upload step.
The command exits with `1` when it finds a credential, so the upload never runs.

```yaml
- name: Run tests
  run: npm test

- name: Scan test artifacts
  run: node tools/artifact-guard/src/cli.js test-results/**/*.json

- name: Upload verified reports
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
```

## Respond to a finding

1. Do not upload or share the original artifact.
2. Identify the producing test or logger from the reported file and location.
3. Remove the secret at its source and regenerate the artifact.
4. Rotate the credential if it was real, even if the upload was blocked.
5. Re-run the scan and retain the clean CI result as evidence.

Use `--json` when another CI step needs structured findings. Store that output only
if its masked metadata is acceptable under the repository's retention policy.
`--redact` is useful for local investigation, but a redacted artifact should not be
published automatically without review.
