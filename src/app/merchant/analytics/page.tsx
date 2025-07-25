'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/components/layout/MerchantLayout';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  monthlyRevenue: number[];
  topProducts: any[];
  recentOrders: any[];
}

export default function MerchantAnalytics() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    monthlyRevenue: [],
    topProducts: [],
    recentOrders: []
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'merchant')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'merchant') {
      fetchAnalyticsData();
    }
  }, [user, userData, loading, router]);

  const fetchAnalyticsData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch products for this merchant
      const productsQuery = query(
        collection(db, 'products'),
        where('merchantId', '==', user?.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch orders containing this merchant's products
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Filter orders that contain merchant's products
      const merchantOrders = allOrders.filter((order: any) => 
        order.items?.some((item: any) => 
          products.some((product: any) => product.id === item.productId)
        )
      );

      // Calculate analytics
      const totalRevenue = merchantOrders.reduce((sum, order: any) => {
        const merchantItems = order.items?.filter((item: any) => 
          products.some((product: any) => product.id === item.productId)
        ) || [];
        return sum + merchantItems.reduce((itemSum: number, item: any) => 
          itemSum + (item.price * item.quantity), 0
        );
      }, 0);

      const averageOrderValue = merchantOrders.length > 0 ? totalRevenue / merchantOrders.length : 0;

      // Mock monthly revenue data (in a real app, you'd calculate this from actual data)
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => 
        Math.floor(Math.random() * 10000) + 5000
      );

      // Get top products
      const topProducts = (products as any[])
        .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
        .slice(0, 5);

      setAnalyticsData({
        totalRevenue,
        totalOrders: merchantOrders.length,
        totalProducts: products.length,
        averageOrderValue,
        monthlyRevenue,
        topProducts,
        recentOrders: merchantOrders.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading analytics...</p>
        </div>
      </MerchantLayout>
    );
  }

  if (!user || userData?.role !== 'merchant') {
    return null;
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your store performance and insights</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Select time period"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">This year</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{analyticsData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalOrders}</p>
                <p className="text-sm text-blue-600">+8.2% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{Math.round(analyticsData.averageOrderValue).toLocaleString()}
                </p>
                <p className="text-sm text-purple-600">+3.1% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Products Listed</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalProducts}</p>
                <p className="text-sm text-orange-600">Active products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.monthlyRevenue.map((revenue, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t flex-1"
                  style={{ height: `${(revenue / Math.max(...analyticsData.monthlyRevenue)) * 100}%` }}
                  title={`Month ${index + 1}: ₹${revenue.toLocaleString()}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Stock: {product.stock || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber || order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName || order.customerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
