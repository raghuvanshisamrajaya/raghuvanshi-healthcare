'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Search, Eye, Trash2, Filter, Download, Calendar, User, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface OrderItem {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  total?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate?: Date;
  deliveryDate?: Date;
  notes?: string;
  createdAt?: Date;
}

export default function AdminOrdersPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = new Date();
      const orderDate = order.orderDate;
      
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      fetchOrders();
    }
  }, [user, userData, loading, router]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(ordersQuery);
      
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw order data:', data); // Debug log
        
        return {
          id: doc.id,
          orderNumber: data.orderNumber || data.orderID || `ORD-${doc.id.slice(-6)}`,
          customerName: data.customerName || 
                       data.customerInfo?.name || 
                       data.name || 
                       data.shippingAddress?.fullName ||
                       'Unknown Customer',
          customerEmail: data.customerEmail || 
                        data.customerInfo?.email || 
                        data.email || 
                        data.userEmail ||
                        data.shippingAddress?.email ||
                        'No email',
          customerPhone: data.customerPhone || 
                        data.customerInfo?.phone || 
                        data.phone ||
                        data.shippingAddress?.phone,
          items: data.items || data.products || [],
          total: data.total || 
                 data.orderSummary?.total || 
                 data.totalAmount || 
                 data.amount || 
                 (data.orderSummary?.subtotal + data.orderSummary?.tax + data.orderSummary?.shipping) ||
                 0,
          status: data.status || 'pending',
          paymentStatus: data.paymentStatus || data.payment_status || 'pending',
          shippingAddress: data.shippingAddress || data.address || {
            street: data.shippingAddress?.address || '',
            city: data.shippingAddress?.city || '',
            state: data.shippingAddress?.state || '',
            zipCode: data.shippingAddress?.pincode || data.shippingAddress?.zipCode || '',
            country: 'India'
          },
          orderDate: data.orderDate?.toDate() || data.createdAt?.toDate() || new Date(),
          deliveryDate: data.deliveryDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Order[];

      console.log('Processed orders:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to sample data
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2025-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+91 8824187767',
          items: [
            { id: '1', name: 'Paracetamol 500mg', price: 25, quantity: 2 },
            { id: '2', name: 'Vitamin D3', price: 450, quantity: 1 }
          ],
          total: 500,
          status: 'pending',
          paymentStatus: 'paid',
          shippingAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          orderDate: new Date(),
          createdAt: new Date()
        },
        {
          id: '2',
          orderNumber: 'ORD-2025-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '+91 9876543211',
          items: [
            { id: '3', name: 'Blood Pressure Monitor', price: 2500, quantity: 1 }
          ],
          total: 2500,
          status: 'delivered',
          paymentStatus: 'paid',
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deliveryDate: new Date(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status,
        ...(status === 'delivered' && { deliveryDate: new Date() })
      });

      setOrders(orders.map(o => 
        o.id === orderId ? { 
          ...o, 
          status,
          ...(status === 'delivered' && { deliveryDate: new Date() })
        } : o
      ));
      toast.success('Order status updated!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { paymentStatus });

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, paymentStatus } : o
      ));
      toast.success('Payment status updated!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(orders.filter(o => o.id !== orderId));
      toast.success('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((total, order) => total + (order.total || 0), 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  const exportOrders = () => {
    const csv = [
      ['Order Number', 'Customer', 'Email', 'Total', 'Status', 'Payment Status', 'Order Date'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.total || 0,
        order.status,
        order.paymentStatus,
        order.orderDate?.toLocaleDateString() || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || loadingData) {
    return (
      <AdminLayout title="Orders Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{getPendingOrdersCount()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{getTotalRevenue().toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique Customers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(orders.map(o => o.customerEmail)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Package className="h-6 w-6 mr-2" />
                Orders Management
              </h2>
              <p className="text-gray-600">Manage customer orders and payments</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button 
                onClick={exportOrders}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by status"
              title="Filter orders by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by payment status"
              title="Filter orders by payment status"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="failed">Payment Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by date"
              title="Filter orders by date range"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredOrders.length} of {orders.length} orders
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items & Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.orderDate?.toLocaleDateString() || 'N/A'}
                        </div>
                        {order.deliveryDate && (
                          <div className="text-xs text-green-600">
                            Delivered: {order.deliveryDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        {order.customerPhone && (
                          <div className="text-xs text-gray-500">{order.customerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{order.items?.length || 0} item(s)</div>
                        <div className="text-sm font-medium text-gray-900">₹{(order.total || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {order.items?.slice(0, 2).map(item => item.name).join(', ') || 'No items'}
                          {(order.items?.length || 0) > 2 && '...'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                        aria-label={`Update status for order ${order.orderNumber}`}
                        title="Change order status"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getPaymentStatusColor(order.paymentStatus)}`}
                        aria-label={`Update payment status for order ${order.orderNumber}`}
                        title="Change payment status"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}