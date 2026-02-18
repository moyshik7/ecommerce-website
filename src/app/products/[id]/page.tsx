'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Star, Truck, Shield, Heart, Minus, Plus, ChevronLeft, Check, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCart((state) => state.addItem);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useState(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
          const relatedRes = await fetch(`/api/products?category=${data.category}&limit=4`);
          if (relatedRes.ok) {
            const related = await relatedRes.json();
            setRelatedProducts(related.filter((p: any) => p._id !== data._id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  });

  const handleAddToCart = () => {
    if (product) {
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
        quantity,
        stock: product.stock,
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 rounded-xl shimmer" />
            <div className="space-y-4 py-4">
              <div className="h-4 bg-gray-100 rounded w-24 shimmer" />
              <div className="h-8 bg-gray-100 rounded w-3/4 shimmer" />
              <div className="h-4 bg-gray-100 rounded w-1/2 shimmer" />
              <div className="h-10 bg-gray-100 rounded w-32 shimmer mt-6" />
              <div className="h-20 bg-gray-100 rounded shimmer mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Product not found</h1>
          <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/products" className="text-gray-400 hover:text-gray-600 transition-colors">Shop</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/products?category=${product.category}`} className="text-gray-400 hover:text-gray-600 transition-colors capitalize">{product.category}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              <img
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-indigo-600 ring-1 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="lg:py-2">
            <Link
              href={`/products?category=${product.category}`}
              className="text-xs font-semibold text-indigo-600 uppercase tracking-wider"
            >
              {product.category}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 tracking-tight">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mt-5">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-md">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mt-5 text-sm">{product.description}</p>
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-6" />
            
            {/* Stock Status */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 mb-6">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">In Stock</span>
                <span className="text-sm text-gray-400">({product.stock} available)</span>
              </div>
            ) : (
              <p className="text-sm text-red-600 font-medium mb-6">Out of Stock</p>
            )}
            
            {/* Quantity & Add to Cart */}
            <div className="flex gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-gray-50 transition-colors text-gray-500"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2.5 hover:bg-gray-50 transition-colors text-gray-500"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-6 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isLiked
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>30-day easy return policy</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>2-year warranty included</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
