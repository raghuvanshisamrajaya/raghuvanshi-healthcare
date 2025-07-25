'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  FileText,
  Eye
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Patient {
  id: string;
  patientName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  appointmentDate?: string;
  service?: string;
  status?: string;
  lastVisit?: string;
  totalAppointments?: number;
}

export default function DoctorPatientsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
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
      loadPatients();
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const doctorId = getDoctorId();
      if (!doctorId) return;

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('doctorId', '==', doctorId)
      );
      
      const bookingsDocs = await getDocs(bookingsQuery);
      const patientsMap = new Map<string, Patient>();
      
      bookingsDocs.docs.forEach(doc => {
        const data = doc.data();
        const patientKey = data.email || data.phone || `${data.firstName}_${data.lastName}`;
        
        if (patientsMap.has(patientKey)) {
          const existingPatient = patientsMap.get(patientKey)!;
          existingPatient.totalAppointments = (existingPatient.totalAppointments || 1) + 1;
          
          // Update last visit if this appointment is more recent
          if (data.appointmentDate && data.appointmentDate > (existingPatient.lastVisit || '')) {
            existingPatient.lastVisit = data.appointmentDate;
          }
        } else {
          patientsMap.set(patientKey, {
            id: doc.id,
            patientName: data.patientName,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            service: data.service,
            status: data.status,
            lastVisit: data.appointmentDate,
            totalAppointments: 1
          });
        }
      });

      const patientsArray = Array.from(patientsMap.values());
      
      // Sort by last visit date (most recent first)
      patientsArray.sort((a, b) => {
        const dateA = new Date(a.lastVisit || '');
        const dateB = new Date(b.lastVisit || '');
        return dateB.getTime() - dateA.getTime();
      });

      setPatients(patientsArray);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = patients.filter(patient => 
      (patient.patientName?.toLowerCase().includes(search)) ||
      (patient.firstName?.toLowerCase().includes(search)) ||
      (patient.lastName?.toLowerCase().includes(search)) ||
      (patient.phone?.includes(search)) ||
      (patient.email?.toLowerCase().includes(search)) ||
      (patient.service?.toLowerCase().includes(search))
    );

    setFilteredPatients(filtered);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not available';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
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
            <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
            <p className="text-gray-600 mt-2">
              Manage your patient information and history
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search patients by name, phone, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-healthcare-blue/10 rounded-full p-3">
                        <Users className="h-6 w-6 text-healthcare-blue" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.patientName || 
                           `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 
                           'Unknown Patient'}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          patient.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : patient.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="p-2 text-healthcare-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="View patient details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {patient.phone}
                      </div>
                    )}
                    
                    {patient.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {patient.email}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Last visit: {formatDate(patient.lastVisit)}
                    </div>

                    {patient.service && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        {patient.service}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Appointments:</span>
                        <span className="font-medium text-gray-900">
                          {patient.totalAppointments || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-healthcare-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        View History
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-healthcare-blue rounded-lg hover:bg-blue-700 transition-colors">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No patients found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? 
                      'No patients match your search criteria.' :
                      'No patients have been assigned to you yet.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
