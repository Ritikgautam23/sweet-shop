const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sweet',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one entry per user-sweet pair
wishlistSchema.index({ user: 1, sweet: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);