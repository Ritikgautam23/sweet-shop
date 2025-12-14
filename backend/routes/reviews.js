const express = require('express');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all reviews for a sweet
router.get('/sweet/:sweetId', async (req, res) => {
  try {
    const reviews = await Review.find({ sweet: req.params.sweetId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews.map(review => ({
        id: review._id,
        user: {
          id: review.user._id,
          name: review.user.name
        },
        sweet: review.sweet,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

// Get user's review for a sweet
router.get('/user/:sweetId', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user._id,
      sweet: req.params.sweetId
    });

    if (!review) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        id: review._id,
        user: review.user,
        sweet: review.sweet,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user review'
    });
  }
});

// Create a review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { sweetId, rating, comment } = req.body;

    // Check if user already reviewed this sweet
    const existingReview = await Review.findOne({
      user: req.user._id,
      sweet: sweetId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this sweet'
      });
    }

    const review = new Review({
      user: req.user._id,
      sweet: sweetId,
      rating,
      comment
    });

    await review.save();

    // Create notification
    const notification = new Notification({
      user: req.user._id,
      title: 'Review Submitted',
      message: 'Thank you for your review! Your feedback helps us improve.',
      type: 'review'
    });
    await notification.save();

    const populatedReview = await Review.findById(review._id).populate('user', 'name');

    res.status(201).json({
      success: true,
      data: {
        id: populatedReview._id,
        user: {
          id: populatedReview.user._id,
          name: populatedReview.user.name
        },
        sweet: populatedReview.sweet,
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        createdAt: populatedReview.createdAt,
        updatedAt: populatedReview.updatedAt
      },
      message: 'Review created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
});

// Update a review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating, comment },
      { new: true, runValidators: true }
    ).populate('user', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or not authorized'
      });
    }

    res.json({
      success: true,
      data: {
        id: review._id,
        user: {
          id: review.user._id,
          name: review.user.name
        },
        sweet: review.sweet,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      },
      message: 'Review updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
});

// Delete a review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

module.exports = router;