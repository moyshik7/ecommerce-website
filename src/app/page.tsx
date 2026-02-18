import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { ArrowRight, Truck, Shield, RotateCcw, Star, Headphones, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

async function getFeaturedProducts() {
  try {
    await connectDB();
    const products = await Product.find({ featured: true }).limit(8).lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

async function getNewArrivals() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    await connectDB();
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return categories;
  } catch {
    return [];
  }
}

const categoryImages: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
  home: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop',
  sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop',
};

export default async function HomePage() {
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Discover Products
              <span className="block text-indigo-400 mt-1">You&apos;ll Love</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
              Curated collections of premium products at unbeatable prices. Quality you can trust, delivered to your door.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-medium rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/10"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated help' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-5 px-4 md:px-6">
                <item.icon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Shop by Category
                </h2>
                <p className="mt-2 text-gray-500">Find what you&apos;re looking for</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${encodeURIComponent(cat._id)}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden"
                >
                  <img
                    src={categoryImages[cat._id] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'}
                    alt={cat._id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold capitalize text-sm">{cat._id}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{cat.count} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                Trending Now
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 mb-3">No featured products yet</p>
              <Link href="/products" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                Browse all products →
              </Link>
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden bg-indigo-600 p-8 md:p-10 flex flex-col justify-end min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=500&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="relative">
                <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Limited Time</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Up to 40% Off</h3>
                <p className="text-indigo-100 text-sm mb-5 max-w-xs">
                  Don&apos;t miss out on our biggest seasonal sale. Hundreds of items at unbeatable prices.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Shop Sale
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-gray-900 p-8 md:p-10 flex flex-col justify-end min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">New Arrivals</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Fresh Drops Weekly</h3>
                <p className="text-gray-300 text-sm mb-5 max-w-xs">
                  Be the first to get your hands on our latest products and exclusive releases.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Explore New
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Just In
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter / CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Stay in the Loop
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Sign up for exclusive deals, early access to new products, and member-only discounts.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-lg font-bold">ShopHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Your destination for quality products at amazing prices. We curate the best for you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Shop</h4>
              <ul className="space-y-2.5">
                <li><Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products?category=electronics" className="text-sm text-gray-400 hover:text-white transition-colors">Electronics</Link></li>
                <li><Link href="/products?category=fashion" className="text-sm text-gray-400 hover:text-white transition-colors">Fashion</Link></li>
                <li><Link href="/products?category=home" className="text-sm text-gray-400 hover:text-white transition-colors">Home &amp; Living</Link></li>
                <li><Link href="/products?category=sports" className="text-sm text-gray-400 hover:text-white transition-colors">Sports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors">My Profile</Link></li>
                <li><Link href="/cart" className="text-sm text-gray-400 hover:text-white transition-colors">Shopping Cart</Link></li>
                <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Support</h4>
              <ul className="space-y-2.5">
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 ShopHub. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
