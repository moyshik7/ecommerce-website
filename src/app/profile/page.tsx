import Navbar from '@/components/Navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', label: 'Approved' },
  processing: { icon: Package, color: 'text-purple-600 bg-purple-100', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-600 bg-indigo-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Delivered' },
  cancelled: { icon: AlertCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
};

async function getUserOrders(userId: string) {
  try {
    await connectDB();
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('orderItems.product')
      .lean();
    return JSON.parse(JSON.stringify(orders));
  } catch {
    return [];
  }
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/profile');
  }

  const { order: selectedOrderId } = await searchParams;
  const orders = await getUserOrders(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your orders and account settings</p>
        </div>
        
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
              <p className="text-gray-500">{session.user.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full capitalize">
                {session.user.role}
              </span>
            </div>
          </div>
        </div>
        
        {/* Orders Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
              <Link
                href="/products"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const StatusIcon = statusConfig[order.status]?.icon || Clock;
                const statusColor = statusConfig[order.status]?.color || 'text-gray-600 bg-gray-100';
                const statusLabel = statusConfig[order.status]?.label || order.status;
                
                return (
                  <div
                    key={order._id}
                    className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
                      selectedOrderId === order._id
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-mono text-sm font-medium text-gray-900">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Invoice</p>
                          <p className="font-mono text-sm font-medium text-gray-900">{order.invoiceId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusColor}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium text-sm">{statusLabel}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex -space-x-2">
                            {order.orderItems.slice(0, 4).map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-gray-100"
                              >
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {order.orderItems.length > 4 && (
                              <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                +{order.orderItems.length - 4}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Progress */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          {['pending', 'approved', 'shipped', 'delivered'].map((status, idx) => {
                            const statusIndex = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'].indexOf(order.status);
                            const currentIndex = ['pending', 'approved', 'shipped', 'delivered'].indexOf(status);
                            const isCompleted = statusIndex >= currentIndex && order.status !== 'cancelled';
                            const isCurrent = order.status === status;
                            
                            return (
                              <div key={status} className="flex items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isCompleted
                                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                                      : isCurrent
                                      ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-500'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {isCompleted ? '✓' : idx + 1}
                                </div>
                                {idx < 3 && (
                                  <div
                                    className={`w-12 sm:w-24 h-1 mx-2 rounded ${
                                      statusIndex > currentIndex && order.status !== 'cancelled'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Pending</span>
                          <span>Approved</span>
                          <span>Shipped</span>
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
