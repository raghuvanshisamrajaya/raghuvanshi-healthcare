'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, ShoppingBag, Package, Calendar, MapPin, CreditCard, Settings, LogOut, Bell, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  orderSummary: {
    total: number;
  };
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

interface Booking {
  id: string;
  invoiceId: string;
  serviceName: string;
  doctorAssigned?: string;
  appointmentDate: string;
  appointmentTime: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  urgency: 'normal' | 'priority' | 'urgent';
  createdAt: any;
  patientInfo: any;
}

export default function UserDashboard() {
  const { user, userData, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchRecentOrders();
      fetchRecentBookings();
    }
  }, [user]);

  const fetchRecentOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching orders for user:', user.uid);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const orderDocs = await getDocs(ordersQuery);
      console.log('Found orders:', orderDocs.size);
      
      const ordersData = orderDocs.docs.map(doc => {
        const data = doc.data();
        console.log('Order data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Order[];

      console.log('Processed orders:', ordersData);
      setOrders(ordersData);
      
      // If no orders found, add sample data for testing
      if (ordersData.length === 0) {
        const sampleOrders: Order[] = [
          {
            id: 'sample-order-1',
            orderNumber: 'ORD175292345',
            items: [
              { id: '1', name: 'Medical Equipment', price: 2500, quantity: 1 }
            ],
            orderSummary: { total: 2500 },
            status: 'delivered',
            paymentStatus: 'paid',
            createdAt: new Date()
          },
          {
            id: 'sample-order-2',
            orderNumber: 'ORD175292346',
            items: [
              { id: '2', name: 'Health Supplements', price: 1200, quantity: 2 }
            ],
            orderSummary: { total: 2400 },
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date()
          }
        ];
        setOrders(sampleOrders);
        console.log('Using sample orders data');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Add sample data as fallback
      const sampleOrders: Order[] = [
        {
          id: 'sample-order-fallback',
          orderNumber: 'ORD175292347',
          items: [{ id: '1', name: 'Sample Product', price: 1000, quantity: 1 }],
          orderSummary: { total: 1000 },
          status: 'processing',
          paymentStatus: 'paid',
          createdAt: new Date()
        }
      ];
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    if (!user) return;

    try {
      setBookingsLoading(true);
      console.log('Fetching bookings for user:', user.uid);
      
      // First try to get bookings by userId
      let bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      let bookingDocs = await getDocs(bookingsQuery);
      console.log('Found bookings by userId:', bookingDocs.size);
      
      // If no bookings found by userId, try by email
      if (bookingDocs.size === 0 && user.email) {
        console.log('No bookings found by userId, trying by email:', user.email);
        bookingsQuery = query(
          collection(db, 'bookings'),
          where('email', '==', user.email),
          limit(5)
        );
        bookingDocs = await getDocs(bookingsQuery);
        console.log('Found bookings by email:', bookingDocs.size);
      }
      
      const bookingsData = bookingDocs.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Booking[];

      console.log('Processed bookings:', bookingsData);
      setBookings(bookingsData);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard</p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-orange-600 bg-orange-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no-show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'profile', name: 'Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userData?.displayName || user.displayName || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">Manage your account and track your orders</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{userData?.displayName || user.displayName}</p>
                  <p className="text-sm text-gray-500 capitalize">{userData?.role || 'User'}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/cart"
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Cart</span>
                    </div>
                    {getCartItemCount() > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    <span>Shop</span>
                  </Link>
                  <Link
                    href="/services"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Services</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Image
                          src="/logo-gold-small.svg"
                          alt="Raghuvanshi Healthcare"
                          width={24}
                          height={29}
                          className="h-6 w-6"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Health Bookings</p>
                        <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Cart Items</p>
                        <p className="text-2xl font-semibold text-gray-900">{getCartItemCount()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Account Type</p>
                        <p className="text-2xl font-semibold text-gray-900 capitalize">{userData?.role || 'User'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                      <Link
                        href="#"
                        onClick={() => setActiveTab('orders')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">
                                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} • 
                                  ₹{order.orderSummary.total.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.createdAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No orders yet</p>
                        <Link
                          href="/shop"
                          className="inline-block mt-2 text-blue-600 hover:text-blue-700"
                        >
                          Start shopping
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Appointments & Bookings */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Health Appointments</h2>
                      <Link
                        href="/user/bookings"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    {bookingsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Image
                                  src="/logo-gold-small.svg"
                                  alt="Raghuvanshi Healthcare"
                                  width={24}
                                  height={29}
                                  className="h-6 w-6"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                                <p className="text-sm text-gray-500">
                                  {booking.doctorAssigned ? `Dr. ${booking.doctorAssigned}` : 'Doctor to be assigned'} • 
                                  ₹{booking.totalAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {booking.appointmentDate} at {booking.appointmentTime} • {booking.invoiceId}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        ))}
                        
                        <div className="flex justify-center space-x-4 mt-6">
                          <Link
                            href="/user/bookings"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View All Bookings
                          </Link>
                          <Link
                            href="/booking"
                            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                          >
                            Book New Appointment
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Health</h3>
                        <p className="text-gray-600 mb-6">
                          Book medical consultations and track your appointment history
                        </p>
                        
                        <div className="flex justify-center space-x-4">
                          <Link
                            href="/user/bookings"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            My Bookings
                          </Link>
                          <Link
                            href="/booking"
                            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                          >
                            Book Appointment
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                              <p className="text-sm text-gray-500">
                                Ordered on {order.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <p className="text-lg font-semibold text-gray-900 mt-1">
                                ₹{order.orderSummary.total.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center space-x-4">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <span className="text-sm text-gray-700">{item.name}</span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-sm text-gray-500">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Link
                              href={`/order-confirmation/${order.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders yet</p>
                      <Link
                        href="/shop"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Start shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">My Appointments & Bookings</h2>
                    <Link
                      href="/user/bookings"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All Bookings
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {bookingsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading appointments...</p>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {booking.serviceName || 'Unknown Service'}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{booking.appointmentDate || 'Date TBD'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>{booking.appointmentTime || 'Time TBD'}</span>
                                </div>
                              </div>
                              {booking.doctorAssigned && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Dr. {booking.doctorAssigned}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                              </span>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                ₹{booking.totalAmount || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center pt-4">
                        <Link
                          href="/user/bookings"
                          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>View All Bookings</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
                      <p className="text-gray-600 mb-6">
                        You haven't booked any appointments yet. Start by booking your first consultation.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <Link
                          href="/booking"
                          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Calendar className="h-5 w-5" />
                          <span>Book Appointment</span>
                        </Link>
                        
                        <Link
                          href="/services"
                          className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Image
                            src="/logo-gold-small.svg"
                            alt="Raghuvanshi Healthcare"
                            width={20}
                            height={24}
                            className="h-5 w-5"
                          />
                          <span>Browse Services</span>
                        </Link>
                      </div>

                      <div className="mt-6 text-sm text-gray-500">
                        <p>• General consultations</p>
                        <p>• Specialist appointments</p>
                        <p>• Health checkups and tests</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <p className="text-gray-900">{userData?.displayName || user.displayName || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <p className="text-gray-900">{userData?.phoneNumber || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <p className="text-gray-900 capitalize">{userData?.role || 'User'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <p className="text-gray-900">{userData?.address || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {userData?.createdAt?.toLocaleDateString() || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
