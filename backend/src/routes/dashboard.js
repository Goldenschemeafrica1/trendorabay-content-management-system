const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get dashboard data (optimized single endpoint)
router.get('/', authenticate, async (req, res) => {
  try {
    const userRole = req.user?.role || 'user';
    const isAdminOrHigher = userRole === 'admin' || userRole === 'superadmin';
    const isEditorOrHigher = userRole === 'editor' || userRole === 'admin' || userRole === 'superadmin';

    // Fetch all dashboard data in parallel with optimized queries
    const [
      storyStats,
      magazineCount,
      podcastCount,
      orderCount,
      userCount,
      topStories,
      latestUsers,
      latestSubscribers,
      upcomingEvents
    ] = await Promise.all([
      // Story stats (counts only)
      db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN status = 'published' AND published_at > NOW() THEN 1 ELSE 0 END) as scheduled
        FROM stories
      `),
      
      // Magazine count
      db.query('SELECT COUNT(*) as count FROM magazines'),
      
      // Podcast count
      db.query('SELECT COUNT(*) as count FROM podcasts'),
      
      // Order count (editor+ only)
      isEditorOrHigher 
        ? db.query('SELECT COUNT(*) as count FROM orders')
        : Promise.resolve([{ count: 0 }]),
      
      // User count (admin+ only, excluding superadmin)
      isAdminOrHigher
        ? db.query("SELECT COUNT(*) as count FROM cms_users WHERE role != 'superadmin'")
        : Promise.resolve([{ count: 0 }]),
      
      // Top 10 published stories
      db.query(`
        SELECT s.id, s.title, s.excerpt, s.published_at, a.name as author_name
        FROM stories s
        LEFT JOIN authors a ON s.author_id = a.id
        WHERE s.status = 'published'
        ORDER BY s.published_at DESC
        LIMIT 10
      `),
      
      // Latest 5 users (admin+ only) - union of cms_users and users tables
      isAdminOrHigher
        ? db.query(`
          SELECT id, name, email, role, created_at FROM (
            SELECT 
              c.id,
              COALESCE(c.name, u.username, TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')))) as name,
              COALESCE(c.email, u.email) as email,
              COALESCE(c.role, u.role, 'user') as role,
              COALESCE(c.created_at, u.created_at) as created_at
            FROM cms_users c
            LEFT JOIN users u ON c.id = u.cms_user_id
            
            UNION ALL
            
            SELECT 
              u.id,
              COALESCE(u.username, TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')))) as name,
              u.email,
              u.role,
              u.created_at
            FROM users u
            LEFT JOIN cms_users c ON u.cms_user_id = c.id
            WHERE c.id IS NULL
          ) combined
          WHERE role != 'superadmin'
          ORDER BY created_at DESC
          LIMIT 5
        `)
        : Promise.resolve([]),
      
      // Latest 5 subscribers (admin+ only)
      isAdminOrHigher
        ? db.query(`
          SELECT id, name, email, status, created_at
          FROM subscribers
          ORDER BY created_at DESC
          LIMIT 5
        `)
        : Promise.resolve([]),
      
      // Upcoming 3 events
      db.query(`
        SELECT id, title, event_date, location, status
        FROM events
        WHERE status = 'upcoming' OR event_date >= CURDATE()
        ORDER BY event_date ASC
        LIMIT 3
      `)
    ]);

    // Build response
    const dashboardData = {
      stats: {
        totalStories: storyStats[0][0].total,
        publishedArticles: storyStats[0][0].published,
        draftArticles: storyStats[0][0].draft,
        scheduledPosts: storyStats[0][0].scheduled,
        magazines: magazineCount[0][0].count,
        podcasts: podcastCount[0][0].count,
        orders: orderCount[0][0].count,
        users: userCount[0][0].count
      },
      topStories: topStories[0],
      latestUsers: latestUsers.length > 0 ? latestUsers[0].map(user => ({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email || 'No email',
        role: user.role || 'user',
        joined_at: user.created_at || new Date().toISOString()
      })) : [],
      latestSubscribers: latestSubscribers.length > 0 ? latestSubscribers[0] : [],
      upcomingEvents: upcomingEvents[0]
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
