'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Search,
  Eye
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  patientName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  lastVisit?: Date;
  totalAppointments?: number;
  status?: string;
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
      if (!doctorId) {
        console.log('No doctor ID found');
        toast.error('Doctor ID not found. Please contact admin.');
        return;
      }

      console.log('Loading patients for doctor:', doctorId);

      // Query appointments assigned to this doctor to get patients
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

      // Combine all appointments to extract unique patients
      const allAppointments = [...bookingsSnapshot.docs, ...appointmentsSnapshot.docs, ...bookingsAltSnapshot.docs, ...appointmentsAltSnapshot.docs];
      
      // Group appointments by patient
      const patientsMap = new Map<string, Patient>();

      allAppointments.forEach(doc => {
        const data = doc.data();
        const patientKey = data.patientInfo?.email || data.patientEmail || data.email || 
                          data.patientInfo?.name || data.patientName || 
                          (data.firstName + ' ' + data.lastName) || 'unknown';
        
        if (patientKey && patientKey !== 'unknown') {
          const existingPatient = patientsMap.get(patientKey);
          const appointmentDate = data.appointmentDate?.toDate ? data.appointmentDate.toDate() : new Date(data.appointmentDate || data.createdAt);
          
          if (existingPatient) {
            // Update existing patient
            existingPatient.totalAppointments = (existingPatient.totalAppointments || 0) + 1;
            if (!existingPatient.lastVisit || appointmentDate > existingPatient.lastVisit) {
              existingPatient.lastVisit = appointmentDate;
            }
          } else {
            // Add new patient
            patientsMap.set(patientKey, {
              id: patientKey,
              patientName: data.patientInfo?.name || data.patientName || (data.firstName + ' ' + data.lastName) || 'Unknown Patient',
              firstName: data.firstName || data.patientInfo?.firstName || '',
              lastName: data.lastName || data.patientInfo?.lastName || '',
              phone: data.phone || data.patientInfo?.phone || '',
              email: data.email || data.patientInfo?.email || '',
              lastVisit: appointmentDate,
              totalAppointments: 1,
              status: data.status || 'active'
            });
          }
        }
      });

      const patientsList = Array.from(patientsMap.values());
      console.log(`Found ${patientsList.length} unique patients for doctor ${doctorId}`);
      
      // Sort by last visit (most recent first)
      patientsList.sort((a, b) => {
        const dateA = a.lastVisit || new Date(0);
        const dateB = b.lastVisit || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setPatients(patientsList);

      if (patientsList.length > 0) {
        toast.success(`Loaded ${patientsList.length} patients`);
      } else {
        toast.success('No patients found yet');
      }

    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Error loading patients');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'No visits yet';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading patients...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600">View and manage your patient records</p>
          <p className="text-sm text-gray-500">Doctor ID: {getDoctorId()}</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow">
          {filteredPatients.length > 0 ? (
            <div className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Patient Records ({filteredPatients.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {patient.patientName}
                            </h3>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {patient.email || 'No email'}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {patient.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.totalAppointments} appointment{(patient.totalAppointments || 0) !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Last visit: {formatDate(patient.lastVisit)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Navigate to patient details (implement later)
                            toast.success('Patient details feature coming soon');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View patient details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {patients.length === 0 ? 'No patients found' : 'No patients match your search'}
              </h3>
              <p className="mt-2 text-gray-600">
                {patients.length === 0 
                  ? "You don't have any patients assigned yet."
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        {patients.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {patients.reduce((sum, patient) => sum + (patient.totalAppointments || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {patients.filter(patient => {
                    const lastVisit = patient.lastVisit;
                    if (!lastVisit) return false;
                    const daysSinceLastVisit = Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
                    return daysSinceLastVisit <= 30;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Recent Patients (30 days)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
