import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import AdminNav from '@/components/AdminNav';
import { formatPrice } from '@/lib/utils';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

async function getDashboardStats() {
  try {
    await connectDB();
    
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').lean(),
    ]);
    
    return {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    };
  } catch {
    return {
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      recentOrders: [],
    };
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login?callbackUrl=/admin');
  }

  const stats = await getDashboardStats();

  const statCards = [
    {
      title: 'Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</span>
                  <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Pending Orders</h2>
            </div>
            <p className="text-3xl font-bold text-amber-600 mb-1">{stats.pendingOrders}</p>
            <p className="text-xs text-gray-500 mb-3">Awaiting approval</p>
            {stats.pendingOrders > 0 && (
              <a
                href="/admin/orders"
                className="inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View Orders &rarr;
              </a>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a href="/admin/orders" className="p-3 bg-gray-900 text-white rounded-lg text-xs font-medium text-center hover:bg-gray-800 transition-colors">
                Manage Orders
              </a>
              <a href="/admin/products" className="p-3 bg-indigo-600 text-white rounded-lg text-xs font-medium text-center hover:bg-indigo-700 transition-colors">
                Products
              </a>
              <a href="/admin/users" className="p-3 bg-violet-600 text-white rounded-lg text-xs font-medium text-center hover:bg-violet-700 transition-colors">
                Users
              </a>
              <a href="/admin/invoices" className="p-3 bg-emerald-600 text-white rounded-lg text-xs font-medium text-center hover:bg-emerald-700 transition-colors">
                Invoices
              </a>
            </div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View All &rarr;
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-xs font-mono text-gray-900">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{order.user?.name || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-xs font-medium text-gray-900">{formatPrice(order.totalPrice)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize
                        ${order.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                        ${order.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                        ${order.status === 'processing' ? 'bg-violet-50 text-violet-700 border border-violet-200' : ''}
                        ${order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : ''}
                        ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
