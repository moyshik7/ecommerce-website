import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/lib/mongodb';
import User from '../src/models/User';
import Product from '../src/models/Product';

const sampleProducts = [
  // ── Electronics ─────────────────────────
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, crystal clear highs, and comfortable over-ear design perfect for long listening sessions.',
    price: 79.99,
    originalPrice: 129.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 50,
    featured: true,
    rating: 4.5,
    numReviews: 128,
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, sleep tracking, and 7-day battery life. Water-resistant up to 50 meters.',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 35,
    featured: true,
    rating: 4.7,
    numReviews: 256,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with Cherry MX switches. Programmable keys, anti-ghosting, and aircraft-grade aluminum frame.',
    price: 89.99,
    originalPrice: 119.99,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 40,
    featured: true,
    rating: 4.6,
    numReviews: 178,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable speaker with 360° sound, 20-hour playtime, and built-in microphone. Perfect for outdoor adventures.',
    price: 59.99,
    originalPrice: 79.99,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1543515213-44e513a5e846?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 75,
    featured: false,
    rating: 4.2,
    numReviews: 167,
  },
  {
    name: 'Wireless Mouse Ergonomic',
    description: 'Ergonomic wireless mouse with adjustable DPI, silent clicks, and long battery life. Designed for comfort during extended use.',
    price: 39.99,
    originalPrice: 49.99,
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-acda5b2b1588?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 80,
    featured: false,
    rating: 4.1,
    numReviews: 98,
  },
  {
    name: 'USB-C Fast Charger',
    description: '65W GaN fast charger with dual USB-C ports and compact foldable design. Compatible with laptops, phones, and tablets.',
    price: 34.99,
    originalPrice: 44.99,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 120,
    featured: false,
    rating: 4.4,
    numReviews: 203,
  },
  {
    name: 'Noise-Cancelling Earbuds',
    description: 'True wireless earbuds with active noise cancellation, transparency mode, and premium sound quality. IPX5 water-resistant.',
    price: 129.99,
    originalPrice: 179.99,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop',
    ],
    category: 'electronics',
    stock: 45,
    featured: true,
    rating: 4.6,
    numReviews: 312,
  },

  // ── Fashion ─────────────────────────────
  {
    name: 'Minimalist Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment. Perfect for work, travel, or everyday use. Features multiple pockets and adjustable straps.',
    price: 149.99,
    originalPrice: 199.99,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 25,
    featured: true,
    rating: 4.8,
    numReviews: 89,
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft 100% organic cotton t-shirt. Breathable, durable, and perfect for everyday wear. Available in multiple colors.',
    price: 29.99,
    originalPrice: 39.99,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 100,
    featured: false,
    rating: 4.3,
    numReviews: 342,
  },
  {
    name: 'Running Shoes Elite',
    description: 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper. Designed for speed and comfort.',
    price: 119.99,
    originalPrice: 159.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 60,
    featured: true,
    rating: 4.4,
    numReviews: 215,
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with modern fit. Made from premium denim with comfortable stretch. A wardrobe essential for any season.',
    price: 69.99,
    originalPrice: 89.99,
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 45,
    featured: false,
    rating: 4.5,
    numReviews: 134,
  },
  {
    name: 'Sunglasses Aviator Classic',
    description: 'Classic aviator sunglasses with UV protection. Lightweight metal frame with adjustable nose pads for all-day comfort.',
    price: 49.99,
    originalPrice: 69.99,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 55,
    featured: true,
    rating: 4.6,
    numReviews: 187,
  },
  {
    name: 'Canvas Sneakers',
    description: 'Classic canvas sneakers with vulcanized rubber sole. Lightweight, comfortable, and effortlessly stylish. Unisex design.',
    price: 44.99,
    originalPrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 90,
    featured: false,
    rating: 4.3,
    numReviews: 267,
  },
  {
    name: 'Wool Blend Scarf',
    description: 'Luxuriously soft merino wool blend scarf. Oversized design with elegant fringe detail. Perfect for layering in cooler months.',
    price: 38.99,
    originalPrice: 54.99,
    images: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1601244005535-a48d21d951ac?w=500&h=500&fit=crop',
    ],
    category: 'fashion',
    stock: 65,
    featured: false,
    rating: 4.4,
    numReviews: 95,
  },

  // ── Home & Living ───────────────────────
  {
    name: 'Coffee Maker Deluxe',
    description: 'Programmable coffee maker with thermal carafe. Brew strength control, auto-shutoff, and keeps coffee hot for hours.',
    price: 79.99,
    originalPrice: 99.99,
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=500&h=500&fit=crop',
    ],
    category: 'home',
    stock: 30,
    featured: true,
    rating: 4.7,
    numReviews: 223,
  },
  {
    name: 'Ceramic Plant Pot Set',
    description: 'Set of 3 minimalist ceramic plant pots in matte finish. Drainage holes included. Perfect for succulents, herbs, and small plants.',
    price: 24.99,
    originalPrice: 34.99,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500&h=500&fit=crop',
    ],
    category: 'home',
    stock: 85,
    featured: false,
    rating: 4.5,
    numReviews: 142,
  },
  {
    name: 'Scented Candle Collection',
    description: 'Hand-poured soy wax candles in 3 signature scents: lavender, vanilla, and sandalwood. Each burns for 40+ hours.',
    price: 32.99,
    originalPrice: 42.99,
    images: [
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&h=500&fit=crop',
    ],
    category: 'home',
    stock: 95,
    featured: false,
    rating: 4.6,
    numReviews: 178,
  },
  {
    name: 'Throw Blanket Knitted',
    description: 'Chunky knit throw blanket made from ultra-soft acrylic yarn. Cozy and decorative addition to any sofa or bed.',
    price: 54.99,
    originalPrice: 74.99,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=500&h=500&fit=crop',
    ],
    category: 'home',
    stock: 40,
    featured: true,
    rating: 4.7,
    numReviews: 198,
  },
  {
    name: 'Wall Clock Minimalist',
    description: '12-inch silent wall clock with Scandinavian design. Quartz movement and frameless design for a clean modern look.',
    price: 27.99,
    originalPrice: 39.99,
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=500&h=500&fit=crop',
    ],
    category: 'home',
    stock: 55,
    featured: false,
    rating: 4.3,
    numReviews: 87,
  },
  {
    name: 'Desk Lamp LED',
    description: 'Adjustable LED desk lamp with 5 brightness levels and 3 color temperatures. USB charging port and touch controls.',
    price: 42.99,
    originalPrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=500&h=500&fit=crop',
    ],
    category: 'home',
    stock: 60,
    featured: false,
    rating: 4.5,
    numReviews: 156,
  },

  // ── Sports & Outdoors ──────────────────
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick eco-friendly yoga mat with non-slip surface. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
    price: 34.99,
    originalPrice: 44.99,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&h=500&fit=crop',
    ],
    category: 'sports',
    stock: 70,
    featured: false,
    rating: 4.4,
    numReviews: 156,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated water bottle. Keeps drinks cold 24h or hot 12h. BPA-free, leak-proof, and eco-friendly.',
    price: 24.99,
    originalPrice: 34.99,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&h=500&fit=crop',
    ],
    category: 'sports',
    stock: 110,
    featured: false,
    rating: 4.5,
    numReviews: 289,
  },
  {
    name: 'Resistance Bands Set',
    description: 'Set of 5 latex resistance bands with varying resistance levels. Includes door anchor, handles, and carry bag for home or gym use.',
    price: 19.99,
    originalPrice: 29.99,
    images: [
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop',
    ],
    category: 'sports',
    stock: 95,
    featured: false,
    rating: 4.3,
    numReviews: 176,
  },
  {
    name: 'Hiking Daypack 30L',
    description: 'Lightweight 30L hiking backpack with hydration-compatible design. Multiple compartments, rain cover, and ventilated back panel.',
    price: 64.99,
    originalPrice: 89.99,
    images: [
      'https://images.unsplash.com/photo-1622260614927-208ad5d0b9fb?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    ],
    category: 'sports',
    stock: 35,
    featured: true,
    rating: 4.6,
    numReviews: 134,
  },
  {
    name: 'Jump Rope Speed Pro',
    description: 'Adjustable speed jump rope with ball bearings for smooth rotation. Lightweight aluminum handles and tangle-free cable.',
    price: 14.99,
    originalPrice: 19.99,
    images: [
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop',
    ],
    category: 'sports',
    stock: 150,
    featured: false,
    rating: 4.2,
    numReviews: 98,
  },
];

async function createAdminUser() {
  const adminExists = await User.findOne({ email: 'admin@shophub.com' });
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Admin User',
      email: 'admin@shophub.com',
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date(),
    });
    console.log('✓ Admin user created: admin@shophub.com / admin123');
  } else {
    console.log('✓ Admin user already exists');
  }
}

async function seedProducts() {
  const existingProducts = await Product.countDocuments();
  
  if (existingProducts > 0) {
    console.log('✓ Products already exist in database');
    return;
  }
  
  await Product.insertMany(sampleProducts);
  console.log(`✓ Seeded ${sampleProducts.length} products`);
}

async function main() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    await connectDB();
    console.log('✓ Connected to MongoDB\n');
    
    await createAdminUser();
    await seedProducts();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@shophub.com / admin123');
    console.log('\n🚀 Start the server with: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
