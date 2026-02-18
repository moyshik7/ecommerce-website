'use client';

import Navbar from '@/components/Navbar';
import { useCart } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 text-sm mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice() >= 50 ? 0 : 5.99;
  const tax = totalPrice() * 0.08;
  const grandTotal = totalPrice() + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
              >
                <Link href={`/products/${item._id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <Link href={`/products/${item._id}`}>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-1 hover:text-indigo-600 transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-indigo-600 font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors text-gray-400"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors text-gray-400"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-5">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(totalPrice())}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg">
                    <Truck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <p className="text-xs text-indigo-700">
                      Add {formatPrice(50 - totalPrice())} more for free shipping
                    </p>
                  </div>
                )}
                {shipping === 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700">You qualify for free shipping!</p>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/products"
                className="mt-2 w-full py-2.5 text-gray-600 font-medium text-center hover:bg-gray-50 rounded-lg transition-colors block text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
