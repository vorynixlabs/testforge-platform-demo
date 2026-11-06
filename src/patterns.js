export const credentialPatterns = Object.freeze([
  {
    id: "aws-access-key",
    description: "AWS access key identifier",
    expression: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  },
  {
    id: "github-token",
    description: "GitHub personal or application token",
    expression: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g,
  },
  {
    id: "bearer-token",
    description: "Bearer authorization value",
    expression: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/gi,
  },
  {
    id: "private-key",
    description: "PEM private key header",
    expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    id: "credential-assignment",
    description: "Credential-like configuration assignment",
    expression:
      /\b(?:api[_-]?key|client[_-]?secret|password|passwd)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}["']?/gi,
  },
]);
