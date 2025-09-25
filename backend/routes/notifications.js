const express = require('express');
const Notification = require('../models/Notification');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all active notifications for farmers
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, type, limit = 20, page = 1 } = req.query;

    const query = { isActive: true };

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Check if notification has expired
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const notifications = await Notification.find(query)
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notification by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('postedBy', 'name role');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if notification is active and not expired
    if (!notification.isActive ||
        (notification.expiresAt && notification.expiresAt < new Date())) {
      return res.status(404).json({ error: 'Notification not available' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new notification (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, type, priority, category, expiresAt, targetAudience } = req.body;

    const notification = new Notification({
      title,
      content,
      type: type || 'notification',
      priority: priority || 'medium',
      category: category || 'general',
      postedBy: req.user.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      targetAudience: targetAudience || 'all'
    });

    await notification.save();
    await notification.populate('postedBy', 'name role');

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, type, priority, category, isActive, expiresAt, targetAudience } = req.body;

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update fields
    if (title) notification.title = title;
    if (content) notification.content = content;
    if (type) notification.type = type;
    if (priority) notification.priority = priority;
    if (category) notification.category = category;
    if (isActive !== undefined) notification.isActive = isActive;
    if (expiresAt) notification.expiresAt = new Date(expiresAt);
    if (targetAudience) notification.targetAudience = targetAudience;

    await notification.save();
    await notification.populate('postedBy', 'name role');

    res.json(notification);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notification statistics (Admin only)
router.get('/admin/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          byType: { $push: '$type' },
          byCategory: { $push: '$category' },
          byPriority: { $push: '$priority' }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const categoryStats = await Notification.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      total: stats[0]?.total || 0,
      active: stats[0]?.active || 0,
      byType: typeStats,
      byCategory: categoryStats
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;