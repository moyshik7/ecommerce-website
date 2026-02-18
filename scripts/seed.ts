import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/lib/mongodb';
import User from '../src/models/User';
import Product from '../src/models/Product';

const sampleProducts = [
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
