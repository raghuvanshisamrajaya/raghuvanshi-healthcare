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
  User
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Appointment {
  id: string;
  patientName?: string;
  firstName?: string;
  lastName?: string;
  appointmentTime?: string;
  appointmentDate?: string;
  service?: string;
  status?: string;
}

export default function DoctorSchedulePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  }, [user, userData, loading, router, currentDate]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const doctorId = getDoctorId();
      if (!doctorId) return;

      // Get appointments for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('doctorId', '==', doctorId)
      );
      
      const bookingsDocs = await getDocs(bookingsQuery);
      const appointmentsData: Appointment[] = [];
      
      bookingsDocs.docs.forEach(doc => {
        const data = doc.data();
        const appointmentDate = new Date(data.appointmentDate);
        
        // Filter appointments for current month
        if (appointmentDate >= startOfMonth && appointmentDate <= endOfMonth) {
          appointmentsData.push({
            id: doc.id,
            ...data
          } as Appointment);
        }
      });

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointmentDate === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time) return 'Time TBD';
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return time;
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

  const days = getDaysInMonth(currentDate);
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-2">
              View and manage your appointment schedule
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Next month"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="aspect-square p-2"></div>;
                    }

                    const dayAppointments = getAppointmentsForDate(day);
                    const isSelected = selectedDate.toDateString() === day.toDateString();
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square p-2 text-sm border rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-healthcare-blue text-white border-healthcare-blue' 
                            : isToday
                            ? 'bg-blue-50 border-healthcare-blue text-healthcare-blue'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{day.getDate()}</span>
                          {dayAppointments.length > 0 && (
                            <div className={`w-2 h-2 rounded-full mt-1 ${
                              isSelected ? 'bg-white' : 'bg-healthcare-blue'
                            }`}></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Date Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h3>
                <button 
                  className="p-2 text-healthcare-blue hover:bg-blue-50 rounded-lg transition-colors"
                  title="Add appointment"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateAppointments.length > 0 ? (
                  selectedDateAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-healthcare-blue/10 rounded-full p-2">
                          <User className="h-4 w-4 text-healthcare-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {appointment.patientName || 
                             `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim() || 
                             'Unknown Patient'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {appointment.service || 'General Consultation'}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.appointmentTime || '')}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                            appointment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
