const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get overview data for the new Overview page
router.get('/', authenticate, async (req, res) => {
  try {
    // Fetch all overview data with error handling
    const storyStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
      FROM stories
    `);

    const magazineCount = await db.query('SELECT COUNT(*) as count FROM magazines');

    const podcastCount = await db.query('SELECT COUNT(*) as count FROM podcasts');

    const userCount = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM cms_users WHERE role != 'superadmin') +
        (SELECT COUNT(*) FROM users u LEFT JOIN cms_users c ON u.cms_user_id = c.id WHERE c.id IS NULL) as count
    `);

    const opportunitiesCount = await db.query('SELECT COUNT(*) as count FROM events');

    // Try to get advertisement count, default to 0 if table doesn't exist
    let advertisementCount = [{ count: 0 }];
    try {
      advertisementCount = await db.query('SELECT COUNT(*) as count FROM advertisements');
    } catch (e) {
      console.log('Advertisements table not found, using 0');
    }

    // Try to get community count, default to 0 if table doesn't exist
    let communityCount = [{ count: 0 }];
    try {
      communityCount = await db.query('SELECT COUNT(*) as count FROM communities');
    } catch (e) {
      console.log('Communities table not found, using 0');
    }

    // Top 5 published stories
    const topStories = await db.query(`
      SELECT s.id, s.title, s.excerpt, s.status, s.updated_at, a.name as author_name
      FROM stories s
      LEFT JOIN authors a ON s.author_id = a.id
      WHERE s.status = 'published'
      ORDER BY s.published_at DESC
      LIMIT 5
    `);

    // Recent content (articles only for now)
    const latestContent = await db.query(`
      SELECT 
        'Article' as type,
        s.title,
        s.status,
        'General' as category,
        s.updated_at,
        a.name as author
      FROM stories s
      LEFT JOIN authors a ON s.author_id = a.id
      ORDER BY s.updated_at DESC
      LIMIT 5
    `);

    // Pending tasks - use simple counts
    let pendingTasksData = { writer_applications: 0, article_submissions: 0, draft_content: 0, opportunities: 0, advertisements: 0 };
    try {
      const pendingTasks = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM write_applications WHERE status = 'pending') as writer_applications,
          (SELECT COUNT(*) FROM stories WHERE status = 'draft') as article_submissions,
          (SELECT COUNT(*) FROM stories WHERE status = 'draft') as draft_content,
          (SELECT COUNT(*) FROM events WHERE status = 'upcoming') as opportunities
      `);
      if (pendingTasks.length > 0) {
        pendingTasksData = pendingTasks[0];
      }
    } catch (e) {
      console.log('Error fetching pending tasks, using defaults');
    }

    // Build stats object
    const stats = {
      totalMembers: userCount[0][0].count,
      publishedArticles: storyStats[0][0].published,
      totalMagazines: magazineCount[0][0].count,
      activeCommunities: communityCount[0][0].count,
      publishedOpportunities: opportunitiesCount[0][0].count,
      activeAdvertisements: advertisementCount[0][0].count,
      websiteVisitors: 0, // This would come from analytics integration
      totalRevenue: 0 // This would come from revenue tracking
    };

    // Build analytics data (demo data for now - would come from analytics service)
    const analytics = {
      chartData: [
        { date: 'Jan 1', visitors: 1200 },
        { date: 'Jan 2', visitors: 1350 },
        { date: 'Jan 3', visitors: 1100 },
        { date: 'Jan 4', visitors: 1450 },
        { date: 'Jan 5', visitors: 1600 },
        { date: 'Jan 6', visitors: 1380 },
        { date: 'Jan 7', visitors: 1520 },
      ],
      metrics: {
        totalPageViews: 89450,
        uniqueVisitors: 45230,
        avgEngagementTime: '3m 45s'
      }
    };

    // Build revenue data (demo data for now - would come from revenue tracking)
    const revenue = {
      chartData: [
        { month: 'Jan', revenue: 8500 },
        { month: 'Feb', revenue: 9200 },
        { month: 'Mar', revenue: 6800 },
      ],
      breakdown: [
        { name: 'Display Ads', value: 8500, color: '#8b5cf6' },
        { name: 'Sponsored Stories', value: 6200, color: '#3b82f6' },
        { name: 'Podcast Sponsorships', value: 4800, color: '#10b981' },
        { name: 'Magazine Sales', value: 3200, color: '#f59e0b' },
        { name: 'Marketplace', value: 1800, color: '#ef4444' },
      ]
    };

    // Build recent content
    const recentContent = latestContent[0].map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      title: item.title,
      type: item.type,
      author: item.author || 'Unknown',
      category: item.category,
      status: item.status || 'Published',
      lastUpdated: new Date(item.updated_at).toLocaleDateString()
    }));

    // Build pending tasks
    const tasksList = [];
    if (pendingTasksData.writer_applications > 0) {
      tasksList.push({ id: 1, type: 'Writer Applications', count: pendingTasksData.writer_applications, action: 'Review Applications' });
    }
    if (pendingTasksData.article_submissions > 0) {
      tasksList.push({ id: 2, type: 'Article Submissions', count: pendingTasksData.article_submissions, action: 'Review Submissions' });
    }
    if (pendingTasksData.draft_content > 0) {
      tasksList.push({ id: 3, type: 'Draft Content', count: pendingTasksData.draft_content, action: 'Review Drafts' });
    }
    if (pendingTasksData.opportunities > 0) {
      tasksList.push({ id: 4, type: 'Opportunities', count: pendingTasksData.opportunities, action: 'Approve Opportunities' });
    }

    // Build recent activity (from top stories)
    const recentActivity = topStories[0].map((story, index) => ({
      id: index + 1,
      icon: 'FileText',
      description: `New article published: "${story.title}"`,
      user: story.author_name || 'Unknown',
      time: 'Recently'
    }));

    // Build homepage data
    const homepage = {
      featuredStory: topStories[0].length > 0 ? topStories[0][0].title : null,
      latestMagazines: [], // Would fetch from magazines table
      featuredStoriesCount: topStories[0].length,
      activeAds: advertisementCount[0][0].count,
      lastUpdate: new Date().toLocaleString()
    };

    const overviewData = {
      stats,
      analytics,
      revenue,
      recentContent,
      pendingTasks: tasksList,
      recentActivity,
      homepage
    };

    res.json(overviewData);
  } catch (error) {
    console.error('Overview data fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
