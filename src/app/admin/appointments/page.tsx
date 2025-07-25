'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, AlertCircle, Trash2, Database, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  invoiceId: string;
  patientName: string;
  patientEmail: string;
  doctorAssigned?: string; // Doctor ID, not name
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  urgency: 'normal' | 'priority' | 'urgent';
  totalAmount: number;
  symptoms?: string;
  notes?: string;
  patientInfo?: any;
}

export default function AdminAppointments() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [doctors, setDoctors] = useState<{ [key: string]: string }>({});

  // Function to fetch doctors from users collection
  const fetchDoctors = async () => {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'))
      );
      
      const doctorsList: { [key: string]: string } = {};
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.role === 'doctor' && userData.doctorId) {
          doctorsList[userData.doctorId] = userData.displayName || userData.name || 'Unknown Doctor';
        }
      });
      
      setDoctors(doctorsList);
      console.log('Fetched doctors:', doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to static mapping if fetch fails
      setDoctors({
        'DOC001': 'Dr. Sarah Johnson',
        'DOC002': 'Dr. Michael Brown', 
        'DOC003': 'Dr. Emily Davis',
        'DOC004': 'Dr. James Wilson',
        'DOC005': 'Dr. Lisa Anderson'
      });
    }
  };

  const getDoctorName = (doctorId: string | undefined) => {
    if (!doctorId) return 'To be assigned';
    return doctors[doctorId] || doctorId;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorAssigned?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      console.log('User authenticated as admin, fetching appointments...');
      fetchAppointments();
      fetchDoctors(); // Fetch available doctors for assignment
    }
  }, [user, userData, loading, router]);
  const createTestData = async () => {
    try {
      console.log('Creating test appointment data...');
      
      const testAppointments = [
        {
          patientName: 'Rahul Sharma',
          patientEmail: 'rahul.sharma@email.com',
          serviceName: 'General Consultation',
          appointmentDate: new Date('2025-01-21'),
          appointmentTime: '10:00 AM',
          doctorAssigned: 'DOC001',
          status: 'confirmed',
          paymentStatus: 'paid',
          totalAmount: 500,
          symptoms: 'Regular checkup and health assessment',
          invoiceId: 'INV001',
          urgency: 'normal',
          patientInfo: {
            name: 'Rahul Sharma',
            email: 'rahul.sharma@email.com',
            phone: '+91 9876543210'
          }
        },
        {
          patientName: 'Priya Patel',
          patientEmail: 'priya.patel@email.com',
          serviceName: 'Blood Test Package',
          appointmentDate: new Date('2025-01-21'),
          appointmentTime: '11:30 AM',
          doctorAssigned: 'DOC001',
          status: 'pending',
          paymentStatus: 'paid',
          totalAmount: 1200,
          symptoms: 'Routine blood work for diabetes monitoring',
          invoiceId: 'INV002',
          urgency: 'normal',
          patientInfo: {
            name: 'Priya Patel',
            email: 'priya.patel@email.com',
            phone: '+91 9876543211'
          }
        },
        {
          patientName: 'Amit Singh',
          patientEmail: 'amit.singh@email.com',
          serviceName: 'Vaccination',
          appointmentDate: new Date('2025-01-22'),
          appointmentTime: '2:00 PM',
          doctorAssigned: 'DOC002',
          status: 'confirmed',
          paymentStatus: 'paid',
          totalAmount: 800,
          symptoms: 'Annual flu vaccination',
          invoiceId: 'INV003',
          urgency: 'normal',
          patientInfo: {
            name: 'Amit Singh',
            email: 'amit.singh@email.com',
            phone: '+91 9876543212'
          }
        }
      ];

      for (const appointment of testAppointments) {
        const docRef = await addDoc(collection(db, 'bookings'), {
          ...appointment,
          createdAt: new Date()
        });
        console.log(`Created appointment: ${docRef.id}`);
      }

      toast.success('Test appointment data created successfully!');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error creating test data:', error);
      toast.error('Error creating test data: ' + (error as Error).message);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingData(true);
      console.log('Fetching appointments from Firebase...');
      
      // Try to fetch from both bookings and appointments collections
      const [bookingsSnapshot, appointmentsSnapshot] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'appointments'))
      ]);

      console.log('Bookings found:', bookingsSnapshot.size);
      console.log('Appointments found:', appointmentsSnapshot.size);

      // Process bookings data
      const bookingsData = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', data);
        
        // Safe date conversion
        let appointmentDate = new Date();
        if (data.appointmentDate) {
          if (typeof data.appointmentDate.toDate === 'function') {
            appointmentDate = data.appointmentDate.toDate();
          } else if (data.appointmentDate instanceof Date) {
            appointmentDate = data.appointmentDate;
          } else if (typeof data.appointmentDate === 'string') {
            appointmentDate = new Date(data.appointmentDate);
          }
        } else if (data.date) {
          if (typeof data.date.toDate === 'function') {
            appointmentDate = data.date.toDate();
          } else if (data.date instanceof Date) {
            appointmentDate = data.date;
          } else if (typeof data.date === 'string') {
            appointmentDate = new Date(data.date);
          }
        } else if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            appointmentDate = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            appointmentDate = data.createdAt;
          } else if (typeof data.createdAt === 'string') {
            appointmentDate = new Date(data.createdAt);
          }
        }
        
        return {
          id: doc.id,
          invoiceId: data.invoiceId || `INV${doc.id.slice(-8)}`,
          patientName: data.patientInfo?.name || data.patientName || data.firstName + ' ' + data.lastName || 'Unknown Patient',
          patientEmail: data.patientInfo?.email || data.patientEmail || data.email || '',
          doctorAssigned: data.doctorId || data.doctorAssigned || '',
          serviceName: data.serviceName || data.service || '',
          appointmentDate: appointmentDate,
          appointmentTime: data.appointmentTime || data.time || '',
          status: data.status || 'pending',
          paymentStatus: data.paymentStatus || 'pending',
          urgency: data.urgency || 'normal',
          totalAmount: data.totalAmount || data.amount || 0,
          symptoms: data.symptoms || data.message || '',
          notes: data.notes || '',
          patientInfo: data.patientInfo || { phone: data.phone },
        };
      });

      // Process appointments data
      const appointmentsData = appointmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Appointment data:', data);
        
        // Safe date conversion
        let appointmentDate = new Date();
        if (data.appointmentDate) {
          if (typeof data.appointmentDate.toDate === 'function') {
            appointmentDate = data.appointmentDate.toDate();
          } else if (data.appointmentDate instanceof Date) {
            appointmentDate = data.appointmentDate;
          } else if (typeof data.appointmentDate === 'string') {
            appointmentDate = new Date(data.appointmentDate);
          }
        } else if (data.date) {
          if (typeof data.date.toDate === 'function') {
            appointmentDate = data.date.toDate();
          } else if (data.date instanceof Date) {
            appointmentDate = data.date;
          } else if (typeof data.date === 'string') {
            appointmentDate = new Date(data.date);
          }
        } else if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            appointmentDate = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            appointmentDate = data.createdAt;
          } else if (typeof data.createdAt === 'string') {
            appointmentDate = new Date(data.createdAt);
          }
        }
        
        return {
          id: doc.id,
          invoiceId: data.invoiceId || `APP${doc.id.slice(-8)}`,
          patientName: data.patientName || data.firstName + ' ' + data.lastName || 'Unknown Patient',
          patientEmail: data.patientEmail || data.email || '',
          doctorAssigned: data.doctorId || data.doctorAssigned || '',
          serviceName: data.serviceName || data.service || '',
          appointmentDate: appointmentDate,
          appointmentTime: data.appointmentTime || data.time || '',
          status: data.status || 'pending',
          paymentStatus: data.paymentStatus || 'pending',
          urgency: data.urgency || 'normal',
          totalAmount: data.totalAmount || data.amount || 0,
          symptoms: data.symptoms || data.message || '',
          notes: data.notes || '',
          patientInfo: data.patientInfo || { phone: data.phone },
        };
      });

      // Combine both datasets
      const allAppointments = [...bookingsData, ...appointmentsData];
      
      // Sort by date (newest first)
      allAppointments.sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime());

      console.log('Total appointments processed:', allAppointments.length);
      setAppointments(allAppointments);
      
      if (allAppointments.length > 0) {
        toast.success(`Loaded ${allAppointments.length} appointments successfully`);
      } else {
        console.log('No appointments found. Create some test data first.');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('permission')) {
        toast.error('Permission denied - check Firebase rules');
      } else if (errorMessage.includes('index')) {
        toast.error('Firebase index error - check console for details');
      } else {
        toast.error('Error loading appointments: ' + errorMessage);
      }
      
      // Don't use fallback data - keep empty to show the real issue
      setAppointments([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // Try updating in both collections to ensure consistency
      const updatePromises = [];
      
      // Update in bookings collection
      updatePromises.push(
        updateDoc(doc(db, 'bookings', appointmentId), { 
          status: newStatus,
          updatedAt: new Date()
        }).catch(() => null) // Ignore if not found in bookings
      );
      
      // Update in appointments collection  
      updatePromises.push(
        updateDoc(doc(db, 'appointments', appointmentId), { 
          status: newStatus,
          updatedAt: new Date()
        }).catch(() => null) // Ignore if not found in appointments
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
      ));
      toast.success('Appointment status updated successfully');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error updating appointment status');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        // Try deleting from both collections
        const deletePromises = [];
        
        deletePromises.push(
          deleteDoc(doc(db, 'bookings', appointmentId)).catch(() => null)
        );
        
        deletePromises.push(
          deleteDoc(doc(db, 'appointments', appointmentId)).catch(() => null)
        );
        
        await Promise.all(deletePromises);
        
        setAppointments(appointments.filter(apt => apt.id !== appointmentId));
        toast.success('Appointment deleted successfully');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Error deleting appointment');
      }
    }
  };

  const handleAssignDoctor = async (appointmentId: string, doctorId: string) => {
    try {
      // Try updating in both collections to ensure consistency
      const updatePromises = [];
      
      // Update in bookings collection
      updatePromises.push(
        updateDoc(doc(db, 'bookings', appointmentId), { 
          doctorAssigned: doctorId,
          doctorId: doctorId,
          status: 'confirmed',
          updatedAt: new Date()
        }).catch(() => null) // Ignore if not found in bookings
      );
      
      // Update in appointments collection  
      updatePromises.push(
        updateDoc(doc(db, 'appointments', appointmentId), { 
          doctorAssigned: doctorId,
          doctorId: doctorId,
          status: 'confirmed',
          updatedAt: new Date()
        }).catch(() => null) // Ignore if not found in appointments
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, doctorAssigned: doctorId, status: 'confirmed' } : apt
      ));
      
      toast.success(`Doctor ${doctors[doctorId] || doctorId} assigned successfully`);
      setShowAssignModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error assigning doctor:', error);
      toast.error('Error assigning doctor');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'no-show': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(apt => apt.appointmentDate.toDateString() === today);
  };

  const getCompletedToday = () => {
    const today = new Date().toDateString();
    return appointments.filter(apt => apt.appointmentDate.toDateString() === today && apt.status === 'completed');
  };

  const getPendingAppointments = () => {
    return appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed');
  };

  if (loading || loadingData) {
    return (
      <AdminLayout title="Appointments Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading appointments...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Appointments Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
            <p className="text-gray-600">Manage patient appointments and bookings</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createTestData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Create Test Data
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{getTodayAppointments().length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">{getCompletedToday().length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{getPendingAppointments().length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getDoctorName(appointment.doctorAssigned)}
                      </div>
                      {appointment.doctorAssigned && (
                        <div className="text-xs text-gray-500">ID: {appointment.doctorAssigned}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.serviceName}</div>
                      {appointment.urgency !== 'normal' && (
                        <div className="text-xs text-orange-600 font-medium">
                          {appointment.urgency.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.appointmentDate.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}</span>
                      </span>
                      <div className={`text-xs mt-1 ${appointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        Payment: {appointment.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">₹{appointment.totalAmount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 font-mono">{appointment.invoiceId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleUpdateStatus(appointment.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          title={`Change status for appointment ${appointment.invoiceId}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No Show</option>
                        </select>
                        <button 
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAssignModal(true);
                          }}
                          title="Assign Doctor"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          title="Delete appointment"
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

        {/* Assign Doctor Modal */}
        {showAssignModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Doctor</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Patient: <span className="font-medium">{selectedAppointment.patientName}</span></p>
                <p className="text-sm text-gray-600">Service: <span className="font-medium">{selectedAppointment.serviceName}</span></p>
                <p className="text-sm text-gray-600">Date: <span className="font-medium">{selectedAppointment.appointmentDate.toLocaleDateString()}</span></p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Select Doctor:</p>
                {Object.entries(doctors).map(([doctorId, doctorName]) => (
                  <button
                    key={doctorId}
                    onClick={() => handleAssignDoctor(selectedAppointment.id, doctorId)}
                    className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{doctorName}</div>
                    <div className="text-xs text-gray-500">ID: {doctorId}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
