# IP Blocking for Failed Authentication Attempts

## Overview

The IP blocking system automatically blocks IP addresses after repeated failed authentication attempts to prevent brute force attacks.

## How It Works

1. **Failed Attempt Tracking**: Each failed login attempt is recorded with the IP address
2. **Threshold Blocking**: After reaching the threshold (default: 5 attempts), the IP is blocked
3. **Temporary Block**: Blocks are temporary (default: 30 minutes) to allow legitimate users to retry
4. **Automatic Cleanup**: Expired blocks are automatically cleaned up

## Configuration

Add these environment variables to your `.env` file:

```bash
# Maximum failed attempts before blocking (default: 5)
MAX_FAILED_ATTEMPTS=5

# Block duration in minutes (default: 30)
BLOCK_DURATION_MINUTES=30

# Time window for counting attempts in minutes (default: 15)
ATTEMPT_WINDOW_MINUTES=15
```

## API Endpoints

### Get Blocked IPs (Superadmin Only)

```http
GET /api/security/blocked-ips
Authorization: Bearer <token>
```

**Response:**
```json
{
  "blocked_ips": [
    {
      "id": 1,
      "ip_address": "192.168.1.100",
      "blocked_at": "2024-01-15T10:30:00.000Z",
      "expires_at": "2024-01-15T11:00:00.000Z",
      "failed_attempts": 5,
      "last_attempt_at": "2024-01-15T10:30:00.000Z",
      "reason": "Invalid password",
      "unblocked_at": null,
      "unblocked_by": null
    }
  ]
}
```

### Unblock IP (Superadmin Only)

```http
DELETE /api/security/blocked-ips/:ip_address
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "IP unblocked successfully"
}
```

### Manually Block IP (Superadmin Only)

```http
POST /api/security/blocked-ips
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip_address": "192.168.1.100",
  "reason": "Suspicious activity",
  "duration_minutes": 60
}
```

**Response:**
```json
{
  "message": "IP blocked successfully",
  "expires_at": "2024-01-15T11:30:00.000Z"
}
```

### Cleanup Expired Blocks (Superadmin Only)

```http
POST /api/security/cleanup-blocks
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Cleaned up 15 expired blocks"
}
```

## Database Schema

The `blocked_ips` table stores IP blocking information:

```sql
CREATE TABLE blocked_ips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  failed_attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP NULL,
  reason VARCHAR(255),
  unblocked_at TIMESTAMP NULL,
  unblocked_by INT NULL,
  INDEX idx_ip_address (ip_address),
  INDEX idx_expires_at (expires_at),
  INDEX idx_blocked_at (blocked_at)
);
```

## Security Features

### Automatic Blocking
- IPs are automatically blocked after threshold is reached
- Blocks are temporary to avoid permanent lockouts
- Failed attempts are counted within a time window

### IP Detection
- Supports IPv4 and IPv6 addresses
- Handles proxy headers (X-Forwarded-For, X-Real-IP)
- Falls back to connection remote address

### Logging
- All failed attempts are logged with reason
- Security events are recorded for monitoring
- Failed login attempts trigger security alerts

### Admin Controls
- Superadmins can view all blocked IPs
- Superadmins can manually unblock IPs
- Superadmins can manually block IPs
- Cleanup of expired blocks can be triggered manually

## Usage Examples

### Monitoring Blocked IPs

```javascript
// In your security dashboard
const response = await fetch('/api/security/blocked-ips', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log('Blocked IPs:', data.blocked_ips);
```

### Unblocking an IP

```javascript
// Unblock a specific IP
await fetch(`/api/security/blocked-ips/${ipAddress}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Manual IP Blocking

```javascript
// Block an IP manually
await fetch('/api/security/blocked-ips', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ip_address: '192.168.1.100',
    reason: 'Suspicious activity detected',
    duration_minutes: 60
  })
});
```

## Best Practices

### 1. Configure Appropriate Thresholds
- Set `MAX_FAILED_ATTEMPTS` based on your security requirements
- Too low: May block legitimate users
- Too high: May not prevent brute force attacks effectively

### 2. Monitor Blocked IPs
- Regularly review blocked IPs in the security dashboard
- Investigate patterns of repeated blocks
- Adjust thresholds based on observed behavior

### 3. Provide User Feedback
- Inform users when their IP is blocked
- Show remaining block time
- Provide contact information for support

### 4. Regular Cleanup
- Schedule regular cleanup of expired blocks
- Use the cleanup endpoint or create a cron job
- Monitor database size for performance

### 5. Whitelist Trusted IPs
- Consider adding a whitelist for trusted IPs
- Office networks, VPNs, or known good IPs
- This prevents accidental blocking of legitimate users

## Troubleshooting

### Legitimate User Blocked

**Problem:** A legitimate user is blocked due to failed attempts.

**Solutions:**
1. Unblock the IP manually via admin endpoint
2. Increase the threshold temporarily
3. Add the IP to a whitelist (if implemented)
4. Investigate why the user had failed attempts

### High Number of Blocks

**Problem:** Many IPs are being blocked.

**Solutions:**
1. Check for targeted brute force attacks
2. Increase the threshold if too sensitive
3. Implement CAPTCHA for login attempts
4. Consider rate limiting before IP blocking

### Blocks Not Expiring

**Problem:** Blocks are not expiring as expected.

**Solutions:**
1. Check the `BLOCK_DURATION_MINUTES` setting
2. Verify the cleanup job is running
3. Manually trigger cleanup via endpoint
4. Check database timezone settings

## Security Considerations

### IP Spoofing
- IP addresses can be spoofed in some cases
- Use additional security measures (2FA, rate limiting)
- Don't rely solely on IP blocking

### Shared Networks
- Multiple users may share the same IP (NAT)
- Consider shorter block durations for shared networks
- Provide clear feedback to users

### IPv6 Considerations
- IPv6 addresses can have many variations
- Normalize IPv6 addresses before comparison
- Consider subnet blocking for IPv6

## Integration with Other Security Features

### Rate Limiting
- IP blocking works alongside rate limiting
- Rate limiting catches burst attacks
- IP blocking catches sustained attacks

### Security Events
- All blocks are logged as security events
- Failed attempts trigger security alerts
- Integration with monitoring systems

### Audit Logs
- IP blocking actions are audited
- Manual blocks/unblocks are tracked
- Admin actions are logged

## Additional Resources

- [OWASP Brute Force Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#preventing-brute-force)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [IP Address Security](https://owasp.org/www-community/controls/Blocking_IP_Address)
