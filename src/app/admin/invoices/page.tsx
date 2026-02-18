import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import AdminNav from '@/components/AdminNav';
import { formatPrice, formatDate } from '@/lib/utils';
import { FileText, Search } from 'lucide-react';
import PrintButton from '@/components/PrintButton';

async function getInvoices(search?: string) {
  try {
    await connectDB();
    
    const query: any = {};
    if (search) {
      query.invoiceId = { $regex: search, $options: 'i' };
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

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login?callbackUrl=/admin');
  }

  const { search } = await searchParams;
  const invoices = await getInvoices(search);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">View and download all order invoices</p>
        </div>
        
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <form action="/admin/invoices" method="GET" className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search by invoice ID..."
                defaultValue={search}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              Search
            </button>
            {search && (
              <a
                href="/admin/invoices"
                className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Clear
              </a>
            )}
          </form>
        </div>
        
        {/* Invoices List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Invoice ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice: any) => (
                    <tr key={invoice._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-medium text-gray-900">{invoice.invoiceId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-500">{invoice._id.slice(-10)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{invoice.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">{formatPrice(invoice.totalPrice)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                          ${invoice.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        `}>
                          {invoice.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <PrintButton />
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
