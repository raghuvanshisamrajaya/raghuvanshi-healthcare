'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Filter
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  patientName?: string;
  service?: string;
  appointmentTime?: string;
  appointmentDate?: Date;
  status?: string;
  phone?: string;
  email?: string;
}

export default function DoctorSchedulePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
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
      loadSchedule();
    }
  }, [user, userData, loading, router, currentDate]);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const doctorId = getDoctorId();
      if (!doctorId) {
        console.log('No doctor ID found');
        toast.error('Doctor ID not found. Please contact admin.');
        return;
      }

      console.log('Loading schedule for doctor:', doctorId);

      // Query appointments assigned to this doctor
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
          let appointmentDate;
          if (data.appointmentDate?.toDate) {
            appointmentDate = data.appointmentDate.toDate();
          } else if (data.appointmentDate instanceof Date) {
            appointmentDate = data.appointmentDate;
          } else if (data.date?.toDate) {
            appointmentDate = data.date.toDate();
          } else if (data.date instanceof Date) {
            appointmentDate = data.date;
          } else {
            appointmentDate = new Date(data.appointmentDate || data.date || data.createdAt);
          }

          allAppointments.set(doc.id, {
            id: doc.id,
            patientName: data.patientInfo?.name || data.patientName || (data.firstName + ' ' + data.lastName) || 'Unknown Patient',
            service: data.serviceName || data.service || '',
            appointmentTime: data.appointmentTime || data.time || '',
            appointmentDate: appointmentDate,
            status: data.status || 'pending',
            phone: data.phone || data.patientInfo?.phone || '',
            email: data.email || data.patientInfo?.email || ''
          });
        }
      });

      // Process appointments
      [...appointmentsSnapshot.docs, ...appointmentsAltSnapshot.docs].forEach(doc => {
        const data = doc.data();
        if (!allAppointments.has(doc.id)) {
          let appointmentDate;
          if (data.appointmentDate?.toDate) {
            appointmentDate = data.appointmentDate.toDate();
          } else if (data.appointmentDate instanceof Date) {
            appointmentDate = data.appointmentDate;
          } else if (data.date?.toDate) {
            appointmentDate = data.date.toDate();
          } else if (data.date instanceof Date) {
            appointmentDate = data.date;
          } else {
            appointmentDate = new Date(data.appointmentDate || data.date || data.createdAt);
          }

          allAppointments.set(doc.id, {
            id: doc.id,
            patientName: data.patientName || (data.firstName + ' ' + data.lastName) || 'Unknown Patient',
            service: data.serviceName || data.service || '',
            appointmentTime: data.appointmentTime || data.time || '',
            appointmentDate: appointmentDate,
            status: data.status || 'pending',
            phone: data.phone || '',
            email: data.email || ''
          });
        }
      });

      const appointmentsList = Array.from(allAppointments.values());
      console.log(`Found ${appointmentsList.length} appointments for doctor ${doctorId}`);
      
      setAppointments(appointmentsList);

      if (appointmentsList.length > 0) {
        toast.success(`Loaded ${appointmentsList.length} appointments`);
      } else {
        toast.success('No appointments in schedule yet');
      }

    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Error loading schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      const aptDate = apt.appointmentDate;
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time not set';
    
    // If it's already in 12-hour format, return as is
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
      return timeString;
    }
    
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading schedule...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600">View and manage your appointment schedule</p>
          <p className="text-sm text-gray-500">Doctor ID: {getDoctorId()}</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={`Previous ${viewMode}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-0">
                {formatDateHeader()}
              </h2>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={`Next ${viewMode}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                title="Change view mode"
              >
                <option value="day">Day View</option>
                <option value="week">Week View</option>
                <option value="month">Month View</option>
              </select>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Content */}
        <div className="bg-white rounded-lg shadow">
          {viewMode === 'day' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-4">
                {getAppointmentsForDate(currentDate).length > 0 ? (
                  getAppointmentsForDate(currentDate)
                    .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''))
                    .map((appointment) => (
                      <div key={appointment.id} className={`p-4 border rounded-lg ${getStatusColor(appointment.status || 'pending')}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            <div>
                              <div className="font-medium">{formatTime(appointment.appointmentTime || '')}</div>
                              <div className="text-sm">{appointment.patientName}</div>
                              <div className="text-sm text-gray-600">{appointment.service}</div>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No appointments scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {getWeekDays(currentDate).map((day, index) => (
                  <div key={index} className="min-h-32">
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg ${day.toDateString() === new Date().toDateString() ? 'bg-blue-100 text-blue-900 rounded-full w-8 h-8 mx-auto flex items-center justify-center' : ''}`}>
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {getAppointmentsForDate(day).slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className={`p-2 text-xs rounded border ${getStatusColor(appointment.status || 'pending')}`}>
                          <div className="font-medium truncate">{formatTime(appointment.appointmentTime || '')}</div>
                          <div className="truncate">{appointment.patientName}</div>
                        </div>
                      ))}
                      {getAppointmentsForDate(day).length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{getAppointmentsForDate(day).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </h3>
              </div>
              
              {/* Month view summary */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {appointments.filter(apt => {
                        const aptDate = apt.appointmentDate;
                        return aptDate && aptDate.getMonth() === currentDate.getMonth() && aptDate.getFullYear() === currentDate.getFullYear();
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Total Appointments</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {appointments.filter(apt => {
                        const aptDate = apt.appointmentDate;
                        return aptDate && aptDate.getMonth() === currentDate.getMonth() && 
                               aptDate.getFullYear() === currentDate.getFullYear() && 
                               apt.status === 'completed';
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {appointments.filter(apt => {
                        const aptDate = apt.appointmentDate;
                        return aptDate && aptDate.getMonth() === currentDate.getMonth() && 
                               aptDate.getFullYear() === currentDate.getFullYear() && 
                               (apt.status === 'pending' || apt.status === 'confirmed');
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                </div>

                {/* Upcoming appointments in the month */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Upcoming Appointments This Month</h4>
                  <div className="space-y-2">
                    {appointments
                      .filter(apt => {
                        const aptDate = apt.appointmentDate;
                        return aptDate && aptDate.getMonth() === currentDate.getMonth() && 
                               aptDate.getFullYear() === currentDate.getFullYear() &&
                               (apt.status === 'pending' || apt.status === 'confirmed') &&
                               aptDate >= new Date();
                      })
                      .sort((a, b) => (a.appointmentDate?.getTime() || 0) - (b.appointmentDate?.getTime() || 0))
                      .slice(0, 5)
                      .map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="font-medium">{appointment.patientName}</div>
                              <div className="text-sm text-gray-600">{appointment.service}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {appointment.appointmentDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTime(appointment.appointmentTime || '')}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Summary</h3>
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
              <div className="text-2xl font-bold text-purple-600">
                {new Set(appointments.map(apt => apt.patientName)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Patients</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
