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
  Search,
  AlertCircle
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
  appointmentDate?: string | Date;
  service?: string;
  serviceId?: string;
  doctorAssigned?: string;
  doctorId?: string;
  status?: string;
  createdAt?: any;
  date?: any;
  time?: string;
  symptoms?: string;
  notes?: string;
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
      if (!doctorId) {
        console.log('No doctor ID found');
        toast.error('Doctor ID not found. Please contact admin.');
        return;
      }

      console.log('Loading appointments for doctor:', doctorId);

      // Query appointments assigned to this doctor from both collections
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('doctorAssigned', '==', doctorId)
      );
      
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorAssigned', '==', doctorId)
      );

      // Also query by doctorId field as backup
      const bookingsQueryAlt = query(
        collection(db, 'bookings'),
        where('doctorId', '==', doctorId)
      );
      
      const appointmentsQueryAlt = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId)
      );

      const [bookingsSnapshot, appointmentsSnapshot, bookingsAltSnapshot, appointmentsAltSnapshot] = await Promise.all([
        getDocs(bookingsQuery).catch(() => ({ docs: [] })),
        getDocs(appointmentsQuery).catch(() => ({ docs: [] })),
        getDocs(bookingsQueryAlt).catch(() => ({ docs: [] })),
        getDocs(appointmentsQueryAlt).catch(() => ({ docs: [] }))
      ]);

      // Combine all results and remove duplicates
      const allAppointments = new Map();

      // Process bookings
      [...bookingsSnapshot.docs, ...bookingsAltSnapshot.docs].forEach(doc => {
        const data = doc.data();
        if (!allAppointments.has(doc.id)) {
          allAppointments.set(doc.id, {
            id: doc.id,
            patientName: data.patientInfo?.name || data.patientName || (data.firstName + ' ' + data.lastName) || 'Unknown Patient',
            firstName: data.firstName || data.patientInfo?.firstName || '',
            lastName: data.lastName || data.patientInfo?.lastName || '',
            phone: data.phone || data.patientInfo?.phone || '',
            email: data.email || data.patientInfo?.email || '',
            appointmentTime: data.appointmentTime || data.time || '',
            appointmentDate: data.appointmentDate || data.date || data.createdAt,
            service: data.serviceName || data.service || '',
            serviceId: data.serviceId || '',
            doctorAssigned: data.doctorAssigned || data.doctorId,
            doctorId: data.doctorId || data.doctorAssigned,
            status: data.status || 'pending',
            createdAt: data.createdAt,
            symptoms: data.symptoms || '',
            notes: data.notes || ''
          });
        }
      });

      // Process appointments
      [...appointmentsSnapshot.docs, ...appointmentsAltSnapshot.docs].forEach(doc => {
        const data = doc.data();
        if (!allAppointments.has(doc.id)) {
          allAppointments.set(doc.id, {
            id: doc.id,
            patientName: data.patientName || (data.firstName + ' ' + data.lastName) || 'Unknown Patient',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            email: data.email || '',
            appointmentTime: data.appointmentTime || data.time || '',
            appointmentDate: data.appointmentDate || data.date || data.createdAt,
            service: data.serviceName || data.service || '',
            serviceId: data.serviceId || '',
            doctorAssigned: data.doctorAssigned || data.doctorId,
            doctorId: data.doctorId || data.doctorAssigned,
            status: data.status || 'pending',
            createdAt: data.createdAt,
            symptoms: data.symptoms || '',
            notes: data.notes || ''
          });
        }
      });

      const appointmentsList = Array.from(allAppointments.values());
      console.log(`Found ${appointmentsList.length} appointments for doctor ${doctorId}`);
      
      // Sort by date (newest first)
      appointmentsList.sort((a, b) => {
        const dateA = a.appointmentDate?.toDate ? a.appointmentDate.toDate() : new Date(a.appointmentDate || a.createdAt);
        const dateB = b.appointmentDate?.toDate ? b.appointmentDate.toDate() : new Date(b.appointmentDate || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAppointments(appointmentsList);

      if (appointmentsList.length > 0) {
        toast.success(`Loaded ${appointmentsList.length} appointments`);
      } else {
        toast.success('No appointments assigned to you yet');
      }

    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.phone?.includes(searchTerm) ||
        apt.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // Update in both collections to ensure consistency
      const updatePromises = [];
      
      updatePromises.push(
        updateDoc(doc(db, 'bookings', appointmentId), { 
          status: newStatus,
          updatedAt: new Date()
        }).catch(() => null)
      );
      
      updatePromises.push(
        updateDoc(doc(db, 'appointments', appointmentId), { 
          status: newStatus,
          updatedAt: new Date()
        }).catch(() => null)
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
      
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error updating appointment');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Date not set';
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading appointments...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || userData?.role !== 'doctor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Manage your assigned appointments</p>
          <p className="text-sm text-gray-500">Doctor ID: {getDoctorId()}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search patients, services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
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
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {appointment.email || 'No email'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {appointment.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.service}</div>
                        {appointment.symptoms && (
                          <div className="text-sm text-gray-500">
                            Symptoms: {appointment.symptoms}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {appointment.appointmentTime || 'Time not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status || 'pending')}`}>
                          {appointment.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {appointment.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as completed"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel appointment"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}
                          <select
                            value={appointment.status || 'pending'}
                            onChange={(e) => handleUpdateStatus(appointment.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            title="Change appointment status"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {appointments.length === 0 ? 'No appointments assigned' : 'No appointments match your filters'}
              </h3>
              <p className="mt-2 text-gray-600">
                {appointments.length === 0 
                  ? "You don't have any appointments assigned yet."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        {appointments.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                <div className="text-sm text-gray-600">Total Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {appointments.filter(apt => apt.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
