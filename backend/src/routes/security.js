const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/authorize');
const { getBlockedIps, unblockIp, blockIp, cleanupExpiredBlocks } = require('../middleware/ipBlocker');
const { handleCspReport, getCspViolations, getCspStats, resolveCspViolation, cleanupOldViolations } = require('../middleware/csp');

// Get security events (superadmin only)
router.get('/events', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { 
      event_type, 
      severity, 
      limit = 100, 
      offset = 0,
      start_date,
      end_date
    } = req.query;

    let query = 'SELECT * FROM security_events WHERE 1=1';
    const params = [];

    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    if (start_date) {
      query += ' AND created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// Get security statistics (superadmin only)
router.get('/stats', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [eventCounts] = await db.query(
      `SELECT event_type, severity, COUNT(*) as count 
       FROM security_events 
       WHERE created_at >= ?
       GROUP BY event_type, severity
       ORDER BY count DESC`,
      [startDate]
    );

    const [severityCounts] = await db.query(
      `SELECT severity, COUNT(*) as count 
       FROM security_events 
       WHERE created_at >= ?
       GROUP BY severity`,
      [startDate]
    );

    const [topIPs] = await db.query(
      `SELECT ip_address, COUNT(*) as count 
       FROM security_events 
       WHERE created_at >= ? AND ip_address IS NOT NULL
       GROUP BY ip_address 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate]
    );

    const [failedAuths] = await db.query(
      `SELECT user_email, COUNT(*) as count 
       FROM security_events 
       WHERE created_at >= ? AND event_type = 'AUTH_FAILED'
       GROUP BY user_email 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate]
    );

    const [totalEvents] = await db.query(
      `SELECT COUNT(*) as total FROM security_events WHERE created_at >= ?`,
      [startDate]
    );

    res.json({
      total_events: totalEvents[0].total,
      event_counts: eventCounts,
      severity_counts: severityCounts,
      top_ips: topIPs,
      failed_authentications: failedAuths,
      period_days: parseInt(days)
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ error: 'Failed to fetch security statistics' });
  }
});

// Get recent critical events (superadmin only)
router.get('/critical', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM security_events 
       WHERE severity IN ('high', 'critical')
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching critical events:', error);
    res.status(500).json({ error: 'Failed to fetch critical events' });
  }
});

// Get security summary for dashboard (superadmin only)
router.get('/summary', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [last24hEvents] = await db.query(
      'SELECT COUNT(*) as total FROM security_events WHERE created_at >= ?',
      [last24h]
    );

    const [last24hCritical] = await db.query(
      'SELECT COUNT(*) as total FROM security_events WHERE created_at >= ? AND severity = "critical"',
      [last24h]
    );

    const [last7dEvents] = await db.query(
      'SELECT COUNT(*) as total FROM security_events WHERE created_at >= ?',
      [last7d]
    );

    const [last7dFailedAuth] = await db.query(
      'SELECT COUNT(*) as total FROM security_events WHERE created_at >= ? AND event_type = "AUTH_FAILED"',
      [last7d]
    );

    const [last7dUnauthorized] = await db.query(
      'SELECT COUNT(*) as total FROM security_events WHERE created_at >= ? AND event_type = "UNAUTHORIZED_ACCESS"',
      [last7d]
    );

    res.json({
      last_24h: {
        total_events: last24hEvents[0].total,
        critical_events: last24hCritical[0].total
      },
      last_7d: {
        total_events: last7dEvents[0].total,
        failed_authentications: last7dFailedAuth[0].total,
        unauthorized_access: last7dUnauthorized[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching security summary:', error);
    res.status(500).json({ error: 'Failed to fetch security summary' });
  }
});

// Get audit logs (superadmin only)
router.get('/audit-logs', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { 
      action, 
      entity_type, 
      limit = 100, 
      offset = 0,
      start_date,
      end_date
    } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }

    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }

    if (start_date) {
      query += ' AND created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit statistics (superadmin only)
router.get('/audit-stats', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [actionCounts] = await db.query(
      `SELECT action, entity_type, COUNT(*) as count 
       FROM audit_logs 
       WHERE created_at >= ?
       GROUP BY action, entity_type
       ORDER BY count DESC`,
      [startDate]
    );

    const [userActions] = await db.query(
      `SELECT user_email, COUNT(*) as count 
       FROM audit_logs 
       WHERE created_at >= ? AND user_email IS NOT NULL
       GROUP BY user_email 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate]
    );

    const [entityCounts] = await db.query(
      `SELECT entity_type, COUNT(*) as count 
       FROM audit_logs 
       WHERE created_at >= ?
       GROUP BY entity_type
       ORDER BY count DESC`,
      [startDate]
    );

    const [totalActions] = await db.query(
      `SELECT COUNT(*) as total FROM audit_logs WHERE created_at >= ?`,
      [startDate]
    );

    const [failureCount] = await db.query(
      `SELECT COUNT(*) as total FROM audit_logs WHERE created_at >= ? AND status = 'failure'`,
      [startDate]
    );

    res.json({
      total_actions: totalActions[0].total,
      failure_count: failureCount[0].total,
      action_counts: actionCounts,
      top_users: userActions,
      entity_counts: entityCounts,
      period_days: parseInt(days)
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

// Get blocked IPs (superadmin only)
router.get('/blocked-ips', authenticate, isSuperAdmin, async (req, res) => {
  await getBlockedIps(req, res);
});

// Unblock IP (superadmin only)
router.delete('/blocked-ips/:ip_address', authenticate, isSuperAdmin, async (req, res) => {
  await unblockIp(req, res);
});

// Block IP manually (superadmin only)
router.post('/blocked-ips', authenticate, isSuperAdmin, async (req, res) => {
  await blockIp(req, res);
});

// Cleanup expired blocks (superadmin only)
router.post('/cleanup-blocks', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const cleaned = await cleanupExpiredBlocks();
    res.json({ message: `Cleaned up ${cleaned} expired blocks` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CSP report collection endpoint (no auth required - browser sends reports)
router.post('/csp-report', express.json({ type: 'application/csp-report' }), async (req, res) => {
  await handleCspReport(req, res);
});

// Get CSP violations (superadmin only)
router.get('/csp-violations', authenticate, isSuperAdmin, async (req, res) => {
  await getCspViolations(req, res);
});

// Get CSP statistics (superadmin only)
router.get('/csp-stats', authenticate, isSuperAdmin, async (req, res) => {
  await getCspStats(req, res);
});

// Resolve CSP violation (superadmin only)
router.put('/csp-violations/:id/resolve', authenticate, isSuperAdmin, async (req, res) => {
  await resolveCspViolation(req, res);
});

// Cleanup old CSP violations (superadmin only)
router.post('/cleanup-csp-violations', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 90;
    const cleaned = await cleanupOldViolations(daysToKeep);
    res.json({ message: `Cleaned up ${cleaned} old CSP violations` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
