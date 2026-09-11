# Subresource Integrity (SRI) Guide

## Overview

Subresource Integrity (SRI) enables browsers to verify that resources they fetch (for example, from a CDN) are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched resource must match.

## Current Status

The frontend currently uses Vite and npm packages, with no external CDN scripts loaded. When external scripts are added, SRI should be implemented for security.

## Implementation Guide

### 1. Generate SRI Hashes

Use the provided script to generate SRI hashes for external resources:

```bash
# Generate SHA-384 hash (recommended)
node scripts/generate-sri.js https://cdn.jsdelivr.net/npm/example@1.0.0/script.js

# Generate SHA-256 hash
node scripts/generate-sri.js https://cdn.jsdelivr.net/npm/example@1.0.0/script.js sha256

# Generate all hash algorithms
node scripts/generate-sri.js https://cdn.jsdelivr.net/npm/example@1.0.0/script.js all
```

**Output Example:**
```
integrity="sha384-abc123def456..."
```

### 2. Add SRI to HTML

Add the `integrity` and `crossorigin` attributes to script tags:

```html
<!-- Without SRI -->
<script src="https://cdn.jsdelivr.net/npm/example@1.0.0/script.js"></script>

<!-- With SRI -->
<script src="https://cdn.jsdelivr.net/npm/example@1.0.0/script.js" 
        integrity="sha384-abc123def456..." 
        crossorigin="anonymous"></script>
```

**Important Notes:**
- Always include `crossorigin="anonymous"` for CDN resources
- Use SHA-384 for better security (stronger than SHA-256)
- Multiple hashes can be specified for fallback: `integrity="sha384-... sha256-..."`

### 3. CSP Configuration

The CSP policy already supports SRI with the `require-trusted-types-for 'script'` directive. This ensures that:
- Scripts with valid SRI hashes are allowed
- Scripts without SRI from external domains are blocked
- Trusted Types API is enforced for DOM XSS sinks

### 4. Update Process

When updating external libraries:

1. **Generate new hash** for the updated version
2. **Update the integrity attribute** in HTML
3. **Test in development** before deploying
4. **Monitor CSP violations** for any issues

## Best Practices

### 1. Use Strong Hash Algorithms
- **SHA-384** is recommended (better security than SHA-256)
- **SHA-512** provides the strongest security
- Avoid SHA-256 if possible (weaker collision resistance)

### 2. Always Include crossorigin
```html
<script src="..." integrity="..." crossorigin="anonymous"></script>
```

### 3. Version Your Dependencies
```html
<!-- Good - Pinned version -->
<script src="https://cdn.jsdelivr.net/npm/library@1.2.3/script.js" 
        integrity="..." 
        crossorigin="anonymous"></script>

<!-- Bad - Latest version (hash may change) -->
<script src="https://cdn.jsdelivr.net/npm/library@latest/script.js" 
        integrity="..." 
        crossorigin="anonymous"></script>
```

### 4. Monitor for Violations
- Check CSP violation reports regularly
- Investigate any SRI failures immediately
- Update hashes when libraries are updated

### 5. Use Subresource Integrity for All External Resources
Apply SRI to:
- JavaScript files
- CSS files
- Web Workers
- Module scripts

## Common Scenarios

### Adding a New External Library

1. **Choose a CDN** (e.g., jsDelivr, unpkg, cdnjs)
2. **Pin the version** in the URL
3. **Generate SRI hash**:
   ```bash
   node scripts/generate-sri.js https://cdn.jsdelivr.net/npm/library@1.0.0/script.js
   ```
4. **Add to HTML** with integrity attribute
5. **Test** in development environment
6. **Deploy** and monitor CSP violations

### Updating an Existing Library

1. **Update the version** in the URL
2. **Generate new SRI hash** for the new version
3. **Update integrity attribute** in HTML
4. **Test** thoroughly
5. **Deploy** and monitor

### Handling Hash Mismatches

If you see SRI violations:

1. **Verify the URL** is correct
2. **Check the version** hasn't changed
3. **Regenerate the hash** for the current version
4. **Update the integrity attribute**
5. **Investigate if CDN was compromised**

## Security Benefits

### 1. Prevents CDN Compromise
- Ensures resources haven't been modified
- Detects man-in-the-middle attacks
- Protects against malicious CDN updates

### 2. Ensures Resource Authenticity
- Guarantees the exact resource is loaded
- Prevents substitution attacks
- Verifies source integrity

### 3. Complements CSP
- Works alongside Content Security Policy
- Provides additional layer of verification
- Enables stricter CSP policies

## Troubleshooting

### Common Issues

**1. "Integrity check failed" error**

**Cause:** Hash doesn't match the resource

**Solutions:**
- Verify the URL is correct
- Check the version hasn't changed
- Regenerate the hash
- Ensure crossorigin is set correctly

**2. Resource not loading with SRI**

**Cause:** CORS or CSP blocking

**Solutions:**
- Add `crossorigin="anonymous"`
- Check CSP allows the domain
- Verify CDN sends proper CORS headers

**3. Hash changes unexpectedly**

**Cause:** Version changed or CDN modified resource

**Solutions:**
- Pin to specific version
- Use a different CDN
- Contact CDN provider

## CSP Integration

The CSP policy is configured to support SRI:

```javascript
// Development
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com

// Production
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net
require-trusted-types-for 'script'
```

**Key Directives:**
- `require-trusted-types-for 'script'` - Enforces Trusted Types API
- External domains are allowed but should use SRI
- `unsafe-inline` is still needed for development

## Automation

### CI/CD Integration

Add SRI hash generation to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Generate SRI hashes
  run: |
    node scripts/generate-sri.js https://cdn.jsdelivr.net/npm/library@1.0.0/script.js > sri-hashes.txt
```

### Pre-commit Hook

Automatically check SRI hashes before commits:

```bash
#!/bin/bash
# .git/hooks/pre-commit
node scripts/generate-sri.js https://cdn.jsdelivr.net/npm/library@1.0.0/script.js
# Compare with stored hash
```

## Additional Resources

- [MDN SRI Documentation](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [SRI Hash Generator](https://www.srihash.org/)
- [OWASP SRI Guide](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#subresource-integrity-sri)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)

## Current External Resources

As of now, the frontend does not load any external CDN scripts. All dependencies are managed through npm and bundled by Vite. When external scripts are added, follow this guide to implement SRI.
