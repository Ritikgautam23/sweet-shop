const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

console.log('Notifications module loaded');

const router = express.Router();

// Mock notifications storage for mock users
const mockNotifications = {};

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if mock user
    if (userId.startsWith('1') || userId.startsWith('2') || userId > 1000000000000) {
      const notifications = mockNotifications[userId] || [];
      return res.json({
        success: true,
        data: notifications
      });
    }

    // DB user
    const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if mock user
    if (userId.startsWith('1') || userId.startsWith('2') || userId > 1000000000000) {
      if (mockNotifications[userId]) {
        const notification = mockNotifications[userId].find(n => n._id === id);
        if (notification) {
          notification.read = true;
        }
      }
      return res.json({
        success: true,
        message: 'Notification marked as read'
      });
    }

    // DB user
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Create notification (internal use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    // Check if mock user
    if (userId.startsWith('1') || userId.startsWith('2') || userId > 1000000000000) {
      if (!mockNotifications[userId]) {
        mockNotifications[userId] = [];
      }
      const newNotification = {
        _id: Date.now().toString(),
        user: userId,
        title,
        message,
        type,
        read: false,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockNotifications[userId].push(newNotification);
      return res.status(201).json({
        success: true,
        data: newNotification
      });
    }

    // DB user
    const notification = new Notification({
      user: userId,
      title,
      message,
      type
    });

    await notification.save();

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

module.exports = router;