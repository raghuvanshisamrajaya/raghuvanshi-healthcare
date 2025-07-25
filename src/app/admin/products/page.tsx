'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Plus, Search, Edit, Trash2, Eye, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductImage, isValidImageUrl, getValidImageUrl } from '@/utils/imageUtils';
import ImageUploader from '@/components/ui/ImageUploader';

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
  createdAt: Date;
  updatedAt?: Date;
  // Rental options
  availableForRent?: boolean;
  rentPrice?: number;
  rentPeriod?: 'daily' | 'weekly' | 'monthly';
  minRentDuration?: number;
  maxRentDuration?: number;
  securityDeposit?: number;
}

export default function AdminProducts() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('url');
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
    // Rental fields
    availableForRent: false,
    rentPrice: 0,
    rentPeriod: 'monthly',
    minRentDuration: 1,
    maxRentDuration: 12,
    securityDeposit: 0
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories using filter and indexOf
  const categories = products
    .map(p => p.category)
    .filter((category, index, array) => array.indexOf(category) === index);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      fetchProducts();
    }
  }, [user, userData, loading, router]);

  const fetchProducts = async () => {
    try {
      setLoadingData(true);
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
          category: data.category || '',
          stock: data.stock || 0,
          image: data.image || '/images/product-default.jpg',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products data');
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
          image: '/images/product-default.jpg',
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
          image: '/images/product-default.jpg',
          isActive: true,
          status: 'active' as const,
          createdAt: new Date('2024-02-10')
        },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', productId), updates);
      setProducts(products.map(product => 
        product.id === productId ? { ...product, ...updates } : product
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
    return products.reduce((total, product) => total + (product.price * product.stock), 0);
  };

  const getLowStockCount = () => {
    return products.filter(product => product.stock < 10 && product.stock > 0).length;
  };

  const getOutOfStockCount = () => {
    return products.filter(product => product.stock === 0).length;
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.category || !newProduct.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      const productData = {
        ...newProduct,
        image: newProduct.image || '', // Store raw URL, let ProductImage component handle validation
        inStock: newProduct.stock! > 0,
        isActive: true,
        rating: newProduct.rating || 0,
        reviews: newProduct.reviews || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      setProducts([...products, { ...productData, id: docRef.id } as Product]);
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
        status: 'active'
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
        category: editingProduct.category,
        stock: editingProduct.stock,
        image: editingProduct.image || '', // Store raw URL, let ProductImage component handle validation
        status: editingProduct.status,
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
      <AdminLayout title="Products Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Products Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
                <p className="text-2xl font-semibold text-gray-900">${getTotalValue().toLocaleString()}</p>
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
                Products Management
              </h2>
              <p className="text-gray-600">Manage your product inventory and pricing</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              title="Filter by category"
              aria-label="Filter products by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              title="Filter by status"
              aria-label="Filter products by status"
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
                    🏠 Rental
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
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
                            <ProductImage
                              src={product.image}
                              alt={product.name}
                              category={product.category}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.availableForRent ? (
                          <div className="text-sm">
                            <div className="text-green-700 font-medium">✅ Available</div>
                            <div className="text-xs text-gray-500">
                              ₹{product.rentPrice}/{product.rentPeriod}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not Available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock} units</div>
                        <div className={`text-xs ${stockStatus.color}`}>{stockStatus.text}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(product.status)}`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={product.status}
                            onChange={(e) => handleUpdateProduct(product.id, { status: e.target.value as any })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            title={`Change status for ${product.name}`}
                            aria-label={`Update status for product ${product.name}`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="out-of-stock">Out of Stock</option>
                          </select>
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="text-blue-600 hover:text-blue-900" 
                            title="Edit product"
                            aria-label={`Edit product ${product.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete product"
                            aria-label={`Delete product ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-hidden m-4 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddModal(false)}
                title="Close modal"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">{/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    id="productName"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    id="productCategory"
                    value={newProduct.category || ''}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Medicines">Medicines</option>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="First Aid">First Aid</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="Health Monitors">Health Monitors</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="productDescription"
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

              {/* Pricing Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Price (₹) *</label>
                  <input
                    type="number"
                    id="productPrice"
                    value={newProduct.price || 0}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="productOriginalPrice" className="block text-sm font-medium text-gray-700">Original Price (₹)</label>
                  <input
                    type="number"
                    id="productOriginalPrice"
                    value={newProduct.originalPrice || ''}
                    onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                    placeholder="Original price (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="productDiscount" className="block text-sm font-medium text-gray-700">Discount (%)</label>
                  <input
                    type="number"
                    id="productDiscount"
                    value={newProduct.discount || ''}
                    onChange={(e) => setNewProduct({...newProduct, discount: e.target.value ? Number(e.target.value) : undefined})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    max="100"
                    placeholder="Discount percentage"
                  />
                </div>
              </div>

              {/* Stock and Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="productStock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    id="productStock"
                    value={newProduct.stock || 0}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    placeholder="Stock quantity"
                  />
                </div>
                <div>
                  <label htmlFor="productRating" className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                  <input
                    type="number"
                    id="productRating"
                    value={newProduct.rating || 0}
                    onChange={(e) => setNewProduct({...newProduct, rating: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <label htmlFor="productReviews" className="block text-sm font-medium text-gray-700">Number of Reviews</label>
                  <input
                    type="number"
                    id="productReviews"
                    value={newProduct.reviews || 0}
                    onChange={(e) => setNewProduct({...newProduct, reviews: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    placeholder="Number of reviews"
                  />
                </div>
              </div>

              {/* Image and Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                
                {/* Tab selector for input method */}
                <div className="mb-4">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        imageInputMethod === 'upload' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        imageInputMethod === 'url' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🔗 URL/Filename
                    </button>
                  </div>
                </div>

                {imageInputMethod === 'upload' ? (
                  <ImageUploader
                    onImageSelect={(imageData) => setNewProduct({...newProduct, image: imageData})}
                    currentImage={newProduct.image}
                  />
                ) : (
                  <div>
                    <input
                      type="text"
                      id="productImageUrl"
                      value={newProduct.image || ''}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="sample-medicine.jpg or https://example.com/image.jpg"
                    />
                    <div className="mt-1 text-xs text-gray-500 space-y-1">
                      <p><strong>Option 1:</strong> Just filename (e.g., "my-product.jpg") - place file in /public/images/products/local/</p>
                      <p><strong>Option 2:</strong> Full URL (e.g., "https://example.com/image.jpg")</p>
                      <p><strong>Option 3:</strong> Leave empty for category-based default</p>
                    </div>
                  </div>
                )}
                
                {/* Image Preview */}
                {(newProduct.image || newProduct.category) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="flex items-center space-x-3">
                      <ProductImage
                        src={newProduct.image}
                        alt={newProduct.name || 'Product preview'}
                        category={newProduct.category}
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                      <div className="text-sm">
                        {newProduct.image ? (
                          <div className="space-y-1">
                            {newProduct.image.startsWith('data:image/') ? (
                              <p className="text-purple-600 font-medium">🖼️ Uploaded image (Base64)</p>
                            ) : newProduct.image.includes('/') || newProduct.image.startsWith('http') ? (
                              <p className="text-blue-600 font-medium">🌐 External/Path URL</p>
                            ) : (
                              <p className="text-green-600 font-medium">📁 Local file: /images/products/local/{newProduct.image}</p>
                            )}
                            <p className="text-gray-500">Using: Custom image</p>
                          </div>
                        ) : (
                          <p className="text-gray-500">Using: Default category image</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkboxes and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="productPrescription"
                      checked={newProduct.prescription || false}
                      onChange={(e) => setNewProduct({...newProduct, prescription: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="productPrescription" className="ml-2 text-sm text-gray-700">
                      Requires Prescription
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="productStatus" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="productStatus"
                    value={newProduct.status || 'active'}
                    onChange={(e) => setNewProduct({...newProduct, status: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Rental Options Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">🏠 Rental Configuration</h4>
                
                <div className="space-y-4">
                  {/* Available for Rent Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availableForRent"
                      checked={newProduct.availableForRent || false}
                      onChange={(e) => setNewProduct({...newProduct, availableForRent: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="availableForRent" className="ml-2 text-sm font-semibold text-gray-700">
                      🎯 Available for Rent
                    </label>
                  </div>

                  {newProduct.availableForRent && (
                    <>
                      {/* Rental Price and Period */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="rentPrice" className="block text-sm font-medium text-gray-700">
                            💰 Rent Price (₹)
                          </label>
                          <input
                            type="number"
                            id="rentPrice"
                            value={newProduct.rentPrice || 0}
                            onChange={(e) => setNewProduct({...newProduct, rentPrice: Number(e.target.value)})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            min="0"
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <label htmlFor="rentPeriod" className="block text-sm font-medium text-gray-700">
                            📅 Rent Period
                          </label>
                          <select
                            id="rentPeriod"
                            value={newProduct.rentPeriod || 'monthly'}
                            onChange={(e) => setNewProduct({...newProduct, rentPeriod: e.target.value as any})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>

                      {/* Duration Limits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="minRentDuration" className="block text-sm font-medium text-gray-700">
                            ⏰ Min Duration ({newProduct.rentPeriod}s)
                          </label>
                          <input
                            type="number"
                            id="minRentDuration"
                            value={newProduct.minRentDuration || 1}
                            onChange={(e) => setNewProduct({...newProduct, minRentDuration: Number(e.target.value)})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            min="1"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label htmlFor="maxRentDuration" className="block text-sm font-medium text-gray-700">
                            ⏳ Max Duration ({newProduct.rentPeriod}s)
                          </label>
                          <input
                            type="number"
                            id="maxRentDuration"
                            value={newProduct.maxRentDuration || 12}
                            onChange={(e) => setNewProduct({...newProduct, maxRentDuration: Number(e.target.value)})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            min="1"
                            placeholder="12"
                          />
                        </div>
                      </div>

                      {/* Security Deposit */}
                      <div>
                        <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">
                          🛡️ Security Deposit (₹)
                        </label>
                        <input
                          type="number"
                          id="securityDeposit"
                          value={newProduct.securityDeposit || 0}
                          onChange={(e) => setNewProduct({...newProduct, securityDeposit: Number(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          min="0"
                          placeholder="5000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Refundable deposit amount</p>
                      </div>

                      {/* Rental Preview */}
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">📊 Rental Summary</h5>
                        <div className="text-sm space-y-1">
                          <p>Rent: ₹{newProduct.rentPrice || 0} per {newProduct.rentPeriod}</p>
                          <p>Duration: {newProduct.minRentDuration || 1} - {newProduct.maxRentDuration || 12} {newProduct.rentPeriod}(s)</p>
                          <p>Security Deposit: ₹{newProduct.securityDeposit || 0}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editProductName" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  id="editProductName"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Product name"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label htmlFor="editProductDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="editProductDescription"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  title="Product description"
                  placeholder="Product description"
                />
              </div>
              <div>
                <label htmlFor="editProductCategory" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  id="editProductCategory"
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Product category"
                  placeholder="Product category"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editProductPrice" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    id="editProductPrice"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                    title="Product price in Rupees"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="editProductStock" className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    id="editProductStock"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    title="Product stock quantity"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="editProductImageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  id="editProductImageUrl"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                  title="Product image URL"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use category-based default image</p>
                
                {/* Image Preview */}
                {(editingProduct.image || editingProduct.category) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="flex items-center space-x-3">
                      <ProductImage
                        src={editingProduct.image}
                        alt={editingProduct.name || 'Product preview'}
                        category={editingProduct.category}
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                      <div className="text-sm">
                        {editingProduct.image ? (
                          <div className="space-y-1">
                            <p className={`font-medium ${isValidImageUrl(editingProduct.image) ? 'text-green-600' : 'text-orange-500'}`}>
                              {isValidImageUrl(editingProduct.image) ? '✓ Valid URL format' : '⚠ URL format may be invalid'}
                            </p>
                            <p className="text-gray-500">Using: Custom image URL</p>
                          </div>
                        ) : (
                          <p className="text-gray-500">Using: Default category image</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="editProductStatus" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="editProductStatus"
                  value={editingProduct.status || 'active'}
                  onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Product status"
                  aria-label="Product status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
