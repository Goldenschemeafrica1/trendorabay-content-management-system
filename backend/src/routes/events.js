const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle, uploadFileToCloud, useCloudinary } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for events with S3 support
const upload = uploadSingle('image', 'events', 5 * 1024 * 1024); // 5MB limit for event images

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
router.post('/', authenticate, isEditor, upload, async (req, res) => {
  try {
    console.log('Event create request received');
    console.log('File:', req.file);
    console.log('Use Cloudinary:', useCloudinary);
    
    const { title, description, event_date, event_time, location, event_type, category, price, attendees, type, status } = req.body;
    
    let image_url;
    if (req.file) {
      if (useCloudinary) {
        console.log('Uploading to Cloudinary...');
        image_url = await uploadFileToCloud(req.file, 'events');
        console.log('Cloudinary upload result:', image_url);
      } else {
        console.log('Using local storage');
        image_url = req.file.location || `/uploads/events/${req.file.filename}`;
      }
    } else {
      image_url = null;
    }
    
    console.log('Final image_url:', image_url);
    
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
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event (editor+)
router.put('/:id', authenticate, isEditor, upload, async (req, res) => {
  try {
    console.log('Event update request received');
    console.log('File:', req.file);
    console.log('Use Cloudinary:', useCloudinary);
    
    const { title, description, event_date, event_time, location, event_type, category, price, attendees, type, status } = req.body;
    
    let image_url;
    if (req.file) {
      if (useCloudinary) {
        console.log('Uploading to Cloudinary...');
        image_url = await uploadFileToCloud(req.file, 'events');
        console.log('Cloudinary upload result:', image_url);
      } else {
        console.log('Using local storage');
        image_url = req.file.location || `/uploads/events/${req.file.filename}`;
      }
    } else {
      image_url = null;
    }
    
    console.log('Final image_url:', image_url);
    
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
    console.error('Error updating event:', error);
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
