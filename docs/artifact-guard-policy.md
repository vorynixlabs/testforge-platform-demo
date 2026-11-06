# Artifact Guard policy

Artifact Guard is a small public demonstration of defensive secret detection for
test output. It scans text files before they are uploaded as CI artifacts.

## Safety boundary

- The implementation and fixtures in this repository are independently written
  for public use.
- Examples contain synthetic values that cannot authenticate to any service.
- The tool reads local files only and makes no network requests.
- Findings expose a fingerprint and masked preview, never the full matched value.
- A positive finding should block publication until the source artifact is
  removed or regenerated without the sensitive value.

## Detection model

Artifact Guard combines explicit credential formats with conservative entropy
checks. Pattern matches are high confidence. Entropy findings require a minimum
length and a mixture of character classes to reduce noise from ordinary prose.

This demonstration is a useful CI safeguard, not a replacement for provider-side
secret scanning, credential rotation, or a dedicated data-loss prevention system.
