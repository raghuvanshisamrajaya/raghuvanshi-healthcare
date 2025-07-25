'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  TrendingUp,
  Bell,
  Clock,
  User,
  FileText,
  Activity,
  Eye,
  CheckCircle
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
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
}

export default function DoctorPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    completedToday: 0,
    pendingReviews: 0
  });

  // Get doctor ID based on user data
  const getDoctorId = () => {
    if (!userData) return null;
    
    // Check if user has a specific doctor ID field
    if (userData.doctorId) return userData.doctorId;
    
    // Create doctor ID from email or display name
    const email = userData.email || '';
    const name = userData.displayName || userData.firstName || '';
    
    // Map common doctor emails/names to IDs (in production, this would be in Firebase)
    const doctorMapping: { [key: string]: string } = {
      'dr.sharma@raghuvanshi.com': 'DOC001',
      'dr.patel@raghuvanshi.com': 'DOC002',
      'dr.singh@raghuvanshi.com': 'DOC003',
      'dr.gupta@raghuvanshi.com': 'DOC004',
      'dr.kumar@raghuvanshi.com': 'DOC005'
    };
    
    return doctorMapping[email] || 'DOC001'; // Default to DOC001
  };

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'doctor')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'doctor') {
      loadDoctorData();
    }
  }, [user, userData, loading, router]);

  const loadDoctorData = async () => {
    try {
      setIsLoading(true);
      const doctorId = getDoctorId();
      if (!doctorId) {
        console.log('No doctor ID found');
        toast.error('Doctor ID not found. Please contact admin.');
        return;
      }

      console.log('Loading data for doctor:', doctorId);

      // Get today's date
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

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
            createdAt: data.createdAt
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
            createdAt: data.createdAt
          });
        }
      });

      const appointmentsList = Array.from(allAppointments.values());
      console.log(`Found ${appointmentsList.length} appointments for doctor ${doctorId}`);
      
      setAppointments(appointmentsList);

      // Calculate stats
      const todayAppointments = appointmentsList.filter(apt => {
        let aptDate;
        if (apt.appointmentDate?.toDate) {
          aptDate = apt.appointmentDate.toDate();
        } else if (apt.appointmentDate instanceof Date) {
          aptDate = apt.appointmentDate;
        } else if (apt.date?.toDate) {
          aptDate = apt.date.toDate();
        } else if (apt.date instanceof Date) {
          aptDate = apt.date;
        } else {
          aptDate = new Date(apt.appointmentDate || apt.date || apt.createdAt);
        }
        
        return aptDate >= todayStart && aptDate < todayEnd;
      });

      const completedToday = todayAppointments.filter(apt => apt.status === 'completed');
      const pendingReviews = appointmentsList.filter(apt => apt.status === 'completed');

      setStats({
        todayAppointments: todayAppointments.length,
        totalPatients: new Set(appointmentsList.map(apt => apt.patientName)).size,
        completedToday: completedToday.length,
        pendingReviews: pendingReviews.length
      });

      if (appointmentsList.length > 0) {
        toast.success(`Loaded ${appointmentsList.length} appointments`);
      } else {
        toast.success('No appointments assigned to you yet');
      }

    } catch (error) {
      console.error('Error loading doctor data:', error);
      toast.error('Error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async (appointmentId: string) => {
    try {
      // Update in both collections to ensure consistency
      const updatePromises = [];
      
      updatePromises.push(
        updateDoc(doc(db, 'bookings', appointmentId), { 
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        }).catch(() => null)
      );
      
      updatePromises.push(
        updateDoc(doc(db, 'appointments', appointmentId), { 
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        }).catch(() => null)
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'completed' } : apt
      ));
      
      toast.success('Appointment marked as completed');
      loadDoctorData(); // Refresh data
    } catch (error) {
      console.error('Error marking appointment complete:', error);
      toast.error('Error updating appointment');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading doctor dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome, Dr. {userData?.displayName || userData?.firstName || 'Doctor'}</p>
          <p className="text-sm text-gray-500">Doctor ID: {getDoctorId()}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/doctor/appointments')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">View All Appointments</h3>
                <p className="text-gray-600">Manage your appointment schedule</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/doctor/patients')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
                <p className="text-gray-600">Access patient information</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/doctor/schedule')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Management</h3>
                <p className="text-gray-600">Manage your availability</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
          </div>
          <div className="p-6">
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.appointmentTime || 'Time not set'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                      {appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkComplete(appointment.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments assigned</h3>
                <p className="mt-2 text-gray-600">You don't have any appointments assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
