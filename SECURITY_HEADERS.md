# Security Headers Documentation

## Overview

Security headers are HTTP response headers that enhance the security of web applications by protecting against various attacks. This document outlines the security headers implemented in the CMS.

## Implemented Security Headers

### Frontend (Vite Config)

The frontend implements security headers via `vite-plugin-secure-headers` in `vite.config.js`:

#### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; ...
```

**Purpose:** Controls which resources the browser is allowed to load.

**Directives:**
- `default-src 'self'` - Default policy for all content types
- `script-src` - Allowed script sources
- `style-src` - Allowed style sources
- `img-src` - Allowed image sources
- `font-src` - Allowed font sources
- `connect-src` - Allowed connection targets
- `frame-src` - Allowed frame sources
- `object-src 'none'` - Disallows plugins
- `base-uri 'self'` - Restricts base URLs
- `form-action 'self'` - Restricts form submissions
- `frame-ancestors 'self'` - Prevents clickjacking
- `require-trusted-types-for 'script'` - Enforces Trusted Types API
- `report-uri /api/security/csp-report` - CSP violation reporting

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

**Purpose:** Prevents MIME type sniffing.

**Protection:** Stops browsers from interpreting files as a different MIME type than specified.

#### X-Frame-Options
```
X-Frame-Options: DENY
```

**Purpose:** Prevents clickjacking attacks.

**Protection:** Disallows the page from being displayed in a frame.

#### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```

**Purpose:** Enables XSS filtering in older browsers.

**Protection:** Blocks pages if XSS attack is detected.

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose:** Controls how much referrer information is sent.

**Protection:** Limits referrer information to same-origin or secure cross-origin requests.

#### Permissions-Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Purpose:** Controls browser features and APIs.

**Protection:** Disables sensitive features (geolocation, microphone, camera).

#### Strict-Transport-Security (Production Only)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Purpose:** Enforces HTTPS connections.

**Protection:** Prevents downgrade attacks and ensures HTTPS is always used.

**Note:** Only applied in production mode.

### Backend (Express Middleware)

The backend implements security headers via `helmet` and custom CSP middleware in `server.js` and `middleware/csp.js`:

#### Helmet Headers
- `X-DNS-Prefetch-Control` - Controls DNS prefetching
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-Permitted-Cross-Domain-Policies` - Controls cross-domain policies
- `Referrer-Policy` - Controls referrer information

#### Custom CSP Middleware
- Generates CSP policy based on environment
- Supports development and production modes
- Includes violation reporting
- Additional security headers (same as frontend)

## Installation

### Frontend

The security headers are implemented using `vite-plugin-secure-headers`:

```bash
cd frontend
npm install --save-dev vite-plugin-secure-headers
```

The plugin is already configured in `vite.config.js`.

### Backend

Security headers are implemented using `helmet` (already installed) and custom CSP middleware:

```bash
cd backend
npm install helmet
```

## Configuration

### Frontend Configuration

Edit `frontend/vite.config.js`:

```javascript
import secureHeaders from 'vite-plugin-secure-headers'

export default defineConfig({
  plugins: [
    react(),
    secureHeaders({
      'Content-Security-Policy': '...',
      'X-Content-Type-Options': 'nosniff',
      // ... other headers
    })
  ],
})
```

### Backend Configuration

Edit `backend/src/middleware/csp.js` to modify CSP policy:

```javascript
const generateCspPolicy = () => {
  // Customize CSP policy here
  return [
    "default-src 'self'",
    // ... other directives
  ].join('; ');
};
```

## Testing Security Headers

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Click on the main document
5. Check Response Headers section

### Using curl

```bash
curl -I https://your-domain.com
```

### Using Online Tools

- [Security Headers Scanner](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [HackerTarget](https://hackertarget.com/http-header-check/)

## Header Reference

### Content Security Policy (CSP)

**Directives:**
- `default-src` - Default policy for all content
- `script-src` - Allowed script sources
- `style-src` - Allowed style sources
- `img-src` - Allowed image sources
- `font-src` - Allowed font sources
- `connect-src` - Allowed connection targets
- `frame-src` - Allowed frame sources
- `object-src` - Allowed plugin sources
- `base-uri` - Allowed base URLs
- `form-action` - Allowed form targets
- `frame-ancestors` - Allowed parents
- `report-uri` - Violation reporting endpoint

**Special Directives:**
- `require-trusted-types-for` - Enforces Trusted Types API
- `upgrade-insecure-requests` - Upgrades HTTP to HTTPS

### X-Content-Type-Options

**Values:**
- `nosniff` - Prevents MIME sniffing

### X-Frame-Options

**Values:**
- `DENY` - No framing allowed
- `SAMEORIGIN` - Only same-origin framing
- `ALLOW-FROM uri` - Allow from specific origin (deprecated)

### X-XSS-Protection

**Values:**
- `0` - Disables XSS filter
- `1` - Enables XSS filter
- `1; mode=block` - Enables and blocks on detection

### Referrer-Policy

**Values:**
- `no-referrer` - No referrer sent
- `no-referrer-when-downgrade` - Default
- `origin` - Only origin sent
- `strict-origin` - Only origin for HTTPS
- `origin-when-cross-origin` - Full URL for same-origin
- `strict-origin-when-cross-origin` - Origin for HTTPS cross-origin
- `unsafe-url` - Full URL always (not recommended)

### Permissions-Policy

**Features:**
- `geolocation` - Geolocation API
- `microphone` - Microphone access
- `camera` - Camera access
- `payment` - Payment Request API
- `usb` - WebUSB API
- `magnetometer` - Magnetometer API
- `gyroscope` - Gyroscope API
- `accelerometer` - Accelerometer API

### Strict-Transport-Security

**Directives:**
- `max-age` - Time in seconds
- `includeSubDomains` - Apply to all subdomains
- `preload` - Allow inclusion in HSTS preload list

## Best Practices

### 1. Test Headers Thoroughly
- Test in development environment first
- Verify functionality with headers enabled
- Monitor CSP violation reports
- Check for broken features

### 2. Use Report-Only Mode Initially
```javascript
// For testing
res.setHeader('Content-Security-Policy-Report-Only', cspPolicy);
```

### 3. Gradual Implementation
- Start with permissive policies
- Tighten gradually based on violations
- Monitor impact on user experience
- Have rollback plan ready

### 4. Keep Headers Updated
- Review headers regularly
- Update with new security best practices
- Monitor for deprecated headers
- Stay informed about new threats

### 5. Monitor Violations
- Check CSP violation reports regularly
- Investigate high-severity violations
- Update policies based on findings
- Document resolution steps

## Troubleshooting

### Common Issues

**1. Resources Not Loading**

**Cause:** CSP blocking resources

**Solutions:**
- Check CSP violation reports
- Add allowed domains to CSP
- Verify resource URLs
- Check for protocol mismatches

**2. Inline Scripts Blocked**

**Cause:** CSP blocking inline scripts

**Solutions:**
- Use nonce or hash for inline scripts
- Move to external files
- Add 'unsafe-inline' (not recommended for production)

**3. Frames Not Working**

**Cause:** X-Frame-Options blocking frames

**Solutions:**
- Use CSP frame-ancestors instead
- Set appropriate frame-ancestors value
- Verify iframe requirements

**4. Referrer Information Missing**

**Cause:** Referrer-Policy too restrictive

**Solutions:**
- Adjust Referrer-Policy value
- Use less restrictive policy
- Verify analytics requirements

## Security Scoring

### Security Headers Scanner

Test your headers at [securityheaders.com](https://securityheaders.com/):

**Rating Criteria:**
- A+ - Excellent security posture
- A - Very good security posture
- B - Good security posture
- C - Fair security posture
- D - Poor security posture
- F - Failing security posture

### Mozilla Observatory

Test at [observatory.mozilla.org](https://observatory.mozilla.org/):

**Grade Criteria:**
- A+ - Excellent
- A - Very Good
- B - Good
- C - Fair
- D - Poor
- F - Failure

## Additional Resources

- [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers Scanner](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

## Compliance

### Regulatory Requirements

- **GDPR**: Appropriate technical security measures
- **PCI DSS**: Secure transmission of cardholder data
- **HIPAA**: Protection of electronic protected health information
- **SOC 2**: Security monitoring and controls

## Current Implementation Status

✅ **Frontend:**
- Content Security Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (production only)

✅ **Backend:**
- Helmet security headers
- Custom CSP middleware
- Additional security headers
- CSP violation reporting

Both frontend and backend have comprehensive security headers implemented and configured.
