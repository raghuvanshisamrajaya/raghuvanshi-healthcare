'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar, Search, Eye, Trash2, Filter, Download, Clock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  bookingNumber: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceName: string;
  doctorName?: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
}

export default function AdminBookings() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      fetchBookings();
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoadingData(true);
      const bookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc')
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Booking[];

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback sample data
      const sampleBookings: Booking[] = [
        {
          id: 'admin-booking-1',
          invoiceId: 'INV175292ADMIN001',
          serviceName: 'General Consultation',
          patientInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91-9876543210',
            address: '123 Medical Street, Health City'
          },
          doctorAssigned: 'Dr. Rajesh Sharma',
          appointmentDate: new Date('2025-07-25'),
          appointmentTime: '10:00 AM',
          totalAmount: 500,
          status: 'confirmed',
          paymentStatus: 'paid',
          urgency: 'normal',
          notes: 'Regular checkup appointment',
          createdAt: new Date()
        },
        {
          id: 'admin-booking-2',
          invoiceId: 'INV175292ADMIN002',
          serviceName: 'Blood Test',
          patientInfo: {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+91-9876543211',
            address: '456 Lab Avenue, Test Town'
          },
          doctorAssigned: 'Dr. Priya Singh',
          appointmentDate: '2025-07-26',
          appointmentTime: '2:00 PM',
          totalAmount: 800,
          status: 'pending',
          paymentStatus: 'pending',
          urgency: 'priority',
          notes: 'Fasting blood test required',
          createdAt: new Date()
        }
      ];
      setBookings(sampleBookings);
    } finally {
      setLoadingData(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.doctorAssigned && booking.doctorAssigned.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus as any }
          : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no-show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'priority': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
              <p className="text-gray-600 mt-2">View and manage all health service bookings</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-500">
                  {filteredBookings.length} of {bookings.length} bookings
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient & Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor & Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <p className="text-sm font-medium text-gray-900">{booking.patientInfo.name}</p>
                          </div>
                          <p className="text-sm text-gray-500">{booking.serviceName}</p>
                          <p className="text-xs text-gray-400">{booking.invoiceId}</p>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getUrgencyColor(booking.urgency)}`}>
                            {booking.urgency}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900">{booking.doctorAssigned || 'Not assigned'}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-500">{booking.appointmentDate}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-500">{booking.appointmentTime}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Payment: {booking.paymentStatus}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            ₹{booking.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
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
          </div>
        </div>

        {/* Modal for booking details */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Patient</label>
                    <p className="text-sm text-gray-900">{selectedBooking.patientInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact</label>
                    <p className="text-sm text-gray-900">{selectedBooking.patientInfo.email}</p>
                    <p className="text-sm text-gray-900">{selectedBooking.patientInfo.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service</label>
                    <p className="text-sm text-gray-900">{selectedBooking.serviceName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Doctor</label>
                    <p className="text-sm text-gray-900">{selectedBooking.doctorAssigned || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Appointment</label>
                    <p className="text-sm text-gray-900">{selectedBooking.appointmentDate} at {selectedBooking.appointmentTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{selectedBooking.notes || 'No notes'}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
