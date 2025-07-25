'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Download,
  Phone,
  MessageCircle,
  ArrowRight,
  Search,
  Filter,
  Receipt
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

interface Booking {
  id: string;
  invoiceId?: string;
  serviceName?: string;
  service?: string;
  doctorAssigned?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  urgency?: 'normal' | 'priority' | 'urgent';
  patientInfo?: any;
  patientName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  symptoms?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function UserBookingsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchBookings();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.uid) {
        console.log('No user ID available');
        setIsLoading(false);
        return;
      }

      console.log('Fetching bookings for user:', user.uid);
      
      // First try to get bookings by userId
      let bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );
      
      let bookingsSnapshot = await getDocs(bookingsQuery);
      let bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];

      // If no bookings found by userId, try by email
      if (bookingsData.length === 0 && user.email) {
        console.log('No bookings found by userId, trying by email:', user.email);
        bookingsQuery = query(
          collection(db, 'bookings'),
          where('email', '==', user.email)
        );
        
        bookingsSnapshot = await getDocs(bookingsQuery);
        bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
      }

      console.log('Found bookings:', bookingsData.length);
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setBookings(bookingsData);
      
      if (bookingsData.length === 0) {
        toast.success('No bookings found. Book your first appointment!');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        (booking.serviceName || booking.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.doctorAssigned || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'no-show': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'confirmed': return <Calendar className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'priority': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDownloadInvoice = (booking: Booking) => {
    const invoiceContent = `
RAGHUVANSHI HEALTHCARE
Medical Service Invoice

Invoice ID: ${booking.invoiceId || 'N/A'}
Booking ID: ${booking.id}
Date: ${new Date().toLocaleDateString('en-IN')}

Patient Details:
Name: ${booking.patientName || booking.firstName + ' ' + booking.lastName || 'N/A'}
Email: ${booking.email || 'N/A'}
Phone: ${booking.phone || 'N/A'}

Service Details:
Service: ${booking.serviceName || booking.service || 'N/A'}
Doctor: ${booking.doctorAssigned || 'To be assigned'}
Date: ${formatDate(booking.appointmentDate)}
Time: ${booking.appointmentTime || 'Time TBD'}
Urgency: ${(booking.urgency || 'normal').toUpperCase()}

Payment Details:
Amount: ₹${booking.totalAmount || 0}
Payment Status: ${(booking.paymentStatus || 'pending').toUpperCase()}
Booking Status: ${(booking.status || 'pending').toUpperCase()}

Symptoms/Notes:
${booking.symptoms}
${booking.notes ? `Additional Notes: ${booking.notes}` : ''}

For any queries, contact us:
Phone: +91-9876543210
Email: support@raghuvanshihealthcare.com

Thank you for choosing Raghuvanshi Healthcare!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${booking.invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleWhatsAppContact = (booking: Booking) => {
    const message = `Hi, I need help with my booking:
Invoice ID: ${booking.invoiceId}
Service: ${booking.serviceName}
Date: ${formatDate(booking.appointmentDate)} at ${booking.appointmentTime}
Please assist me.`;
    
    const whatsappUrl = `https://wa.me/918824187767?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">Track your appointments and medical consultations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bookings.filter(b => {
                      if (!b.appointmentDate) return false;
                      try {
                        const bookingDate = new Date(b.appointmentDate);
                        const now = new Date();
                        return bookingDate.getMonth() === now.getMonth() && 
                               bookingDate.getFullYear() === now.getFullYear();
                      } catch {
                        return false;
                      }
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by service, doctor, or invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your search'}
              </h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? 'Start by booking your first medical consultation'
                  : 'Try adjusting your search criteria'
                }
              </p>
              {bookings.length === 0 && (
                <Button onClick={() => router.push('/booking')}>
                  Book Your First Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Left Side - Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.serviceName || booking.service || 'Unknown Service'}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status || 'pending')}`}>
                              {getStatusIcon(booking.status || 'pending')}
                              <span className="ml-1">
                                {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                              </span>
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(booking.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{booking.appointmentTime || 'Time TBD'}</span>
                              </div>
                              {booking.urgency && booking.urgency !== 'normal' && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeColor(booking.urgency || 'normal')}`}>
                                  {(booking.urgency || 'normal').toUpperCase()}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>Dr. {booking.doctorAssigned || 'To be assigned'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Receipt className="h-4 w-4" />
                              <span className="font-mono text-xs">Invoice: {booking.invoiceId}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-healthcare-blue">₹{booking.totalAmount}</div>
                          <div className={`text-sm ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                          </div>
                        </div>
                      </div>

                      {/* Symptoms */}
                      {booking.symptoms && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
                            <strong>Symptoms/Reason:</strong> {booking.symptoms}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-6">
                      <Button
                        onClick={() => handleDownloadInvoice(booking)}
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                      
                      <Button
                        onClick={() => handleWhatsAppContact(booking)}
                        size="sm"
                        className="w-full lg:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        onClick={() => router.push(`tel:+919876543210`)}
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/booking')}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
              
              <Button
                onClick={() => router.push('/services')}
                variant="outline"
                className="w-full"
              >
                <Heart className="h-4 w-4 mr-2" />
                Browse Services
              </Button>
              
              <Button
                onClick={() => router.push('/contact')}
                variant="outline"
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
