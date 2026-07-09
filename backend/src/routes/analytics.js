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

// Get user engagement data (admin+)
router.get('/engagement', authenticate, isAdmin, async (req, res) => {
  try {
    res.json([]); // No engagement data yet
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

module.exports = router;
