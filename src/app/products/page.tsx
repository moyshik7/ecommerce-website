import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { Filter, SlidersHorizontal } from 'lucide-react';

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
    const categories = await Product.distinct('category');
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
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
                <div className="space-y-2">
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                      !category
                        ? 'bg-purple-100 text-purple-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </a>
                  {categories.map((cat: string) => (
                    <a
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      className={`block px-3 py-2 rounded-xl text-sm capitalize transition-colors ${
                        category === cat
                          ? 'bg-purple-100 text-purple-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          
          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {category ? (
                    <span className="capitalize">{category}</span>
                  ) : search ? (
                    `Search: "${search}"`
                  ) : (
                    'All Products'
                  )}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or search term
                </p>
                <a
                  href="/products"
                  className="text-purple-600 hover:text-purple-700 font-medium"
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
