# API Request Signing Documentation

## Overview

API request signing provides an additional layer of security for critical operations by verifying the authenticity and integrity of requests using HMAC-SHA256 signatures.

## How It Works

1. **Frontend generates a signature** using the HTTP method, request path, request body, and timestamp
2. **Signature is sent** in the `X-Signature` header along with `X-Timestamp` header
3. **Backend verifies** the signature using the same secret key
4. **Requests are rejected** if:
   - Signature is missing
   - Timestamp is missing
   - Timestamp is too old (> 5 minutes)
   - Signature doesn't match

## Configuration

### Backend Environment Variables

Add to your `.env` file:

```bash
# API Signature Secret (must match frontend)
API_SIGNATURE_SECRET=your-super-secret-key-here

# Enable signature verification (set to true in production)
NODE_ENV=production
```

### Frontend Environment Variables

Add to your `.env` file:

```bash
# API Signature Secret (must match backend)
VITE_API_SIGNATURE_SECRET=your-super-secret-key-here
```

**⚠️ Important:** The secret must be the same on both frontend and backend. Use a strong, randomly generated secret in production.

## Critical Operations

The following operations require request signature verification:

### User Management
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings
- `PUT /api/settings/:key` - Update setting

### Media
- `DELETE /api/media/:id` - Delete media

### Security
- `GET /api/security/audit-logs` - View audit logs

## Implementation Details

### Backend Middleware

The `verifyRequestSignature` middleware is located in `backend/src/middleware/requestSignature.js`.

**Features:**
- HMAC-SHA256 signature generation
- Timestamp validation (5-minute window)
- Automatic skipping in development mode
- Security logging for failed verifications

### Frontend API Service

The API service in `frontend/src/services/api.js` automatically adds signatures to critical endpoints.

**Features:**
- Web Crypto API for signature generation
- Automatic detection of critical endpoints
- Timestamp generation
- Optional manual signature requirement

## Usage

### Automatic Signing

The frontend API service automatically signs requests to critical endpoints:

```javascript
// This will automatically include signature
await api.post('/users', userData);

// This will automatically include signature
await api.delete('/media/123');
```

### Manual Signing

You can force signature verification for any endpoint:

```javascript
// Force signature verification
await api.get('/some-endpoint', true);
await api.post('/some-endpoint', data, true);
```

### Custom Critical Endpoints

To add more endpoints that require signing, update the `CRITICAL_ENDPOINTS` array in `frontend/src/services/api.js`:

```javascript
const CRITICAL_ENDPOINTS = [
  '/users',
  '/settings',
  '/media',
  '/security/audit-logs',
  '/your-new-endpoint'  // Add here
];
```

Then add the middleware to the backend route:

```javascript
const { verifyRequestSignature } = require('../middleware/requestSignature');

router.post('/your-new-endpoint', authenticate, verifyRequestSignature, async (req, res) => {
  // Your route logic
});
```

## Security Considerations

### Secret Key Management

1. **Never commit secrets to version control**
2. **Use different secrets for development and production**
3. **Rotate secrets regularly**
4. **Use environment-specific secrets**

### Timestamp Validation

- Requests older than 5 minutes are rejected
- Prevents replay attacks
- Clock synchronization is important between client and server

### Development Mode

Signature verification is automatically disabled in development mode (`NODE_ENV=development`). This allows for easier development without requiring the secret to be configured.

### Error Handling

When signature verification fails:
- HTTP 401 Unauthorized response
- Error message indicates the reason (missing signature, expired timestamp, invalid signature)
- Failed attempts are logged for security monitoring

## Testing

### Testing with Signature Disabled

For testing without signature verification:

```bash
# Set development mode
NODE_ENV=development node backend/src/server.js
```

### Testing with Signature Enabled

For testing with signature verification:

```bash
# Set production mode and configure secret
NODE_ENV=production API_SIGNATURE_SECRET=test-secret node backend/src/server.js
```

### Manual Signature Generation

To manually generate a signature for testing:

```javascript
const crypto = require('crypto');
const secret = 'your-secret';
const method = 'POST';
const path = '/api/users';
const body = { name: 'test', email: 'test@example.com' };
const timestamp = Date.now().toString();

const payload = `${method}:${path}:${JSON.stringify(body)}:${timestamp}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log('Signature:', signature);
console.log('Timestamp:', timestamp);
```

## Troubleshooting

### Common Issues

**1. "Missing signature header" error**
- Ensure frontend is configured with `VITE_API_SIGNATURE_SECRET`
- Check that the secret matches between frontend and backend

**2. "Request expired" error**
- Check system clock synchronization
- Ensure client and server times are within 5 minutes

**3. "Invalid signature" error**
- Verify the secret key matches exactly
- Check that the request body is being serialized consistently
- Ensure the HTTP method and path are correct

**4. Signature verification not working in development**
- Signature verification is disabled by default in development
- Set `NODE_ENV=production` to enable it for testing

## Security Best Practices

1. **Use strong secrets** - Minimum 32 characters, mix of letters, numbers, and symbols
2. **Rotate secrets regularly** - Change secrets every 90 days
3. **Monitor failed attempts** - Log and alert on signature verification failures
4. **Use HTTPS** - Always use HTTPS in production to prevent man-in-the-middle attacks
5. **Keep secrets secure** - Use proper secret management (e.g., AWS Secrets Manager, HashiCorp Vault)
6. **Test thoroughly** - Test signature verification in staging before production deployment

## Additional Resources

- [HMAC-SHA256 Documentation](https://en.wikipedia.org/wiki/HMAC)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
