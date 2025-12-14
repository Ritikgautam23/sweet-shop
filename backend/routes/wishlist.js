const express = require('express');
const Wishlist = require('../models/Wishlist');
const Sweet = require('../models/Sweet');
const { authenticateToken } = require('./auth');

const router = express.Router();

// In-memory wishlists for mock users
const mockWishlists = {};

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if mock user
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const wishlist = mockWishlists[req.user._id] || [];
      return res.json({
        success: true,
        data: wishlist
      });
    }

    const wishlist = await Wishlist.find({ user: req.user._id }).populate('sweet');
    const wishlistItems = wishlist.map(item => ({
      id: item._id,
      sweet: {
        id: item.sweet._id,
        name: item.sweet.name,
        description: item.sweet.description,
        category: item.sweet.category,
        price: item.sweet.price,
        quantity: item.sweet.quantity,
        image: item.sweet.image,
        createdAt: item.sweet.createdAt,
        updatedAt: item.sweet.updatedAt
      },
      addedAt: item.createdAt
    }));

    res.json({
      success: true,
      data: wishlistItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist'
    });
  }
});

// Add sweet to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { sweetId } = req.body;

    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      if (!mockWishlists[req.user._id]) {
        mockWishlists[req.user._id] = [];
      }
      const wishlist = mockWishlists[req.user._id];

      // Check if already in wishlist
      const existingIndex = wishlist.findIndex(item => item.sweet.id === sweetId);
      if (existingIndex >= 0) {
        return res.json({
          success: true,
          data: wishlist,
          message: 'Sweet already in wishlist'
        });
      }

      // Mock sweet validation
      const mockSweet = {
        id: sweetId,
        name: 'Mock Sweet',
        description: 'Mock description',
        category: 'chocolates',
        price: 10.99,
        quantity: 100,
        image: 'mock.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      wishlist.push({ sweet: mockSweet, addedAt: new Date().toISOString() });

      return res.json({
        success: true,
        data: wishlist,
        message: 'Sweet added to wishlist'
      });
    }

    // DB logic
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        error: 'Sweet not found'
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ user: req.user._id, sweet: sweetId });
    if (existingItem) {
      return res.json({
        success: true,
        message: 'Sweet already in wishlist'
      });
    }

    const wishlistItem = new Wishlist({ user: req.user._id, sweet: sweetId });
    await wishlistItem.save();

    res.json({
      success: true,
      message: 'Sweet added to wishlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add sweet to wishlist'
    });
  }
});

// Remove sweet from wishlist
router.delete('/remove/:sweetId', authenticateToken, async (req, res) => {
  try {
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const wishlist = mockWishlists[req.user._id];
      if (!wishlist) {
        return res.status(404).json({ success: false, error: 'Wishlist not found' });
      }

      mockWishlists[req.user._id] = wishlist.filter(item => item.sweet.id !== req.params.sweetId);
      return res.json({ success: true, message: 'Sweet removed from wishlist' });
    }

    // DB logic
    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      sweet: req.params.sweetId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Sweet not found in wishlist'
      });
    }

    res.json({
      success: true,
      message: 'Sweet removed from wishlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove sweet from wishlist'
    });
  }
});

// Check if sweet is in wishlist
router.get('/check/:sweetId', authenticateToken, async (req, res) => {
  try {
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const wishlist = mockWishlists[req.user._id] || [];
      const isInWishlist = wishlist.some(item => item.sweet.id === req.params.sweetId);
      return res.json({
        success: true,
        data: { isInWishlist }
      });
    }

    const item = await Wishlist.findOne({
      user: req.user._id,
      sweet: req.params.sweetId
    });

    res.json({
      success: true,
      data: { isInWishlist: !!item }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check wishlist status'
    });
  }
});

module.exports = router;