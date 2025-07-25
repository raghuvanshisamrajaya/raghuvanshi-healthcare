'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, 
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  patientName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  appointmentTime?: string;
  appointmentDate?: string;
  service?: string;
  serviceId?: string;
  doctorAssigned?: string;
  doctorId?: string;
  status?: string;
  createdAt?: any;
  date?: any;
  time?: string;
}

export default function DoctorAppointmentsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get doctor ID based on user data
  const getDoctorId = () => {
    if (!userData) return null;
    
    if (userData.doctorId) return userData.doctorId;
    
    const email = userData.email || '';
    const doctorMapping: { [key: string]: string } = {
      'dr.sharma@raghuvanshi.com': 'DOC001',
      'dr.patel@raghuvanshi.com': 'DOC002',
      'dr.singh@raghuvanshi.com': 'DOC003',
      'dr.gupta@raghuvanshi.com': 'DOC004',
      'dr.kumar@raghuvanshi.com': 'DOC005'
    };
    
    return doctorMapping[email] || 'DOC001';
  };

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'doctor')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'doctor') {
      loadAppointments();
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchTerm]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const doctorId = getDoctorId();
      if (!doctorId) return;

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('doctorId', '==', doctorId)
      );
      
      const bookingsDocs = await getDocs(bookingsQuery);
      const appointmentsData: Appointment[] = [];
      
      bookingsDocs.docs.forEach(doc => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          ...data
        } as Appointment);
      });

      // Sort by date and time
      appointmentsData.sort((a, b) => {
        const dateA = new Date(a.appointmentDate || '');
        const dateB = new Date(b.appointmentDate || '');
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        (apt.patientName?.toLowerCase().includes(search)) ||
        (apt.firstName?.toLowerCase().includes(search)) ||
        (apt.lastName?.toLowerCase().includes(search)) ||
        (apt.phone?.includes(search)) ||
        (apt.email?.toLowerCase().includes(search)) ||
        (apt.service?.toLowerCase().includes(search))
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', appointmentId), {
        status: newStatus
      });
      
      toast.success(`Appointment ${newStatus}`);
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-blue"></div>
      </div>
    );
  }

  if (!user || userData?.role !== 'doctor') {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">
              Manage all your patient appointments
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search patients, phone, email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-blue focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  title="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Appointments ({filteredAppointments.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-healthcare-blue/10 rounded-full p-3">
                          <User className="h-6 w-6 text-healthcare-blue" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientName || 
                             `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim() || 
                             'Unknown Patient'}
                          </h3>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {appointment.appointmentDate || 'Date TBD'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {appointment.appointmentTime || appointment.time || 'Time TBD'}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            {appointment.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {appointment.phone}
                              </div>
                            )}
                            {appointment.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {appointment.email}
                              </div>
                            )}
                          </div>

                          {appointment.service && (
                            <p className="text-sm text-gray-600 mt-1">
                              Service: {appointment.service}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status || 'pending'}
                        </span>

                        <div className="flex gap-2">
                          {appointment.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as completed"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          
                          {appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel appointment"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}

                          <button 
                            className="p-2 text-healthcare-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No appointments found
                  </h3>
                  <p className="text-gray-600">
                    {statusFilter !== 'all' || searchTerm ? 
                      'No appointments match your current filters.' :
                      'No appointments have been assigned to you yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
