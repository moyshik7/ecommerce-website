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
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your store performance</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.color.replace('from-', 'text-').split(' ')[0]}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders Alert */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pending Orders</h2>
            </div>
            <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.pendingOrders}</p>
            <p className="text-gray-500">Orders awaiting approval</p>
            {stats.pendingOrders > 0 && (
              <a
                href="/admin/orders"
                className="mt-4 inline-block px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-xl hover:bg-yellow-200 transition-colors"
              >
                View Pending Orders →
              </a>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/orders"
                className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-center hover:shadow-lg transition-all"
              >
                Manage Orders
              </a>
              <a
                href="/admin/products"
                className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium text-center hover:shadow-lg transition-all"
              >
                Products
              </a>
              <a
                href="/admin/users"
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium text-center hover:shadow-lg transition-all"
              >
                Users
              </a>
              <a
                href="/admin/invoices"
                className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium text-center hover:shadow-lg transition-all"
              >
                Invoices
              </a>
            </div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              View All →
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-gray-900">{order._id.slice(-8)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatPrice(order.totalPrice)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'approved' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'processing' ? 'bg-purple-100 text-purple-700' : ''}
                        ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : ''}
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
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
