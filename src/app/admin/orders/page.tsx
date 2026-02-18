import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import AdminNav from '@/components/AdminNav';
import { formatPrice, formatDate } from '@/lib/utils';
import { Search, Filter, Eye } from 'lucide-react';

async function getOrders(status?: string, search?: string) {
  try {
    await connectDB();
    
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      const user = await User.findOne({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      });
      if (user) {
        query.user = user._id;
      }
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();
    
    return JSON.parse(JSON.stringify(orders));
  } catch {
    return [];
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login?callbackUrl=/admin');
  }

  const { status, search } = await searchParams;
  const orders = await getOrders(status, search);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending').length,
    approved: orders.filter((o: any) => o.status === 'approved').length,
    processing: orders.filter((o: any) => o.status === 'processing').length,
    shipped: orders.filter((o: any) => o.status === 'shipped').length,
    delivered: orders.filter((o: any) => o.status === 'delivered').length,
    cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">View and manage all customer orders</p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All', color: 'gray' },
            { key: 'pending', label: 'Pending', color: 'yellow' },
            { key: 'approved', label: 'Approved', color: 'blue' },
            { key: 'processing', label: 'Processing', color: 'purple' },
            { key: 'shipped', label: 'Shipped', color: 'indigo' },
            { key: 'delivered', label: 'Delivered', color: 'green' },
            { key: 'cancelled', label: 'Cancelled', color: 'red' },
          ].map((tab) => {
            const isActive = status === tab.key || (!status && tab.key === 'all');
            const colorMap: Record<string, string> = {
              gray: 'from-gray-500 to-gray-600',
              yellow: 'from-yellow-500 to-orange-500',
              blue: 'from-blue-500 to-cyan-500',
              purple: 'from-purple-500 to-pink-500',
              indigo: 'from-indigo-500 to-blue-500',
              green: 'from-green-500 to-emerald-500',
              red: 'from-red-500 to-pink-500',
            };
            return (
              <a
                key={tab.key}
                href={`/admin/orders${tab.key === 'all' ? '' : `?status=${tab.key}`}${search ? `&search=${search}` : ''}`}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${colorMap[tab.color]} text-white shadow-md`
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label} ({tab.key === 'all' ? statusCounts.all : statusCounts[tab.key as keyof typeof statusCounts]})
              </a>
            );
          })}
        </div>
        
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <form action="/admin/orders" method="GET" className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search by customer name or email..."
                defaultValue={search}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
            {(search || status) && (
              <a
                href="/admin/orders"
                className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Clear
              </a>
            )}
          </form>
        </div>
        
        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-900">{order._id.slice(-10)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">{order.orderItems.length} items</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                      </td>
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <a
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
