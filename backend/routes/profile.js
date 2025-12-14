const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Mock user profiles (for when DB is not available)
const mockUserProfiles = {
  '1': {
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1-555-0123',
    address: {
      street: '123 Admin St',
      city: 'Admin City',
      state: 'AC',
      zip: '12345'
    },
    dateOfBirth: '1990-01-01',
    profilePicture: null
  },
  '2': {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0456',
    address: {
      street: '456 User Ave',
      city: 'User Town',
      state: 'UT',
      zip: '67890'
    },
    dateOfBirth: '1985-05-15',
    profilePicture: null
  }
};

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const mockProfile = mockUserProfiles[req.user._id] || mockUserProfiles['2'];
      return res.json({
        success: true,
        data: {
          profile: {
            firstName: mockProfile.firstName,
            lastName: mockProfile.lastName,
            phone: mockProfile.phone,
            address: mockProfile.address,
            dateOfBirth: mockProfile.dateOfBirth,
            profilePicture: mockProfile.profilePicture
          }
        }
      });
    }

    // For DB users
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.log('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, dateOfBirth, profilePicture } = req.body;

    // For mock users
    if (req.user._id.startsWith('1') || req.user._id.startsWith('2') || req.user._id > 1000000000000) {
      const mockProfile = mockUserProfiles[req.user._id] || mockUserProfiles['2'];
      mockUserProfiles[req.user._id] = {
        ...mockProfile,
        firstName: firstName || mockProfile.firstName,
        lastName: lastName || mockProfile.lastName,
        phone: phone || mockProfile.phone,
        address: address || mockProfile.address,
        dateOfBirth: dateOfBirth || mockProfile.dateOfBirth,
        profilePicture: profilePicture !== undefined ? profilePicture : mockProfile.profilePicture
      };

      return res.json({
        success: true,
        data: {
          profile: mockUserProfiles[req.user._id]
        },
        message: 'Profile updated successfully'
      });
    }

    // For DB users
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          profilePicture: user.profilePicture
        }
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.log('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid data provided'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;