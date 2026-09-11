# Content Security Policy (CSP) Documentation

## Overview

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. This implementation includes CSP headers with violation reporting to monitor and address security issues.

## How It Works

1. **CSP Headers**: The server sends CSP headers with every response, defining which resources can be loaded
2. **Violation Reporting**: When a browser detects a CSP violation, it sends a report to the specified endpoint
3. **Violation Storage**: Reports are stored in the database for analysis and resolution
4. **Severity Assessment**: Violations are automatically categorized by severity (high, medium, low)
5. **Resolution Tracking**: Superadmins can review, resolve, and track CSP violations

## CSP Policy

### Development Mode
More permissive policy for development:
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com
img-src 'self' data: https: blob:
font-src 'self' https://cdn.jsdelivr.net https://unpkg.com
connect-src 'self' https://trendorabay-content-management-system.onrender.com http://localhost:5002 ws://localhost:5002 wss://trendorabay-content-management-system.onrender.com
frame-src 'self'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'self'
report-uri /api/security/csp-report
```

### Production Mode
Strict policy for production:
```
default-src 'self'
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net
img-src 'self' data: https: blob:
font-src 'self' https://cdn.jsdelivr.net
connect-src 'self' https://trendorabay-content-management-system.onrender.com wss://trendorabay-content-management-system.onrender.com
frame-src 'self'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'self'
upgrade-insecure-requests
report-uri /api/security/csp-report
```

## Additional Security Headers

The CSP middleware also adds these security headers:

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-XSS-Protection**: `1; mode=block` - Enables XSS filtering
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Permissions-Policy**: `geolocation=(), microphone=(), camera=()` - Disables sensitive features

## API Endpoints

### CSP Report Collection
```http
POST /api/security/csp-report
Content-Type: application/csp-report
```

**Note:** This endpoint does not require authentication as browsers send reports automatically.

### Get CSP Violations (Superadmin Only)
```http
GET /api/security/csp-violations?severity=high&resolved=false&limit=100
Authorization: Bearer <token>
```

**Query Parameters:**
- `severity` - Filter by severity (high, medium, low)
- `resolved` - Filter by resolution status (true, false)
- `limit` - Number of results (default: 100)
- `start_date` - Filter by start date
- `end_date` - Filter by end date

**Response:**
```json
{
  "violations": [
    {
      "id": 1,
      "document_uri": "https://example.com/page",
      "referrer": "https://example.com",
      "blocked_uri": "https://evil.com/script.js",
      "violated_directive": "script-src",
      "effective_directive": "script-src-elem",
      "original_policy": "...",
      "disposition": "report",
      "script_sample": "...",
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.100",
      "reported_at": "2024-01-15T10:30:00.000Z",
      "severity": "high",
      "resolved": false,
      "resolved_at": null,
      "resolved_by": null,
      "notes": null
    }
  ]
}
```

### Get CSP Statistics (Superadmin Only)
```http
GET /api/security/csp-stats?days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_violations": 150,
  "by_severity": {
    "high": 10,
    "medium": 40,
    "low": 100
  },
  "by_directive": [
    { "violated_directive": "script-src", "count": 50 },
    { "violated_directive": "img-src", "count": 30 }
  ],
  "top_blocked_uris": [
    { "blocked_uri": "https://evil.com/script.js", "count": 25 }
  ],
  "resolved_status": {
    "resolved": 100,
    "unresolved": 50
  },
  "period_days": 30
}
```

### Resolve CSP Violation (Superadmin Only)
```http
PUT /api/security/csp-violations/:id/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Fixed by updating CSP policy"
}
```

**Response:**
```json
{
  "message": "CSP violation marked as resolved"
}
```

### Cleanup Old Violations (Superadmin Only)
```http
POST /api/security/cleanup-csp-violations?days=90
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Cleaned up 45 old CSP violations"
}
```

## Database Schema

The `csp_violations` table stores CSP violation reports:

```sql
CREATE TABLE csp_violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_uri VARCHAR(500) NOT NULL,
  referrer VARCHAR(500),
  blocked_uri VARCHAR(500) NOT NULL,
  violated_directive VARCHAR(100) NOT NULL,
  effective_directive VARCHAR(100),
  original_policy TEXT,
  disposition VARCHAR(20),
  script_sample TEXT,
  status_code INT,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  severity VARCHAR(20) DEFAULT 'low',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  resolved_by INT NULL,
  notes TEXT,
  INDEX idx_reported_at (reported_at),
  INDEX idx_severity (severity),
  INDEX idx_resolved (resolved),
  INDEX idx_violated_directive (violated_directive)
);
```

## Severity Assessment

Violations are automatically categorized by severity:

### High Severity
- `script-src` violations (potential XSS)
- `object-src` violations (plugin injection)
- `frame-src` violations (clickjacking)
- `base-uri` violations (base tag injection)

### Medium Severity
- `style-src` violations (CSS injection)
- `img-src` violations (image loading issues)
- `connect-src` violations (data exfiltration)
- `font-src` violations (font loading issues)

### Low Severity
- All other directives

## Frontend Integration

### Viewing CSP Violations

Navigate to **Analytics → CSP Violations** in the sidebar (superadmin only).

The CSP Violations page provides:
- List of all violations with filters
- Severity indicators (high, medium, low)
- Resolution status tracking
- Ability to resolve violations with notes
- Statistics dashboard with:
  - Total violations count
  - Violations by severity
  - Violations by directive
  - Top blocked URIs
  - Resolved vs unresolved status

## Best Practices

### 1. Start in Report-Only Mode
Before enforcing CSP, use report-only mode to identify violations:
```javascript
res.setHeader('Content-Security-Policy-Report-Only', cspPolicy);
```

### 2. Gradual Enforcement
- Start with a permissive policy
- Monitor violations
- Tighten policy gradually
- Fix legitimate violations

### 3. Handle Inline Scripts
- Use `nonce` or `hash` instead of `unsafe-inline`
- Move inline scripts to external files
- Use template literals with proper escaping

### 4. Regular Monitoring
- Review CSP violations regularly
- Investigate high-severity violations immediately
- Track resolution progress
- Adjust policy based on findings

### 5. Third-Party Resources
- Only allow trusted third-party domains
- Use Subresource Integrity (SRI) for external scripts
- Monitor third-party changes
- Have fallback plans for third-party failures

## Troubleshooting

### Common Issues

**1. Legitimate Resources Blocked**

**Problem:** Your own resources are being blocked by CSP.

**Solutions:**
- Add your domain to the appropriate directive
- Use relative URLs instead of absolute URLs
- Check for protocol mismatches (http vs https)
- Verify the directive is correct for the resource type

**2. Inline Scripts Not Working**

**Problem:** Inline scripts are blocked by CSP.

**Solutions:**
- Use `nonce` attribute: `<script nonce="random-value">`
- Use hash: `<script integrity="sha256-...">`
- Move to external file
- Use `unsafe-inline` (not recommended for production)

**3. No Violations Reported**

**Problem:** CSP violations are not being reported.

**Solutions:**
- Verify `report-uri` is correct
- Check browser console for CSP errors
- Ensure the endpoint is accessible
- Verify CSP policy is being sent

**4. Too Many Violations**

**Problem:** Overwhelming number of violations.

**Solutions:**
- Use report-only mode first
- Filter by severity
- Focus on high-severity violations
- Adjust policy to be more permissive temporarily

## Security Considerations

### Report URI Security
- The report endpoint does not require authentication (browsers send reports)
- Implement rate limiting to prevent abuse
- Validate report format
- Monitor for malicious reports

### Policy Evolution
- CSP policies should evolve over time
- Start permissive, tighten gradually
- Monitor impact on user experience
- Have rollback plan ready

### Third-Party Dependencies
- Third-party changes can cause violations
- Monitor third-party updates
- Use SRI for critical resources
- Have contingency plans

## Integration with Other Security Features

### Security Events
- High-severity CSP violations trigger security events
- Automatic logging for monitoring
- Integration with security dashboard

### Audit Logs
- CSP policy changes are audited
- Resolution actions are tracked
- Admin actions are logged

### Rate Limiting
- Report endpoint is rate-limited
- Prevents abuse of reporting system
- Protects against DoS attacks

## Additional Resources

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
