const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetshop')
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Server starting without database connection. Some features may not work.');
});

// Routes
const authRoutes = require('./routes/auth');
const sweetRoutes = require('./routes/sweets');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
console.log('Loading notifications route');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes.router);
app.use('/api/sweets', sweetRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
console.log('Notifications route loaded');

app.get('/', (req, res) => {
  res.json({ message: 'Sweet Shop API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});