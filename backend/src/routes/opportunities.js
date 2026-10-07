const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle, uploadFileToCloud, useCloudinary } = require('../config/upload');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for opportunities with S3/Cloudinary support
const upload = uploadSingle('image', 'opportunities', 5 * 1024 * 1024);

const slugify = (text) => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const determineStatus = (deadline) => {
  if (!deadline) return 'draft';
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return deadlineDate < now ? 'expired' : 'published';
};

const parseDeadline = (date, time) => {
  if (!date) return null;
  const t = time || '23:59:59';
  return `${date} ${t}`;
};

const uploadImage = async (file) => {
  if (!file) return null;
  if (useCloudinary) {
    return await uploadFileToCloud(file, 'opportunities');
  }
  return file.location || `/uploads/opportunities/${file.filename}`;
};

// Get all opportunities (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('[GET /api/opportunities] Fetching opportunities...');
    const [rows] = await db.query('SELECT * FROM opportunities ORDER BY created_at DESC');
    console.log('[GET /api/opportunities] Successfully fetched', rows.length, 'opportunities');
    res.json(rows);
  } catch (error) {
    console.error('[GET /api/opportunities] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single opportunity by ID (public read)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    console.log(`[GET /api/opportunities/${req.params.id}] Fetching opportunity...`);
    const [rows] = await db.query('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    console.log(`[GET /api/opportunities/${req.params.id}] Successfully fetched opportunity`);
    res.json(rows[0]);
  } catch (error) {
    console.error(`[GET /api/opportunities/${req.params.id}] Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Create opportunity (editor+)
router.post('/', authenticate, isEditor, upload, async (req, res) => {
  try {
    console.log('Opportunity create request received');
    console.log('File:', req.file);
    console.log('Request body:', req.body);

    const {
      title,
      description,
      category,
      work_type,
      organization_name,
      opportunity_type,
      status,
      featured,
      country,
      city,
      location,
      remote,
      application_url,
      application_email,
      deadline
    } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const image_url = await uploadImage(req.file);
    const slug = `${slugify(title)}-${Date.now()}`;
    const short_description = description ? description.substring(0, 500) : '';
    const now = new Date();
    const finalStatus = status || 'draft';
    const published_at = finalStatus === 'published' ? new Date() : null;
    const isRemote = remote === 'true' || remote === true;
    const isFeatured = featured === 'true' || featured === true;
    
    let deadlineValue = null;
    let expiresAt = null;
    if (deadline && typeof deadline === 'string' && deadline.trim() !== '' && deadline !== 'null' && deadline !== 'undefined') {
      try {
        const parsedDate = new Date(deadline);
        if (!isNaN(parsedDate.getTime())) {
          deadlineValue = parsedDate;
          expiresAt = parsedDate;
        }
      } catch (e) {
        console.error('Invalid deadline format:', deadline);
      }
    }

    console.log('deadlineValue:', deadlineValue);
    console.log('expiresAt:', expiresAt);

    const [result] = await db.query(
      `INSERT INTO opportunities (
        title, slug, short_description, description, category, work_type, organization_name,
        opportunity_type, status, featured, country, city, location, remote,
        application_url, application_email, deadline, published_at, expires_at,
        image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        short_description,
        description,
        category || 'General',
        work_type || null,
        organization_name || null,
        opportunity_type || 'free',
        finalStatus,
        isFeatured,
        country || null,
        city || null,
        location || null,
        isRemote,
        application_url || null,
        application_email || null,
        deadlineValue,
        published_at,
        expiresAt,
        image_url,
        now,
        now
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Opportunity created successfully' });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update opportunity (editor+)
router.put('/:id', authenticate, isEditor, upload, async (req, res) => {
  try {
    console.log('Opportunity update request received');
    console.log('File:', req.file);
    console.log('Request body:', req.body);

    const {
      title,
      description,
      category,
      work_type,
      organization_name,
      opportunity_type,
      status,
      featured,
      country,
      city,
      location,
      remote,
      application_url,
      application_email,
      deadline
    } = req.body;
    const opportunityId = req.params.id;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const image_url = req.file ? await uploadImage(req.file) : null;
    const short_description = description ? description.substring(0, 500) : '';
    const now = new Date();
    const finalStatus = status || 'draft';
    const published_at = finalStatus === 'published' ? new Date() : null;
    const isRemote = remote === 'true' || remote === true;
    const isFeatured = featured === 'true' || featured === true;
    
    let deadlineValue = null;
    let expiresAt = null;
    if (deadline && typeof deadline === 'string' && deadline.trim() !== '' && deadline !== 'null' && deadline !== 'undefined') {
      try {
        const parsedDate = new Date(deadline);
        if (!isNaN(parsedDate.getTime())) {
          deadlineValue = parsedDate;
          expiresAt = parsedDate;
        }
      } catch (e) {
        console.error('Invalid deadline format:', deadline);
      }
    }

    let query = `UPDATE opportunities SET
      title = ?, slug = ?, short_description = ?, description = ?, category = ?, work_type = ?,
      organization_name = ?, opportunity_type = ?, status = ?, featured = ?,
      country = ?, city = ?, location = ?, remote = ?,
      application_url = ?, application_email = ?, deadline = ?,
      published_at = ?, expires_at = ?, updated_at = ?`;

    let params = [
      title,
      `${slugify(title)}-${Date.now()}`,
      short_description,
      description,
      category || 'General',
      work_type || null,
      organization_name || null,
      opportunity_type || 'free',
      finalStatus,
      isFeatured,
      country || null,
      city || null,
      location || null,
      isRemote,
      application_url || null,
      application_email || null,
      deadlineValue,
      published_at,
      expiresAt,
      now
    ];

    if (image_url) {
      query += ', image_url = ?';
      params.push(image_url);
    }

    query += ' WHERE id = ?';
    params.push(opportunityId);

    await db.query(query, params);
    res.json({ message: 'Opportunity updated successfully' });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete opportunity (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete opportunities' });
    }
    await db.query('DELETE FROM opportunities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
