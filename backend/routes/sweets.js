const express = require('express');
const Sweet = require('../models/Sweet');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Mock sweets data for when DB is not available
const mockSweets = [
  {
    id: '1',
    name: 'Belgian Dark Chocolate Truffles',
    description: 'Handcrafted truffles made with premium Belgian dark chocolate and a silky ganache center.',
    category: 'chocolates',
    price: 24.99,
    quantity: 50,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Artisan Caramel Bonbons',
    description: 'Buttery caramel wrapped in milk chocolate with a touch of sea salt.',
    category: 'chocolates',
    price: 18.99,
    quantity: 35,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Get all sweets with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      categories = '',
      minPrice = 0,
      maxPrice = 1000,
      minRating = 0,
      dateFrom = '',
      dateTo = '',
      sortBy = 'name',
      inStock = 'false',
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    // Fuzzy search across name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Categories filter (multiple)
    if (categories) {
      const categoryArray = categories.split(',').filter(c => c);
      if (categoryArray.length > 0) {
        query.category = { $in: categoryArray };
      }
    }

    // Price range
    query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };

    // Date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Stock filter
    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    }

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { category: 1, name: 1 };
    }

    // Get total count for pagination
    const total = await Sweet.countDocuments(query);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sweets = await Sweet.find(query).sort(sortOption).skip(skip).limit(parseInt(limit));

    // Get reviews aggregation for fetched sweets
    const sweetIds = sweets.map(s => s._id);
    const reviewStats = await require('../models/Review').aggregate([
      { $match: { sweet: { $in: sweetIds } } },
      {
        $group: {
          _id: '$sweet',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map for quick lookup
    const statsMap = {};
    reviewStats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        averageRating: Math.round(stat.averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: stat.reviewCount
      };
    });

    // Filter by minRating after aggregation
    let filteredSweets = sweets.map(sweet => {
      const stats = statsMap[sweet._id.toString()] || { averageRating: 0, reviewCount: 0 };
      return {
        id: sweet._id,
        name: sweet.name,
        description: sweet.description,
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        lowStockThreshold: sweet.lowStockThreshold,
        image: sweet.image,
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
        createdAt: sweet.createdAt,
        updatedAt: sweet.updatedAt
      };
    });

    if (parseFloat(minRating) > 0) {
      filteredSweets = filteredSweets.filter(s => s.averageRating >= parseFloat(minRating));
    }

    res.json({
      success: true,
      data: filteredSweets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // If DB is not available, return mock data
    console.log('Database not available, returning mock data');
    let data = [...mockSweets];

    const {
      search = '',
      categories = '',
      minPrice = 0,
      maxPrice = 1000,
      minRating = 0,
      dateFrom = '',
      dateTo = '',
      sortBy = 'name',
      inStock = 'false',
      page = 1,
      limit = 12
    } = req.query;

    // Apply filters to mock data
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(s => s.name.toLowerCase().includes(searchLower) ||
                              s.description.toLowerCase().includes(searchLower));
    }

    if (categories) {
      const categoryArray = categories.split(',').filter(c => c);
      if (categoryArray.length > 0) {
        data = data.filter(s => categoryArray.includes(s.category));
      }
    }

    data = data.filter(s => s.price >= parseFloat(minPrice) && s.price <= parseFloat(maxPrice));

    if (parseFloat(minRating) > 0) {
      data = data.filter(s => (s.averageRating || 0) >= parseFloat(minRating));
    }

    if (dateFrom || dateTo) {
      data = data.filter(s => {
        const created = new Date(s.createdAt);
        if (dateFrom && created < new Date(dateFrom)) return false;
        if (dateTo && created > new Date(dateTo)) return false;
        return true;
      });
    }

    if (inStock === 'true') {
      data = data.filter(s => s.quantity > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        data.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        data.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        data.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
    }

    // Pagination
    const total = data.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    data = data.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }
});

// Get single sweet
router.get('/:id', async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        error: 'Sweet not found'
      });
    }

    // Get review stats for this sweet
    const reviewStats = await require('../models/Review').aggregate([
      { $match: { sweet: sweet._id } },
      {
        $group: {
          _id: '$sweet',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const stats = reviewStats[0] || { averageRating: 0, reviewCount: 0 };

    res.json({
      success: true,
      data: {
        id: sweet._id,
        name: sweet.name,
        description: sweet.description,
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        lowStockThreshold: sweet.lowStockThreshold,
        image: sweet.image,
        averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0,
        reviewCount: stats.reviewCount || 0,
        createdAt: sweet.createdAt,
        updatedAt: sweet.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sweet'
    });
  }
});

// Create sweet (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const sweet = new Sweet(req.body);
    await sweet.save();

    res.status(201).json({
      success: true,
      data: {
        id: sweet._id,
        name: sweet.name,
        description: sweet.description,
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        lowStockThreshold: sweet.lowStockThreshold,
        image: sweet.image,
        createdAt: sweet.createdAt,
        updatedAt: sweet.updatedAt
      },
      message: 'Sweet created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create sweet'
    });
  }
});

// Update sweet (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sweet) {
      return res.status(404).json({
        success: false,
        error: 'Sweet not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: sweet._id,
        name: sweet.name,
        description: sweet.description,
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        lowStockThreshold: sweet.lowStockThreshold,
        image: sweet.image,
        createdAt: sweet.createdAt,
        updatedAt: sweet.updatedAt
      },
      message: 'Sweet updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update sweet'
    });
  }
});

// Delete sweet (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        error: 'Sweet not found'
      });
    }

    res.json({
      success: true,
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete sweet'
    });
  }
});

module.exports = router;