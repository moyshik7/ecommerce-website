import Navbar from '@/components/Navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Approved' },
  processing: { icon: Package, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Delivered' },
  cancelled: { icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Cancelled' },
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{session.user.name}</h1>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full capitalize border border-indigo-200">
              {session.user.role}
            </span>
          </div>
        </div>
        
        {/* Orders */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order History</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start shopping to see your orders here</p>
            <Link href="/products" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Browse Products &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              
              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-xl border transition-all ${
                    selectedOrderId === order._id
                      ? 'border-indigo-400 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Order</span>
                          <p className="font-mono font-medium text-gray-900 text-xs">{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Date</span>
                          <p className="font-medium text-gray-900 text-xs">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 4).map((item: any, idx: number) => (
                          <div key={idx} className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-gray-50">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.orderItems.length > 4 && (
                          <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                            +{order.orderItems.length - 4}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Total</span>
                        <p className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        {['pending', 'approved', 'shipped', 'delivered'].map((status, idx) => {
                          const statusIndex = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'].indexOf(order.status);
                          const currentIndex = ['pending', 'approved', 'shipped', 'delivered'].indexOf(status);
                          const isCompleted = statusIndex >= currentIndex && order.status !== 'cancelled';
                          
                          return (
                            <div key={status} className="flex items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isCompleted
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                              {idx < 3 && (
                                <div
                                  className={`w-10 sm:w-20 h-0.5 mx-1.5 rounded ${
                                    statusIndex > currentIndex && order.status !== 'cancelled'
                                      ? 'bg-indigo-600'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
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
  );
}
