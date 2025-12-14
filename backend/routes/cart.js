const express = require('express');
const Cart = require('../models/Cart');
const Sweet = require('../models/Sweet');
const { authenticateToken } = require('./auth');

const router = express.Router();

// In-memory carts for mock users
const mockCarts = {};

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if mock user
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const cart = mockCarts[req.user._id] || { items: [] };
      return res.json({
        success: true,
        data: cart
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.sweet');
    if (!cart) {
      return res.json({
        success: true,
        data: { items: [] }
      });
    }

    res.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
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
          quantity: item.quantity
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { sweetId, quantity = 1 } = req.body;

    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      if (!mockCarts[req.user._id]) {
        mockCarts[req.user._id] = { items: [] };
      }
      const cart = mockCarts[req.user._id];

      // Mock sweet validation
      const mockSweet = {
        _id: sweetId,
        name: 'Mock Sweet',
        description: 'Mock description',
        category: 'chocolates',
        price: 10.99,
        quantity: 100,
        image: 'mock.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingItemIndex = cart.items.findIndex(item => item.sweet.id === sweetId);
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ sweet: mockSweet, quantity });
      }

      return res.json({
        success: true,
        data: cart,
        message: 'Item added to cart'
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

    if (sweet.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${sweet.quantity} available in stock`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.sweet.toString() === sweetId
    );

    if (existingItemIndex >= 0) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > sweet.quantity) {
        return res.status(400).json({
          success: false,
          error: `Only ${sweet.quantity} available in stock`
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ sweet: sweetId, quantity });
    }

    await cart.save();
    await cart.populate('items.sweet');

    res.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
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
          quantity: item.quantity
        }))
      },
      message: 'Item added to cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// Update cart item quantity
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { sweetId, quantity } = req.body;

    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const cart = mockCarts[req.user._id];
      if (!cart) {
        return res.status(404).json({ success: false, error: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(item => item.sweet.id === sweetId);
      if (itemIndex === -1) {
        return res.status(404).json({ success: false, error: 'Item not in cart' });
      }

      cart.items[itemIndex].quantity = quantity;
      return res.json({ success: true, data: cart, message: 'Cart updated' });
    }

    // DB logic
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({ success: false, error: 'Sweet not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.sweet.toString() === sweetId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not in cart' });
    }

    if (quantity > sweet.quantity) {
      return res.status(400).json({ success: false, error: `Only ${sweet.quantity} available in stock` });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.sweet');

    res.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
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
          quantity: item.quantity
        }))
      },
      message: 'Cart updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    });
  }
});

// Remove item from cart
router.delete('/remove/:sweetId', authenticateToken, async (req, res) => {
  try {
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const cart = mockCarts[req.user._id];
      if (!cart) {
        return res.status(404).json({ success: false, error: 'Cart not found' });
      }

      cart.items = cart.items.filter(item => item.sweet.id !== req.params.sweetId);
      return res.json({ success: true, data: cart, message: 'Item removed from cart' });
    }

    // DB logic
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.sweet.toString() !== req.params.sweetId);
    await cart.save();
    await cart.populate('items.sweet');

    res.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
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
          quantity: item.quantity
        }))
      },
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      mockCarts[req.user._id] = { items: [] };
      return res.json({ success: true, data: { items: [] }, message: 'Cart cleared' });
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { upsert: true }
    );

    res.json({
      success: true,
      data: { items: [] },
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

module.exports = router;