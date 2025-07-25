'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/components/layout/MerchantLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Plus, Search, Edit, Trash2, Eye, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/ui/ImageUploader';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  inStock: boolean;
  image?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  prescription?: boolean;
  isActive: boolean;
  status: 'active' | 'inactive' | 'out-of-stock';
  merchantId?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Rental options
  availableForRent?: boolean;
  rentPrice?: number; // per day/week/month
  rentPeriod?: 'daily' | 'weekly' | 'monthly';
  minRentDuration?: number; // minimum rental period
  maxRentDuration?: number; // maximum rental period
  securityDeposit?: number; // refundable security deposit
}

export default function MerchantProducts() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    category: '',
    stock: 0,
    inStock: true,
    image: '',
    rating: 0,
    reviews: 0,
    discount: undefined,
    prescription: false,
    isActive: true,
    status: 'active',
    // Rental options
    availableForRent: false,
    rentPrice: undefined,
    rentPeriod: 'daily',
    minRentDuration: 1,
    maxRentDuration: 30,
    securityDeposit: undefined
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = products
    .map(p => p.category)
    .filter((category, index, array) => array.indexOf(category) === index);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'merchant')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'merchant') {
      fetchProducts();
    }
  }, [user, userData, loading, router]);

  const fetchProducts = async () => {
    try {
      setLoadingData(true);
      // Fetch ALL products (not just merchant's own)
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );

      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          originalPrice: data.originalPrice,
          category: data.category || '',
          stock: data.stock || 0,
          inStock: data.inStock !== undefined ? data.inStock : true,
          image: data.image || '',
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          discount: data.discount,
          prescription: data.prescription || false,
          isActive: data.isActive !== undefined ? data.isActive : true,
          status: data.status || 'active',
          merchantId: data.merchantId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        } as Product;
      });

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      // Fallback sample data
      setProducts([
        {
          id: 'prd_001_paracetamol_500mg',
          name: 'Paracetamol 500mg',
          description: 'Pain relief and fever reducer tablets',
          price: 5.99,
          category: 'Pain Relief',
          stock: 150,
          inStock: true,
          image: '/images/products/default-product.svg',
          rating: 4.5,
          reviews: 120,
          isActive: true,
          status: 'active' as const,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 'prd_002_ibuprofen_200mg',
          name: 'Ibuprofen 200mg',
          description: 'Anti-inflammatory pain relief medication',
          price: 8.50,
          category: 'Pain Relief',
          stock: 85,
          inStock: true,
          image: '/images/products/default-product.svg',
          rating: 4.3,
          reviews: 87,
          isActive: true,
          status: 'active' as const,
          createdAt: new Date('2024-02-10')
        },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusUpdate = async (productId: string, status: string) => {
    try {
      const updates = { 
        status: status as 'active' | 'inactive' | 'out-of-stock', 
        updatedAt: new Date(),
        inStock: status === 'active'
      };
      await updateDoc(doc(db, 'products', productId), updates);
      setProducts(products.map(product => 
        product.id === productId ? { ...product, ...updates } as Product : product
      ));
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(product => product.id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const getTotalValue = () => {
    return products
      .filter(product => product.merchantId === user?.uid)
      .reduce((total, product) => total + (product.price * product.stock), 0);
  };

  const getLowStockCount = () => {
    return products
      .filter(product => product.merchantId === user?.uid && product.stock < 10 && product.stock > 0)
      .length;
  };

  const getOutOfStockCount = () => {
    return products
      .filter(product => product.merchantId === user?.uid && product.stock === 0)
      .length;
  };

  const getMerchantProductsCount = () => {
    return products.filter(product => product.merchantId === user?.uid).length;
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.category || !newProduct.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      const productData = {
        ...newProduct,
        merchantId: user?.uid, // Associate with current merchant
        image: newProduct.image || '',
        inStock: newProduct.stock! > 0,
        isActive: true,
        rating: newProduct.rating || 0,
        reviews: newProduct.reviews || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      setProducts([{ ...productData, id: docRef.id } as Product, ...products]);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        category: '',
        stock: 0,
        inStock: true,
        image: '',
        rating: 0,
        reviews: 0,
        discount: undefined,
        prescription: false,
        isActive: true,
        status: 'active',
        // Rental options
        availableForRent: false,
        rentPrice: undefined,
        rentPeriod: 'daily',
        minRentDuration: 1,
        maxRentDuration: 30,
        securityDeposit: undefined
      });
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      const productRef = doc(db, 'products', editingProduct.id);
      const updatedData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice,
        category: editingProduct.category,
        stock: editingProduct.stock,
        image: editingProduct.image || '',
        rating: editingProduct.rating,
        reviews: editingProduct.reviews,
        discount: editingProduct.discount,
        prescription: editingProduct.prescription,
        status: editingProduct.status,
        inStock: editingProduct.stock > 0,
        updatedAt: new Date()
      };
      
      await updateDoc(productRef, updatedData);

      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...editingProduct, ...updatedData } : p
      ));
      setEditingProduct(null);
      toast.success('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  if (loading || loadingData) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading products...</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Products</p>
                <p className="text-2xl font-semibold text-gray-900">{getMerchantProductsCount()}</p>
                <p className="text-xs text-gray-400">Total in system: {products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{getLowStockCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{getOutOfStockCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">₹{getTotalValue().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header and Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">View all products • Manage your products • Upload images</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              src={product.image || '/images/products/default-product.svg'}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/products/default-product.svg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.merchantId === user?.uid && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  My Product
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{product.description.slice(0, 50)}...</div>
                            {product.prescription && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Prescription Required
                              </span>
                            )}
                            {product.availableForRent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Available for Rent
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">₹{product.price.toLocaleString()}</div>
                          {product.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </div>
                          )}
                          {product.discount && (
                            <div className="text-xs text-green-600">
                              {product.discount}% off
                            </div>
                          )}
                          {product.availableForRent && product.rentPrice && (
                            <div className="text-xs text-blue-600">
                              Rent: ₹{product.rentPrice}/{product.rentPeriod}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                        <div className={`text-xs ${stockStatus.color}`}>{stockStatus.text}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1">{product.rating || 0}</span>
                          <span className="text-gray-500 text-xs ml-1">({product.reviews || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.merchantId === user?.uid ? (
                          <select
                            value={product.status}
                            onChange={(e) => handleStatusUpdate(product.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusBadgeColor(product.status)}`}
                            title={`Change status for ${product.name}`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="out-of-stock">Out of Stock</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(product.status)}`}>
                            {product.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {product.merchantId === user?.uid ? (
                            <>
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                                title={`Edit ${product.name}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                                title={`Delete ${product.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="text-gray-400 cursor-not-allowed"
                                disabled
                                title="You can only edit your own products"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <span className="text-xs text-gray-500">View Only</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by adding your first product.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  title="Add new product"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      value={newProduct.category || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Medicine, Equipment, Supplements"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed product description..."
                  />
                </div>

                {/* Price and Original Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={newProduct.price || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) || undefined })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Original price (if discounted)"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      value={newProduct.discount || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, discount: Number(e.target.value) || undefined })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Discount percentage"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Stock and Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      value={newProduct.stock || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Stock quantity"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                    <input
                      type="number"
                      value={newProduct.rating || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, rating: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="4.5"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Reviews</label>
                    <input
                      type="number"
                      value={newProduct.reviews || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, reviews: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of reviews"
                      min="0"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <ImageUploader
                  onImageSelect={(imageData) => setNewProduct({ ...newProduct, image: imageData })}
                  currentImage={newProduct.image}
                  className="w-full"
                />

                {/* Checkboxes and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.prescription || false}
                        onChange={(e) => setNewProduct({ ...newProduct, prescription: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        title="Prescription required checkbox"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Requires Prescription
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.availableForRent || false}
                        onChange={(e) => setNewProduct({ ...newProduct, availableForRent: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        title="Available for rent checkbox"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Available for Rent
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={newProduct.status || 'active'}
                      onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Product status"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Rental Options */}
                {newProduct.availableForRent && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Rental Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rent Price (₹) *</label>
                        <input
                          type="number"
                          value={newProduct.rentPrice || 0}
                          onChange={(e) => setNewProduct({ ...newProduct, rentPrice: Number(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Daily/Weekly/Monthly rent"
                          min="0"
                          step="0.01"
                          title="Rental price"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rent Period</label>
                        <select
                          value={newProduct.rentPeriod || 'daily'}
                          onChange={(e) => setNewProduct({ ...newProduct, rentPeriod: e.target.value as any })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          title="Rental period"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (₹)</label>
                        <input
                          type="number"
                          value={newProduct.securityDeposit || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, securityDeposit: Number(e.target.value) || undefined })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Refundable deposit"
                          min="0"
                          title="Security deposit amount"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Rent Duration</label>
                        <input
                          type="number"
                          value={newProduct.minRentDuration || 1}
                          onChange={(e) => setNewProduct({ ...newProduct, minRentDuration: Number(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Minimum days/weeks/months"
                          min="1"
                          title="Minimum rental duration"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Rent Duration</label>
                        <input
                          type="number"
                          value={newProduct.maxRentDuration || 30}
                          onChange={(e) => setNewProduct({ ...newProduct, maxRentDuration: Number(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Maximum days/weeks/months"
                          min="1"
                          title="Maximum rental duration"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close edit modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Product name"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Product category"
                      placeholder="Enter category"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    title="Product description"
                    placeholder="Enter product description"
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      title="Product price"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) || undefined })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      title="Original price before discount"
                      placeholder="Original price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      title="Stock quantity"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                    <input
                      type="number"
                      value={editingProduct.rating || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="5"
                      step="0.1"
                      title="Product rating"
                      placeholder="4.5"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <ImageUploader
                  onImageSelect={(imageData) => setEditingProduct({ ...editingProduct, image: imageData })}
                  currentImage={editingProduct.image}
                  className="w-full"
                />

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.prescription || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, prescription: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      title="Prescription required checkbox"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Requires Prescription
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as 'active' | 'inactive' | 'out-of-stock' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Product status"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditProduct}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
