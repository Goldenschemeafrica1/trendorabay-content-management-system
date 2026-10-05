const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get notification counts for sidebar
router.get('/counts', authenticate, isAdmin, async (req, res) => {
  try {
    let userCount = 0;
    let storyCount = 0;
    let magazineCount = 0;
    let guestApplicationCount = 0;
    let pitchCount = 0;
    let writeApplicationCount = 0;
    let orderCount = 0;
    let securityEventCount = 0;
    let eventCount = 0;
    let partnershipInquiryCount = 0;
    let communityCount = 0;

    // Get new users count (created within last 7 days)
    try {
      const [userRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM (
          SELECT c.id, c.created_at
          FROM cms_users c
          UNION ALL
          SELECT u.id, u.created_at
          FROM users u
          WHERE u.cms_user_id IS NULL
        ) all_users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      userCount = userRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching user count:', error);
    }

    // Get pending stories count (status = 'draft' or 'pending_review')
    try {
      const [storyRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM stories
        WHERE status IN ('draft', 'pending_review', 'pending')
      `);
      storyCount = storyRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching story count:', error);
    }

    // Get pending magazines count (no status column, count all)
    try {
      const [magazineRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM magazines
      `);
      magazineCount = magazineRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching magazine count:', error);
    }

    // Get pending guest applications
    try {
      const [guestApplicationRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM guest_applications
        WHERE status IN ('pending', 'new')
      `);
      guestApplicationCount = guestApplicationRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching guest application count:', error);
    }

    // Get pending pitch submissions
    try {
      const [pitchRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM pitch_submissions
        WHERE status IN ('pending', 'new')
      `);
      pitchCount = pitchRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching pitch count:', error);
    }

    // Get pending write applications
    try {
      const [writeApplicationRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM write_applications
        WHERE status IN ('pending', 'new')
      `);
      writeApplicationCount = writeApplicationRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching write application count:', error);
    }

    // Get pending orders
    try {
      const [orderRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE status IN ('pending', 'processing')
      `);
      orderCount = orderRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching order count:', error);
    }

    // Get unread security events
    try {
      const [securityEventRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM security_events
        WHERE resolved = false OR resolved = 0
      `);
      securityEventCount = securityEventRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching security event count:', error);
    }

    // Get upcoming opportunities
    try {
      const [eventRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM events
        WHERE event_date >= NOW()
      `);
      eventCount = eventRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching opportunity count:', error);
    }

    // Get pending partnership inquiries
    try {
      const [partnershipInquiryRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM partnership_proposals
        WHERE status IN ('pending', 'new')
      `);
      partnershipInquiryCount = partnershipInquiryRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching partnership inquiry count:', error);
    }

    // Get pending communities (status = 'active' for new ones needing review)
    try {
      const [communityRows] = await db.query(`
        SELECT COUNT(*) as count
        FROM communities
        WHERE status = 'active'
      `);
      communityCount = communityRows[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching community count:', error);
      communityCount = 0;
    }

    res.json({
      stories: storyCount,
      magazines: magazineCount,
      guestApplications: guestApplicationCount,
      pitchSubmissions: pitchCount,
      pitchApplications: writeApplicationCount,
      orders: orderCount,
      securityEvents: securityEventCount,
      events: eventCount,
      partnersInquiry: partnershipInquiryCount,
      userManagement: userCount,
      communities: communityCount
    });
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ error: 'Failed to fetch notification counts' });
  }
});

module.exports = router;
