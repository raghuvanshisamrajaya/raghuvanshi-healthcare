'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/components/layout/MerchantLayout';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
}

export default function MerchantPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'merchant')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'merchant') {
      loadMerchantData();
    }
  }, [user, userData, loading, router]);

  const loadMerchantData = async () => {
    try {
      // Load products
      const productsQuery = query(
        collection(db, 'products'),
        where('merchantId', '==', userData?.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const productsDocs = await getDocs(productsQuery);
      const productsData = productsDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);
      
      // Calculate stats
      const allProductsQuery = query(
        collection(db, 'products'),
        where('merchantId', '==', userData?.uid)
      );
      
      const allProductsDocs = await getDocs(allProductsQuery);
      const allProducts = allProductsDocs.docs.map(doc => doc.data());
      
      const lowStock = allProducts.filter((product: any) => product.stock < 10).length;
      
      setStats({
        totalProducts: allProducts.length,
        totalOrders: 0,
        monthlyRevenue: 0,
        lowStockItems: lowStock
      });
      
    } catch (error) {
      console.error('Error loading merchant data:', error);
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-healthcare-blue"></div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData?.displayName}!</p>
          </div>
          <button
            onClick={() => router.push('/merchant/products')}
            className="flex items-center space-x-2 px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-healthcare-blue" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-green-600">+2.5%</span> from last month
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-green-600">+12.3%</span> from last month
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-green-600">+8.1%</span> from last month
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Requires attention</p>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
              <button
                onClick={() => router.push('/merchant/products')}
                className="text-healthcare-blue hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{product.price}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products yet</p>
                <button
                  onClick={() => router.push('/merchant/products')}
                  className="mt-2 text-healthcare-blue hover:text-blue-700 text-sm font-medium"
                >
                  Add your first product
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/merchant/products')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Plus className="w-6 h-6 text-healthcare-blue" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-500">List a new product for sale</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/merchant/orders')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Eye className="w-6 h-6 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-500">Manage customer orders</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/merchant/analytics')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Track sales performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}