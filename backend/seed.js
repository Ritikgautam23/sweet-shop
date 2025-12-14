const mongoose = require('mongoose');
const Sweet = require('./models/Sweet');
require('dotenv').config();

const mockSweets = [
  {
    name: 'Belgian Dark Chocolate Truffles',
    description: 'Handcrafted truffles made with premium Belgian dark chocolate and a silky ganache center.',
    category: 'chocolates',
    price: 24.99,
    quantity: 50,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=300&fit=crop',
  },
  {
    name: 'Artisan Caramel Bonbons',
    description: 'Buttery caramel wrapped in milk chocolate with a touch of sea salt.',
    category: 'chocolates',
    price: 18.99,
    quantity: 35,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop',
  },
  {
    name: 'Rainbow Gummy Bears',
    description: 'Classic gummy bears in six fruity flavors made with real fruit juice.',
    category: 'candies',
    price: 8.99,
    quantity: 100,
    image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop',
  },
  {
    name: 'Sour Watermelon Slices',
    description: 'Tangy sour coating over sweet watermelon-flavored gummy slices.',
    category: 'candies',
    price: 6.99,
    quantity: 80,
    image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&h=300&fit=crop',
  },
  {
    name: 'French Butter Croissants',
    description: 'Flaky, buttery croissants made with authentic French butter.',
    category: 'pastries',
    price: 4.99,
    quantity: 20,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
  },
  {
    name: 'Chocolate Éclairs',
    description: 'Choux pastry filled with vanilla cream and topped with rich chocolate glaze.',
    category: 'pastries',
    price: 5.99,
    quantity: 15,
    image: 'https://images.unsplash.com/photo-1525059337995-32475e16ba95?w=400&h=300&fit=crop',
  },
  {
    name: 'Double Chocolate Chip Cookies',
    description: 'Soft and chewy cookies loaded with dark and white chocolate chips.',
    category: 'cookies',
    price: 12.99,
    quantity: 40,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
  },
  {
    name: 'Lavender Shortbread',
    description: 'Delicate shortbread infused with culinary lavender and a hint of lemon.',
    category: 'cookies',
    price: 14.99,
    quantity: 25,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
  },
  {
    name: 'Red Velvet Layer Cake',
    description: 'Classic red velvet cake with cream cheese frosting, serves 8-10.',
    category: 'cakes',
    price: 45.99,
    quantity: 5,
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=300&fit=crop',
  },
  {
    name: 'Salted Caramel Cheesecake',
    description: 'Creamy New York style cheesecake with salted caramel drizzle.',
    category: 'cakes',
    price: 38.99,
    quantity: 8,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop',
  },
  {
    name: 'Vanilla Bean Gelato',
    description: 'Authentic Italian gelato made with Madagascar vanilla beans.',
    category: 'ice-cream',
    price: 7.99,
    quantity: 30,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop',
  },
  {
    name: 'Pistachio Rose Ice Cream',
    description: 'Exotic blend of roasted pistachio and delicate rosewater.',
    category: 'ice-cream',
    price: 9.99,
    quantity: 0,
    image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400&h=300&fit=crop',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetshop');
    console.log('Connected to MongoDB');

    // Clear existing sweets
    await Sweet.deleteMany({});
    console.log('Cleared existing sweets');

    // Insert mock sweets
    const sweets = await Sweet.insertMany(mockSweets);
    console.log(`Seeded ${sweets.length} sweets`);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();