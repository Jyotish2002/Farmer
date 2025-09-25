const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be farmer or admin.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get system statistics (Admin only)
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmerUsers = await User.countDocuments({ role: 'farmer' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const totalNotifications = await Notification.countDocuments();
    const activeNotifications = await Notification.countDocuments({ isActive: true });

    res.json({
      users: {
        total: totalUsers,
        farmers: farmerUsers,
        admins: adminUsers
      },
      notifications: {
        total: totalNotifications,
        active: activeNotifications
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk notification management (Admin only)
router.post('/notifications/bulk', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'Notifications array is required' });
    }

    const createdNotifications = [];

    for (const notificationData of notifications) {
      const notification = new Notification({
        ...notificationData,
        postedBy: req.user.userId
      });
      await notification.save();
      createdNotifications.push(notification);
    }

    res.status(201).json({
      message: `${createdNotifications.length} notifications created successfully`,
      notifications: createdNotifications
    });
  } catch (error) {
    console.error('Bulk create notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;