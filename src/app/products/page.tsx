import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';

async function getProducts(category?: string, search?: string) {
  try {
    await connectDB();
    
    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(category, search),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {category ? (
              <span className="capitalize">{category}</span>
            ) : search ? (
              <>Results for &ldquo;{search}&rdquo;</>
            ) : (
              'All Products'
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <h2 className="font-semibold text-sm text-gray-900">Filters</h2>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Categories</h3>
                <div className="space-y-0.5">
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !category
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </a>
                  {categories.map((cat: any) => (
                    <a
                      key={cat._id}
                      href={`/products?category=${encodeURIComponent(cat._id)}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        category === cat._id
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat._id}</span>
                      <span className="text-xs text-gray-400">{cat.count}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          
          {/* Products Grid */}
          <main className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Try adjusting your filters or search term
                </p>
                <a
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Clear all filters
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
