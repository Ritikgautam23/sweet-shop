const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Sweet = require('../models/Sweet');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

const router = express.Router();

// In-memory orders for mock users
const mockOrders = {};

// In-memory notifications for mock users (shared with notifications.js)
const mockNotifications = {};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Create order from cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Order request body:', req.body);
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }

    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const { items } = req.body;
      console.log('Mock user order, items:', items);

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cart is empty'
        });
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.sweet.price * item.quantity), 0);

      const order = {
        _id: Date.now().toString(),
        user: req.user._id,
        items: items.map(item => ({
          sweet: item.sweet,
          quantity: item.quantity,
          price: item.sweet.price
        })),
        totalAmount,
        status: 'pending',
        shippingAddress,
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!mockOrders[req.user._id]) {
        mockOrders[req.user._id] = [];
      }
      mockOrders[req.user._id].push(order);

      // Create notification
      if (!mockNotifications[req.user._id]) {
        mockNotifications[req.user._id] = [];
      }
      mockNotifications[req.user._id].push({
        _id: Date.now().toString(),
        user: req.user._id,
        title: 'Order Placed',
        message: `Your order #${order._id} has been placed successfully.`,
        type: 'order',
        read: false,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Clear mock cart
      // mockCarts[req.user._id] = { items: [] };

      return res.status(201).json({
        success: true,
        data: order,
        message: 'Order placed successfully'
      });
    }

    // DB logic
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Check inventory and calculate total
    let totalAmount = 0;
    for (const item of items) {
      const sweet = await Sweet.findById(item.sweet.id);
      if (!sweet) {
        return res.status(400).json({
          success: false,
          error: `Sweet not found`
        });
      }
      if (item.quantity > sweet.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${sweet.name}`
        });
      }
      totalAmount += sweet.price * item.quantity;
    }

    // Deduct inventory
    for (const item of items) {
      await Sweet.findByIdAndUpdate(item.sweet.id, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Check for low stock alerts
    for (const item of items) {
      const updatedSweet = await Sweet.findById(item.sweet.id);
      if (updatedSweet.quantity <= updatedSweet.lowStockThreshold) {
        // Send notification to all admins
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          const notification = new Notification({
            user: admin._id,
            title: 'Low Stock Alert',
            message: `${updatedSweet.name} is running low on stock. Current quantity: ${updatedSweet.quantity}`,
            type: 'inventory'
          });
          await notification.save();
        }
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: items.map(item => ({
        sweet: item.sweet.id,
        quantity: item.quantity,
        price: item.sweet.price
      })),
      totalAmount,
      shippingAddress,
      status: 'pending'
    });

    await order.save();

    // Create notification
    const notification = new Notification({
      user: req.user._id,
      title: 'Order Placed',
      message: `Your order #${order._id} has been placed successfully.`,
      type: 'order'
    });
    await notification.save();

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });

    await order.populate('items.sweet');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place order'
    });
  }
});

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const orders = mockOrders[req.user._id] || [];
      return res.json({
        success: true,
        data: orders
      });
    }

    const orders = await Order.find({ user: req.user._id })
      .populate('items.sweet')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const orders = mockOrders[req.user._id] || [];
      const order = orders.find(o => o._id === req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      return res.json({
        success: true,
        data: order
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.sweet');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      // Find order across all mock users (admin can update any)
      let foundOrder = null;
      let userId = null;
      for (const uid in mockOrders) {
        const order = mockOrders[uid].find(o => o._id === req.params.id);
        if (order) {
          foundOrder = order;
          userId = uid;
          break;
        }
      }

      if (!foundOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      foundOrder.status = status;
      foundOrder.updatedAt = new Date().toISOString();

      // Create notification for the user
      if (!mockNotifications[userId]) {
        mockNotifications[userId] = [];
      }
      mockNotifications[userId].push({
        _id: (Date.now() + 1).toString(),
        user: userId,
        title: 'Order Status Updated',
        message: `Your order #${foundOrder._id} status has been updated to ${status}.`,
        type: 'order',
        read: false,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return res.json({
        success: true,
        data: foundOrder,
        message: 'Order status updated'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    // Create notification for the user
    const notification = new Notification({
      user: order.user,
      title: 'Order Status Updated',
      message: `Your order #${order._id} status has been updated to ${status}.`,
      type: 'order'
    });
    await notification.save();

    await order.populate('items.sweet');

    res.json({
      success: true,
      data: order,
      message: 'Order status updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

module.exports = router;