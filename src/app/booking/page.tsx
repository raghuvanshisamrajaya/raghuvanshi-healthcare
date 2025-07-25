'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Heart,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validateEmail, validatePhone, validateName } from '@/utils/validation';
import { useRazorpay } from '@/hooks/useRazorpay';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  image?: string;
  available_slots: string[];
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    address: '',
    symptoms: '',
    emergencyContact: '',
    notes: '',
    preferredDoctor: '',
    urgency: 'normal'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Service, 2: Choose Date/Time, 3: Patient Info

  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchServices();
    
    // Pre-fill form with user data if available
    if (userData) {
      setFormData(prev => ({
        ...prev,
        patientName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        phone: userData.phoneNumber || ''
      }));
    }
  }, [userData]);

  const fetchServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`);
      if (hour < 17) slots.push(`${hour}:30`);
    }
    return slots;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }
    setStep(3);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book an appointment');
      router.push('/login');
      return;
    }

    if (!formData.patientName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate name
    const nameValidation = validateName(formData.patientName);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.message);
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.message);
      return;
    }

    if (!formData.symptoms) {
      toast.error('Please describe your symptoms or reason for visit');
      return;
    }

    setIsLoading(true);

    try {
      // Generate unique invoice ID
      const invoiceId = `INV${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const bookingData = {
        userId: user.uid,
        invoiceId: invoiceId,
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        doctorAssigned: null, // Will be assigned by admin later
        preferredDoctor: formData.preferredDoctor || null,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        urgency: formData.urgency,
        symptoms: formData.symptoms,
        notes: formData.notes,
        patientInfo: formData,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: selectedService?.price || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      toast.success('Appointment booked successfully!');
      
      // Redirect to payment page with booking ID and invoice ID
      router.push(`/payment?bookingId=${docRef.id}&amount=${selectedService?.price || 0}&invoiceId=${invoiceId}`);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-healthcare-blue text-white p-3 rounded-full">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="mt-2 text-gray-600">Schedule your healthcare consultation</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-healthcare-blue text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-healthcare-blue' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-md mx-auto">
              <span>Select Service</span>
              <span>Date & Time</span>
              <span>Patient Details</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Select a Healthcare Service</h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">How it works</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Choose the service you need</li>
                    <li>• Select your preferred date and time</li>
                    <li>• Fill in your details and symptoms</li>
                    <li>• Our admin will assign the best available doctor</li>
                    <li>• Complete payment to confirm your appointment</li>
                  </ul>
                </div>

                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <Image
                      src="/logo-gold-small.svg"
                      alt="Raghuvanshi Healthcare"
                      width={48}
                      height={58}
                      className="w-12 h-14 mx-auto mb-4 opacity-50"
                    />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Services...</h3>
                    <p className="text-gray-600">Please wait while we load available services</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-healthcare-blue hover:shadow-lg cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Image
                            src="/logo-gold-small.svg"
                            alt="Raghuvanshi Healthcare"
                            width={24}
                            height={29}
                            className="w-6 h-7"
                          />
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {service.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-healthcare-blue transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold text-healthcare-blue">
                              ₹{service.price}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">consultation</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">{service.duration}</span>
                            <div className="text-xs text-gray-400">duration</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Professional consultation included
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {services.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Can't find what you're looking for? 
                      <a href="/contact" className="text-healthcare-blue hover:underline ml-1">
                        Contact us for custom consultation
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Date and Time */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Select Date and Time</h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Selected Service</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedService?.name}</p>
                      <p className="text-sm text-gray-600">{selectedService?.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-healthcare-blue">₹{selectedService?.price}</p>
                      <p className="text-sm text-gray-500">{selectedService?.duration}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getTomorrowDate()}
                      max={getMaxDate()}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                      required
                      aria-label="Select appointment date"
                      title="Choose your preferred appointment date"
                    />
                    <p className="text-xs text-gray-500 mt-1">Choose your preferred appointment date</p>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time *
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-md">
                      {generateTimeSlots().map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm border rounded-md transition-all ${
                            selectedTime === time
                              ? 'bg-healthcare-blue text-white border-healthcare-blue'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-healthcare-blue'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Available time slots (9:00 AM - 5:30 PM)</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="mr-3"
                  >
                    Back
                  </Button>
                  <Button onClick={handleDateTimeSelect}>
                    Continue to Patient Details
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Patient Information */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Patient Information</h2>
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="+91 98765 43211"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                        placeholder="123 Main Street, City, State - 110001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Doctor (Optional)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="preferredDoctor"
                          value={formData.preferredDoctor}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="Dr. John Smith (if you have a preference)"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Our admin will assign the best available doctor</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                        aria-label="Select urgency level"
                      >
                        <option value="normal">Normal (Within 3-5 days)</option>
                        <option value="priority">Priority (Within 1-2 days)</option>
                        <option value="urgent">Urgent (Same day if possible)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms/Reason for Visit *
                    </label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                      placeholder="Please describe your symptoms, concerns, or reason for the appointment in detail..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This helps our doctors prepare for your consultation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-healthcare-blue focus:border-healthcare-blue"
                      placeholder="Any allergies, current medications, or other important information..."
                    />
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Doctor Assignment:</span>
                        <span className="font-medium text-blue-600">Will be assigned by admin</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Urgency:</span>
                        <span className="font-medium capitalize">{formData.urgency}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold text-healthcare-blue">₹{selectedService?.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Booking...' : 'Book Appointment & Pay'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
