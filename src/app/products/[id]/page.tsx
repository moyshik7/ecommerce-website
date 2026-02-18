'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Star, Truck, Shield, Heart, Minus, Plus, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const addItem = useCart((state) => state.addItem);
  
  // In a real app, you would fetch the product data here
  // For now, we'll use a placeholder
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
          
          // Fetch related products
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products" className="text-purple-600 hover:text-purple-700">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <img
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-purple-500 ring-2 ring-purple-200'
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
          <div className="space-y-6">
            <div>
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium capitalize"
              >
                {product.category}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({product.numReviews} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-full">
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>
            
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-4 py-4 border-y border-gray-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">2 year warranty included</span>
            </div>
            
            {/* Stock Status */}
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-500 font-medium">Out of Stock</p>
            )}
            
            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 pt-4">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
              
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isLiked
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-200 hover:border-red-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
