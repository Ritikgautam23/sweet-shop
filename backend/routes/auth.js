const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Mock users for when DB is not available
const mockUsers = [
  {
    _id: '1',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sweetshop.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password' hashed
    phone: '+1-555-0123',
    address: {
      street: '123 Admin St',
      city: 'Admin City',
      state: 'AC',
      zip: '12345'
    },
    dateOfBirth: '1990-01-01',
    profilePicture: null,
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@sweetshop.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password' hashed
    phone: '+1-555-0456',
    address: {
      street: '456 User Ave',
      city: 'User Town',
      state: 'UT',
      zip: '67890'
    },
    dateOfBirth: '1985-05-15',
    profilePicture: null,
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if existing in mock
    const existingMock = mockUsers.find(u => u.email === email);
    if (existingMock) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const newUser = {
      _id: Date.now().toString(),
      name,
      firstName: '',
      lastName: '',
      email,
      password: await bcrypt.hash(password, 10),
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      dateOfBirth: null,
      profilePicture: null,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          dateOfBirth: newUser.dateOfBirth,
          profilePicture: newUser.profilePicture,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        token
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.log('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try DB first
    try {
      const user = await User.findOne({ email });
      if (user && await user.comparePassword(password)) {
        const token = generateToken(user._id);

        return res.json({
          success: true,
          data: {
            user: {
              id: user._id,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              address: user.address,
              dateOfBirth: user.dateOfBirth,
              profilePicture: user.profilePicture,
              role: user.role,
              createdAt: user.createdAt
            },
            token
          },
          message: 'Login successful'
        });
      }
    } catch (dbError) {
      // Fallback to mock
      console.log('DB not available, using mock login');
    }

    // Check mock users
    const mockUser = mockUsers.find(u => u.email === email);
    if (mockUser && await bcrypt.compare(password, mockUser.password)) {
      const token = generateToken(mockUser._id);

      return res.json({
        success: true,
        data: {
          user: {
            id: mockUser._id,
            name: mockUser.name,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            email: mockUser.email,
            phone: mockUser.phone,
            address: mockUser.address,
            dateOfBirth: mockUser.dateOfBirth,
            profilePicture: mockUser.profilePicture,
            role: mockUser.role,
            createdAt: mockUser.createdAt
          },
          token
        },
        message: 'Login successful'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // For mock users, just set mock data
    if (decoded.userId.startsWith('1') || decoded.userId.startsWith('2') || decoded.userId > 1000000000000) {
      const mockUser = mockUsers.find(u => u._id === decoded.userId) || mockUsers[1];
      req.user = {
        _id: mockUser._id,
        name: mockUser.name,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        dateOfBirth: mockUser.dateOfBirth,
        profilePicture: mockUser.profilePicture,
        role: mockUser.role,
        createdAt: mockUser.createdAt
      };
      return next();
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  });
};

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        dateOfBirth: req.user.dateOfBirth,
        profilePicture: req.user.profilePicture,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    }
  });
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = { router, authenticateToken };