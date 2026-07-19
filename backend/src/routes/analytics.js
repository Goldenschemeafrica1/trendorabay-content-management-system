const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get overall analytics (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [views] = await db.query('SELECT SUM(view_count) as total FROM page_views');
    const [stories] = await db.query('SELECT COUNT(*) as count FROM stories');
    const [authors] = await db.query('SELECT COUNT(*) as count FROM authors');
    const [magazines] = await db.query('SELECT COUNT(*) as count FROM magazines');
    const [podcasts] = await db.query('SELECT COUNT(*) as count FROM podcasts');
    
    res.json({
      totalViews: views[0].total || 0,
      totalStories: stories[0].count || 0,
      totalAuthors: authors[0].count || 0,
      totalMagazines: magazines[0].count || 0,
      totalPodcasts: podcasts[0].count || 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get page views data (admin+)
router.get('/page-views', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        date,
        SUM(view_count) as views
      FROM page_views
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).json({ error: 'Failed to fetch page views' });
  }
});

// Get user engagement data (authenticated users)
router.get('/engagement', authenticate, async (req, res) => {
  try {
    const timeRange = req.query.range || '7d'; // 7d, 30d, 90d
    
    // Calculate date based on time range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[timeRange] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch likes, comments, and shares data
    const [likesData, commentsData, sharesData] = await Promise.all([
      db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM likes
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate]),
      db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM comments
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate]),
      db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM shares
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate])
    ]);
    
    // Aggregate data by date
    const engagementMap = new Map();
    
    // Initialize with all dates in range
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      engagementMap.set(dateStr, { date: dateStr, likes: 0, comments: 0, shares: 0 });
    }
    
    // Add likes data
    likesData[0].forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (engagementMap.has(dateStr)) {
        engagementMap.get(dateStr).likes = row.count;
      }
    });
    
    // Add comments data
    commentsData[0].forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (engagementMap.has(dateStr)) {
        engagementMap.get(dateStr).comments = row.count;
      }
    });
    
    // Add shares data
    sharesData[0].forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (engagementMap.has(dateStr)) {
        engagementMap.get(dateStr).shares = row.count;
      }
    });
    
    const engagementData = Array.from(engagementMap.values()).map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      likes: d.likes,
      comments: d.comments,
      shares: d.shares
    }));
    
    // Fetch top content by engagement
    const [topStories] = await db.query(`
      SELECT 
        id,
        title,
        'Story' as type,
        (SELECT COUNT(*) FROM likes WHERE target_id = stories.id AND target_type = 'story') as likes,
        (SELECT COUNT(*) FROM comments WHERE story_id = stories.id) as comments,
        (SELECT COUNT(*) FROM shares WHERE target_id = stories.id AND target_type = 'story') as shares
      FROM stories
      WHERE status = 'published'
      ORDER BY likes DESC
      LIMIT 5
    `);
    
    const [topMagazines] = await db.query(`
      SELECT 
        id,
        title,
        'Magazine' as type,
        (SELECT COUNT(*) FROM likes WHERE target_id = magazines.id AND target_type = 'magazine') as likes,
        (SELECT COUNT(*) FROM comments WHERE magazine_id = magazines.id) as comments,
        (SELECT COUNT(*) FROM shares WHERE target_id = magazines.id AND target_type = 'magazine') as shares
      FROM magazines
      ORDER BY likes DESC
      LIMIT 5
    `);
    
    const [topPodcasts] = await db.query(`
      SELECT 
        id,
        title,
        'Podcast' as type,
        (SELECT COUNT(*) FROM likes WHERE target_id = podcasts.id AND target_type = 'podcast') as likes,
        (SELECT COUNT(*) FROM comments WHERE podcast_id = podcasts.id) as comments,
        (SELECT COUNT(*) FROM shares WHERE target_id = podcasts.id AND target_type = 'podcast') as shares
      FROM podcasts
      ORDER BY likes DESC
      LIMIT 5
    `);
    
    // Combine and sort top content
    const allTopContent = [
      ...topStories[0].map(s => ({ title: s.title, type: s.type, likes: s.likes || 0, comments: s.comments || 0, shares: s.shares || 0 })),
      ...topMagazines[0].map(m => ({ title: m.title, type: m.type, likes: m.likes || 0, comments: m.comments || 0, shares: m.shares || 0 })),
      ...topPodcasts[0].map(p => ({ title: p.title, type: p.type, likes: p.likes || 0, comments: p.comments || 0, shares: p.shares || 0 }))
    ].sort((a, b) => b.likes - a.likes).slice(0, 5);
    
    // Fetch top users by engagement
    const [topUsers] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.id) as total_likes,
        (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as total_comments,
        (SELECT COUNT(*) FROM shares WHERE user_id = u.id) as total_shares
      FROM users u
      WHERE u.id IN (
        SELECT DISTINCT user_id FROM likes
        UNION
        SELECT DISTINCT user_id FROM comments
        UNION
        SELECT DISTINCT user_id FROM shares
      )
      ORDER BY (total_likes + total_comments + total_shares) DESC
      LIMIT 10
    `);
    
    const formattedTopUsers = topUsers[0].map(u => ({
      name: u.name || 'Unknown',
      email: u.email || '',
      likes: u.total_likes || 0,
      comments: u.total_comments || 0,
      shares: u.total_shares || 0,
      total: (u.total_likes || 0) + (u.total_comments || 0) + (u.total_shares || 0)
    }));
    
    // Calculate totals
    const totalLikes = engagementData.reduce((sum, d) => sum + d.likes, 0);
    const totalComments = engagementData.reduce((sum, d) => sum + d.comments, 0);
    const totalShares = engagementData.reduce((sum, d) => sum + d.shares, 0);
    const engagementRate = totalLikes > 0 ? ((totalComments + totalShares) / totalLikes * 100).toFixed(1) : 0;
    
    res.json({
      engagementData,
      topContent: allTopContent,
      topUsers: formattedTopUsers,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate
    });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
});

// Get top pages (admin+)
router.get('/top-pages', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        page_url,
        SUM(view_count) as views
      FROM page_views
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({ error: 'Failed to fetch top pages' });
  }
});

// Get overall analytics summary (admin+)
router.get('/summary', authenticate, isAdmin, async (req, res) => {
  try {
    const [views] = await db.query('SELECT SUM(view_count) as total FROM page_views');

    res.json({
      totalViews: views[0].total || 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// Get traffic sources (authenticated users)
router.get('/traffic-sources', authenticate, async (req, res) => {
  try {
    console.log('Fetching traffic sources...');
    // Check if traffic_sources table exists, if not return mock data
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'traffic_sources'
    `);

    console.log('Table exists count:', tableExists[0].count);

    if (tableExists[0].count === 0) {
      console.log('Table does not exist, returning mock data');
      // Return mock data if table doesn't exist
      res.json([
        { name: 'Organic Search', value: 45, color: '#8b5cf6' },
        { name: 'Direct', value: 25, color: '#10b981' },
        { name: 'Social Media', value: 18, color: '#f59e0b' },
        { name: 'Referral', value: 12, color: '#ef4444' }
      ]);
      return;
    }

    // Fetch real data from traffic_sources table
    const [rows] = await db.query(`
      SELECT 
        source_name as name,
        percentage as value,
        color
      FROM traffic_sources
      ORDER BY value DESC
    `);

    console.log('Fetched rows from traffic_sources:', rows);
    console.log('Rows length:', rows.length);

    res.json(rows.length > 0 ? rows : [
      { name: 'Organic Search', value: 45, color: '#8b5cf6' },
      { name: 'Direct', value: 25, color: '#10b981' },
      { name: 'Social Media', value: 18, color: '#f59e0b' },
      { name: 'Referral', value: 12, color: '#ef4444' }
    ]);
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    res.status(500).json({ error: 'Failed to fetch traffic sources' });
  }
});

// Get device types (authenticated users)
router.get('/device-types', authenticate, async (req, res) => {
  try {
    // Check if device_types table exists
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'device_types'
    `);

    if (tableExists[0].count === 0) {
      res.json([
        { name: 'Desktop', value: 52, color: '#8b5cf6' },
        { name: 'Mobile', value: 38, color: '#10b981' },
        { name: 'Tablet', value: 10, color: '#f59e0b' }
      ]);
      return;
    }

    const [rows] = await db.query(`
      SELECT 
        device_name as name,
        percentage as value,
        color
      FROM device_types
      ORDER BY value DESC
    `);

    res.json(rows.length > 0 ? rows : [
      { name: 'Desktop', value: 52, color: '#8b5cf6' },
      { name: 'Mobile', value: 38, color: '#10b981' },
      { name: 'Tablet', value: 10, color: '#f59e0b' }
    ]);
  } catch (error) {
    console.error('Error fetching device types:', error);
    res.status(500).json({ error: 'Failed to fetch device types' });
  }
});

// Get countries (authenticated users)
router.get('/countries', authenticate, async (req, res) => {
  try {
    // Check if countries table exists
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'countries'
    `);

    if (tableExists[0].count === 0) {
      res.json([
        { name: 'United States', value: 35, color: '#8b5cf6' },
        { name: 'United Kingdom', value: 18, color: '#10b981' },
        { name: 'Germany', value: 12, color: '#f59e0b' },
        { name: 'France', value: 10, color: '#ef4444' },
        { name: 'Canada', value: 8, color: '#ec4899' }
      ]);
      return;
    }

    const [rows] = await db.query(`
      SELECT 
        country_name as name,
        percentage as value,
        color
      FROM countries
      ORDER BY value DESC
      LIMIT 10
    `);

    res.json(rows.length > 0 ? rows : [
      { name: 'United States', value: 35, color: '#8b5cf6' },
      { name: 'United Kingdom', value: 18, color: '#10b981' },
      { name: 'Germany', value: 12, color: '#f59e0b' },
      { name: 'France', value: 10, color: '#ef4444' },
      { name: 'Canada', value: 8, color: '#ec4899' }
    ]);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get Trendorabay analytics summary (authenticated users)
router.get('/trendorabay/summary', authenticate, async (req, res) => {
  try {
    res.json({
      totalViews: 125000,
      uniqueVisitors: 45000,
      avgTimeOnPage: 4.5
    });
  } catch (error) {
    console.error('Error fetching Trendorabay analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch Trendorabay analytics summary' });
  }
});

// Get Trendorabay traffic sources (authenticated users)
router.get('/trendorabay/traffic-sources', authenticate, async (req, res) => {
  try {
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'trendorabay_traffic_sources'
    `);

    if (tableExists[0].count === 0) {
      res.json([
        { name: 'Organic Search', value: 52, color: '#3b82f6' },
        { name: 'Direct', value: 20, color: '#10b981' },
        { name: 'Social Media', value: 15, color: '#f59e0b' },
        { name: 'Referral', value: 13, color: '#ef4444' }
      ]);
      return;
    }

    const [rows] = await db.query(`
      SELECT 
        source_name as name,
        percentage as value,
        color
      FROM trendorabay_traffic_sources
      ORDER BY value DESC
    `);

    res.json(rows.length > 0 ? rows : [
      { name: 'Organic Search', value: 52, color: '#3b82f6' },
      { name: 'Direct', value: 20, color: '#10b981' },
      { name: 'Social Media', value: 15, color: '#f59e0b' },
      { name: 'Referral', value: 13, color: '#ef4444' }
    ]);
  } catch (error) {
    console.error('Error fetching Trendorabay traffic sources:', error);
    res.status(500).json({ error: 'Failed to fetch Trendorabay traffic sources' });
  }
});

// Get Trendorabay device types (authenticated users)
router.get('/trendorabay/device-types', authenticate, async (req, res) => {
  try {
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'trendorabay_device_types'
    `);

    if (tableExists[0].count === 0) {
      res.json([
        { name: 'Desktop', value: 45, color: '#3b82f6' },
        { name: 'Mobile', value: 48, color: '#10b981' },
        { name: 'Tablet', value: 7, color: '#f59e0b' }
      ]);
      return;
    }

    const [rows] = await db.query(`
      SELECT 
        device_name as name,
        percentage as value,
        color
      FROM trendorabay_device_types
      ORDER BY value DESC
    `);

    res.json(rows.length > 0 ? rows : [
      { name: 'Desktop', value: 45, color: '#3b82f6' },
      { name: 'Mobile', value: 48, color: '#10b981' },
      { name: 'Tablet', value: 7, color: '#f59e0b' }
    ]);
  } catch (error) {
    console.error('Error fetching Trendorabay device types:', error);
    res.status(500).json({ error: 'Failed to fetch Trendorabay device types' });
  }
});

// Get Trendorabay countries (authenticated users)
router.get('/trendorabay/countries', authenticate, async (req, res) => {
  try {
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'trendorabay_countries'
    `);

    if (tableExists[0].count === 0) {
      res.json([
        { name: 'Nigeria', value: 40, color: '#3b82f6' },
        { name: 'United States', value: 15, color: '#10b981' },
        { name: 'United Kingdom', value: 12, color: '#f59e0b' },
        { name: 'Ghana', value: 10, color: '#ef4444' },
        { name: 'Kenya', value: 8, color: '#ec4899' }
      ]);
      return;
    }

    const [rows] = await db.query(`
      SELECT 
        country_name as name,
        percentage as value,
        color
      FROM trendorabay_countries
      ORDER BY value DESC
      LIMIT 10
    `);

    res.json(rows.length > 0 ? rows : [
      { name: 'Nigeria', value: 40, color: '#3b82f6' },
      { name: 'United States', value: 15, color: '#10b981' },
      { name: 'United Kingdom', value: 12, color: '#f59e0b' },
      { name: 'Ghana', value: 10, color: '#ef4444' },
      { name: 'Kenya', value: 8, color: '#ec4899' }
    ]);
  } catch (error) {
    console.error('Error fetching Trendorabay countries:', error);
    res.status(500).json({ error: 'Failed to fetch Trendorabay countries' });
  }
});

module.exports = router;
