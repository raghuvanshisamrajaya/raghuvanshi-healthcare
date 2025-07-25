'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Search, Filter, Star, Heart, Truck, Shield, RefreshCw, X, Calendar, IndianRupee } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RentalRequestForm from '@/components/RentalRequestForm';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ProductImage, getCategoryImage } from '@/utils/imageUtils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image?: string;
  discount?: number;
  inStock: boolean;
  prescription?: boolean;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  // Rental options
  availableForRent?: boolean;
  rentPrice?: number;
  rentPeriod?: 'daily' | 'weekly' | 'monthly';
  minRentDuration?: number;
  maxRentDuration?: number;
  securityDeposit?: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedRentalProduct, setSelectedRentalProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const categories = [
    'All Products',
    'Medicines',
    'Vitamins & Supplements',
    'Medical Equipment',
    'Personal Care',
    'Baby Care',
    'Health Monitors',
    'First Aid'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch products from Firebase
      const productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true)
      );
      
      const productDocs = await getDocs(productsQuery);
      
      if (productDocs.empty) {
        toast.error('No products available at the moment.');
        setProducts([]);
        return;
      }
      
      const productsData = productDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Product[];
      
      // Sort products by name
      productsData.sort((a, b) => a.name.localeCompare(b.name));
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      // Use the product image directly, let the cart component handle fallbacks
      const productImage = product.image || getCategoryImage(product.category);

      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImage,
        type: 'product',
        category: product.category,
        description: product.description,
      });
      
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleRentProduct = (product: Product) => {
    if (!user) {
      toast.error('Please sign in to rent products');
      return;
    }

    if (!product.availableForRent) {
      toast.error('This product is not available for rent');
      return;
    }

    setSelectedRentalProduct(product);
    setShowRentalModal(true);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'All Products' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Health Shop
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Shop for medicines, supplements, medical equipment, and wellness products
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Select category"
                aria-label="Product category filter"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Sort products"
                aria-label="Sort products"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      category={product.category}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onImageError={() => console.log(`Failed to load image for ${product.name}`)}
                    />
                    
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                        {product.discount}% OFF
                      </div>
                    )}

                    {/* Prescription Badge */}
                    {product.prescription && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                        Rx
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-blue-600 font-medium">{product.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating!)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({product.reviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rental Info */}
                    {product.availableForRent && (
                      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 font-medium">Available for Rent</span>
                          <span className="text-green-600 font-bold">
                            ₹{product.rentPrice}/{product.rentPeriod}
                          </span>
                        </div>
                        {product.securityDeposit && (
                          <div className="text-xs text-green-600 mt-1">
                            Security Deposit: ₹{product.securityDeposit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {product.inStock ? (
                      user ? (
                        <div className="space-y-2">
                          {/* Buy Button */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Add to Cart</span>
                          </button>
                          
                          {/* Rent Button */}
                          {product.availableForRent && (
                            <button
                              onClick={() => handleRentProduct(product)}
                              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Rent Now</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-2">Sign in to purchase or rent</p>
                          <Link
                            href="/login"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                          >
                            Sign In
                          </Link>
                        </div>
                      )
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Truck className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600">Free delivery on orders over ₹500</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Authentic Products</h3>
              <p className="text-sm text-gray-600">100% genuine medicines and products</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-600">Hassle-free returns within 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Modal */}
      {showRentalModal && selectedRentalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Rent: {selectedRentalProduct.name}
              </h2>
              <button
                onClick={() => {
                  setShowRentalModal(false);
                  setSelectedRentalProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close rental modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <ProductImage
                    src={selectedRentalProduct.image}
                    alt={selectedRentalProduct.name}
                    category={selectedRentalProduct.category}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Rental Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rent Price:</span>
                        <span className="font-semibold">₹{selectedRentalProduct.rentPrice}/{selectedRentalProduct.rentPeriod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Deposit:</span>
                        <span className="font-semibold">₹{selectedRentalProduct.securityDeposit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Duration:</span>
                        <span className="font-semibold">{selectedRentalProduct.minRentDuration} {selectedRentalProduct.rentPeriod}(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Duration:</span>
                        <span className="font-semibold">{selectedRentalProduct.maxRentDuration} {selectedRentalProduct.rentPeriod}(s)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Rental Requirements</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Valid Aadhar Card (for identity verification)</li>
                      <li>• PAN Card (for financial verification)</li>
                      <li>• Bank Account Cheque (as security)</li>
                      <li>• Advance payment required</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <RentalRequestForm
                product={selectedRentalProduct}
                onSuccess={() => {
                  setShowRentalModal(false);
                  setSelectedRentalProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
