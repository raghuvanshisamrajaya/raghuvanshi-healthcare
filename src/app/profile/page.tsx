'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, 
  Clock, 
  User, 
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Eye,
  Download
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  invoiceId: string;
  serviceName: string;
  doctorAssigned: string | null;
  appointmentDate: string;
  appointmentTime: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  urgency: 'normal' | 'urgent' | 'emergency';
  createdAt: any;
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    symptoms?: string;
    notes?: string;
  };
}

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      if (!user) return;

      console.log('Fetching bookings for user:', user.uid);

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(bookingsQuery);
      console.log('Bookings query result:', querySnapshot.size, 'documents');
      
      const bookingsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', data);
        return {
          id: doc.id,
          ...data
        };
      }) as Booking[];

      console.log('Processed bookings:', bookingsData);
      
      // If no bookings found, add some sample data for testing
      if (bookingsData.length === 0) {
        const sampleBookings: Booking[] = [
          {
            id: 'sample-1',
            invoiceId: 'INV17529234567ABC',
            serviceName: 'General Consultation',
            doctorAssigned: 'Dr. Rajesh Sharma',
            appointmentDate: '2025-07-25',
            appointmentTime: '10:00 AM',
            totalAmount: 500,
            status: 'confirmed',
            paymentStatus: 'paid',
            urgency: 'normal',
            createdAt: new Date(),
            patientInfo: {
              name: 'Test Patient',
              email: user.email || '',
              phone: '9876543210',
              symptoms: 'Regular checkup',
              notes: 'Sample booking for testing'
            }
          },
          {
            id: 'sample-2',
            invoiceId: 'INV17529234568DEF',
            serviceName: 'Blood Test Package',
            doctorAssigned: null,
            appointmentDate: '2025-07-30',
            appointmentTime: '9:00 AM',
            totalAmount: 800,
            status: 'pending',
            paymentStatus: 'paid',
            urgency: 'normal',
            createdAt: new Date(),
            patientInfo: {
              name: 'Test Patient',
              email: user.email || '',
              phone: '9876543210',
              symptoms: 'Routine blood work',
              notes: 'Sample booking for testing'
            }
          }
        ];
        setBookings(sampleBookings);
      } else {
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string, timeString: string) => {
    const appointmentDate = new Date(`${dateString} ${timeString}`);
    return appointmentDate > new Date();
  };

  const filterBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking => 
          isUpcoming(booking.appointmentDate, booking.appointmentTime) && 
          booking.status !== 'cancelled'
        );
      case 'past':
        return bookings.filter(booking => 
          !isUpcoming(booking.appointmentDate, booking.appointmentTime) || 
          booking.status === 'completed'
        );
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings();

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your appointments...</p>
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-healthcare-blue text-white p-3 rounded-full">
                <User className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your appointments and health records</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/user/bookings')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View All Bookings
              </Button>
              
              <Button
                onClick={() => router.push('/booking')}
                variant="outline"
                className="w-full"
              >
                <Heart className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
              
              <Button
                onClick={() => router.push('/services')}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Browse Services
              </Button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{userData?.displayName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{userData?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{userData?.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/settings')}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Appointments</h2>
              <Button onClick={() => router.push('/booking')}>
                Book New Appointment
              </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => isUpcoming(b.appointmentDate, b.appointmentTime) && b.status !== 'cancelled').length },
                  { key: 'past', label: 'Past', count: bookings.filter(b => !isUpcoming(b.appointmentDate, b.appointmentTime) || b.status === 'completed').length },
                  { key: 'all', label: 'All', count: bookings.length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-healthcare-blue text-healthcare-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            {/* Appointments List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming appointments." 
                    : "No appointments found for this category."}
                </p>
                <Button onClick={() => router.push('/booking')}>
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Heart className="w-5 h-5 text-healthcare-blue" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.serviceName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {booking.invoiceId && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                              {booking.invoiceId}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{booking.doctorAssigned ? `Dr. ${booking.doctorAssigned}` : 'Doctor to be assigned'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.appointmentTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>₹{booking.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(booking.status)}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // View booking details
                              console.log('View booking:', booking.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.paymentStatus === 'paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Download receipt
                                console.log('Download receipt:', booking.id);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.patientInfo?.symptoms && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Symptoms:</strong> {booking.patientInfo.symptoms}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
