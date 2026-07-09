const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/events';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all events (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (editor+)
router.post('/', authenticate, isEditor, upload.single('image'), async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, event_type, category, price, attendees, type, status } = req.body;
    const image_url = req.file ? `/uploads/events/${req.file.filename}` : null;
    
    // Auto-determine status based on event date
    let autoStatus = 'upcoming';
    if (event_date) {
      const eventDate = new Date(event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        autoStatus = 'completed';
      } else if (eventDate.getTime() === today.getTime()) {
        autoStatus = 'ongoing';
      }
    }
    
    const [result] = await db.query(
      `INSERT INTO events (title, description, event_date, event_time, location, event_type, image_url, category, price, attendees, type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, event_time, location, event_type || 'In-Person', image_url, category, price, attendees || 0, type || 'Conference', autoStatus]
    );
    res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event (editor+)
router.put('/:id', authenticate, isEditor, upload.single('image'), async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, event_type, category, price, attendees, type, status } = req.body;
    const image_url = req.file ? `/uploads/events/${req.file.filename}` : null;
    
    // Auto-determine status based on event date
    let autoStatus = status;
    if (event_date) {
      const eventDate = new Date(event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        autoStatus = 'completed';
      } else if (eventDate.getTime() === today.getTime()) {
        autoStatus = 'ongoing';
      } else {
        autoStatus = 'upcoming';
      }
    }
    
    // Build the update query dynamically based on what fields are provided
    let query = 'UPDATE events SET title = ?, description = ?, event_date = ?, event_time = ?, location = ?, event_type = ?, category = ?, price = ?, attendees = ?, type = ?, status = ?';
    let params = [title, description, event_date, event_time, location, event_type, category, price, attendees, type, autoStatus];
    
    if (image_url) {
      query += ', image_url = ?';
      params.push(image_url);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(query, params);
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete events' });
    }
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
