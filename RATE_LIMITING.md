# Rate Limiting Documentation

## Overview

Rate limiting prevents abuse by limiting the number of requests a user can make within a specific time window. The CMS implements user-based rate limiting with role-specific limits to provide fair and appropriate access control.

## Implementation

### User-Based Rate Limiting

The system uses user-based rate limiting instead of IP-based limiting to provide:

- **Fairness**: Each user gets their own quota regardless of shared IPs
- **Flexibility**: Different roles have different limits
- **Accountability**: Rate limits are tied to user accounts
- **Shared Networks**: Multiple users on the same IP don't affect each other

### Key Generator

The rate limiter uses a smart key generator:
- **Authenticated users**: Uses `user:{userId}` as the key
- **Unauthenticated users**: Falls back to `ip:{ipAddress}` as the key

This ensures that authenticated users are tracked individually even if they share an IP address.

## Role-Based Limits

### Rate Limits by Role

| Role | Requests per 15 min | Window | Purpose |
|------|---------------------|--------|---------|
| superadmin | 2000 | 15 minutes | Administrative access |
| admin | 1500 | 15 minutes | Administrative access |
| editor | 1000 | 15 minutes | Content management |
| contributor | 500 | 15 minutes | Limited content access |
| user | 300 | 15 minutes | Basic access |
| unauthenticated | 100 | 15 minutes | Public access |

### Specialized Limiters

#### Strict Rate Limiter
- **Usage**: Authentication routes
- **Limit**: 50 requests per 15 minutes
- **Purpose**: Prevent brute force attacks

#### API Rate Limiter
- **Usage**: General API endpoints
- **Limit**: 500 requests per 15 minutes
- **Purpose**: General API protection

#### Upload Rate Limiter
- **Usage**: File upload endpoints
- **Limit**: 20 uploads per hour
- **Purpose**: Prevent abuse of upload functionality

## Configuration

### Environment Variables

Rate limits can be customized via environment variables:

```bash
# Override default limits (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Custom Limits

To customize rate limits, edit `backend/src/middleware/userRateLimit.js`:

```javascript
const roleLimits = {
  superadmin: {
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: 'Rate limit exceeded for superadmin'
  },
  // ... other roles
};
```

## Usage

### Applying Rate Limiters

#### Role-Based Rate Limiter
Automatically adjusts based on user role:

```javascript
const { createRoleBasedRateLimiter } = require('../middleware/userRateLimit');

router.get('/api/data', authenticate, createRoleBasedRateLimiter(), async (req, res) => {
  // Route logic
});
```

#### Strict Rate Limiter
For sensitive operations:

```javascript
const { createStrictRateLimiter } = require('../middleware/userRateLimit');

router.post('/api/auth/login', createStrictRateLimiter(), async (req, res) => {
  // Route logic
});
```

#### Custom Rate Limiter
For specific needs:

```javascript
const { createUserRateLimiter } = require('../middleware/userRateLimit');

const customLimiter = createUserRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Custom rate limit exceeded'
});

router.post('/api/special', customLimiter, async (req, res) => {
  // Route logic
});
```

## Current Implementation

### Global Rate Limiting

In `backend/src/server.js`:
- `/api/auth/*` - Uses strict rate limiter (50 requests/15min)
- `/api/*` - Uses API rate limiter (500 requests/15min)

### Role-Based Application

When a user is authenticated, the rate limiter automatically:
1. Detects the user's role
2. Applies the appropriate rate limit
3. Tracks requests per user ID
4. Logs violations for monitoring

## Response Format

When rate limit is exceeded:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

**Headers:**
- `RateLimit-Limit`: Maximum requests per window
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Unix timestamp when window resets

## Monitoring

### Logging

Rate limit violations are logged with:
- User ID (if authenticated)
- User role (if authenticated)
- IP address
- Request path
- Request method
- Timestamp

### Monitoring Example

```javascript
// Logged when rate limit is exceeded
{
  key: 'user:123',
  userId: 123,
  userRole: 'admin',
  ip: '192.168.1.100',
  path: '/api/stories',
  method: 'GET'
}
```

## Best Practices

### 1. Choose Appropriate Limits
- Consider normal usage patterns
- Account for burst traffic
- Test limits in staging
- Monitor for false positives

### 2. Use Role-Based Limits
- Higher limits for trusted roles
- Lower limits for public access
- Adjust based on user behavior
- Review limits regularly

### 3. Monitor Violations
- Track rate limit violations
- Investigate patterns
- Adjust limits as needed
- Identify potential abuse

### 4. Provide Clear Feedback
- Inform users of limits
- Show retry-after time
- Document rate limits
- Provide contact information

### 5. Test Thoroughly
- Test with different roles
- Simulate high traffic
- Verify fallback behavior
- Check error handling

## Troubleshooting

### Common Issues

**1. Legitimate Users Blocked**

**Cause:** Rate limits too restrictive

**Solutions:**
- Increase limits for the role
- Implement whitelisting for trusted users
- Add burst capacity
- Review user behavior patterns

**2. Shared IP Issues**

**Cause:** Multiple users on same IP affecting each other

**Solutions:**
- User-based rate limiting prevents this
- Ensure authentication is working
- Check key generator logic
- Verify user ID is being used

**3. Rate Limits Not Working**

**Cause:** Middleware not applied correctly

**Solutions:**
- Verify middleware order
- Check route configuration
- Ensure authentication runs first
- Test with different roles

**4. Inconsistent Limits**

**Cause:** Multiple limiters conflicting

**Solutions:**
- Review middleware chain
- Check for duplicate limiters
- Verify limiter priority
- Test each limiter separately

## Security Considerations

### 1. Prevent Abuse
- Rate limiting prevents DoS attacks
- Limits brute force attempts
- Protects against scraping
- Prevents resource exhaustion

### 2. Fair Access
- User-based limits ensure fairness
- Role-based limits provide appropriate access
- Prevents abuse by power users
- Protects shared resources

### 3. Monitoring
- Log violations for security monitoring
- Track patterns of abuse
- Identify compromised accounts
- Detect automated attacks

### 4. Resilience
- Rate limiting improves system resilience
- Prevents cascading failures
- Protects critical resources
- Ensures availability

## Integration with Other Security Features

### IP Blocking
- Rate limiting works alongside IP blocking
- IP blocking for repeated violations
- Rate limiting for general protection
- Both can trigger security events

### Authentication
- Rate limiting protects auth endpoints
- Failed attempts trigger IP blocking
- Successful auth resets some limits
- User-based limits require auth

### Security Events
- Rate limit violations logged
- High violation rates trigger alerts
- Patterns indicate attacks
- Integration with security dashboard

## Performance Considerations

### Memory Usage
- Rate limiting uses in-memory store by default
- Consider Redis for distributed systems
- Monitor memory usage
- Clean up expired entries

### Response Time
- Rate limiting adds minimal overhead
- Key generation is fast
- No significant performance impact
- Monitor response times

### Scalability
- In-memory store works for single server
- Use Redis for multi-server deployments
- Consider persistence requirements
- Plan for horizontal scaling

## Advanced Configuration

### Redis Store

For distributed systems, use Redis:

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || 6379
});

const limiter = rateLimit({
  store: new RedisStore({
    client: client
  }),
  // ... other options
});
```

### Dynamic Limits

Adjust limits based on system load:

```javascript
const getDynamicLimit = () => {
  const load = getSystemLoad();
  if (load > 0.8) return 100; // Reduce under high load
  if (load > 0.5) return 500; // Moderate load
  return 1000; // Normal load
};
```

### Whitelisting

Whitelist specific users or IPs:

```javascript
const whitelist = ['user:123', 'ip:192.168.1.100'];

const keyGenerator = (req) => {
  const key = getKeyGenerator(req);
  if (whitelist.includes(key)) {
    return `whitelisted:${key}`;
  }
  return key;
};
```

## Testing

### Manual Testing

```bash
# Test rate limiting
for i in {1..110}; do
  curl -X GET http://localhost:5002/api/stories
done
```

### Automated Testing

```javascript
// Test rate limiting with different roles
describe('Rate Limiting', () => {
  it('should limit unauthenticated users', async () => {
    for (let i = 0; i < 110; i++) {
      await request(app).get('/api/stories');
    }
    const response = await request(app).get('/api/stories');
    expect(response.status).toBe(429);
  });
});
```

## Documentation

### API Documentation

Include rate limit information in API docs:

```yaml
/stories:
  get:
    summary: Get all stories
    rateLimit:
      window: 15 minutes
      max: 1000
      per: user
```

### User Documentation

Inform users about rate limits:

- Document rate limits in user guide
- Show remaining quota in UI
- Provide countdown for retry
- Explain why limits exist

## Compliance

### Regulatory Requirements

- **GDPR**: Rate limiting as security measure
- **PCI DSS**: Protection against DoS
- **SOC 2**: Security monitoring and controls

## Additional Resources

- [express-rate-limit Documentation](https://github.com/nfriedly/express-rate-limit)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#implement-rate-limiting)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
