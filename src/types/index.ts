// Type definitions for the Raghuvanshi Healthcare project

export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: 'admin' | 'doctor' | 'user' | 'merchant';
  doctorId?: string; // Auto-generated when role is set to doctor
  merchantId?: string; // Auto-generated when role is set to merchant
  status?: 'active' | 'inactive';
  createdAt: Date;
  updatedAt?: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  type: 'consultation' | 'checkup' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  availableSlots: string[];
  image?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
  // Rental options
  availableForRent?: boolean;
  rentPrice?: number; // per day/week/month
  rentPeriod?: 'daily' | 'weekly' | 'monthly';
  minRentDuration?: number; // minimum rental period
  maxRentDuration?: number; // maximum rental period
  securityDeposit?: number; // refundable security deposit
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
  service?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface RentalRequest {
  id: string;
  userId: string;
  productId: string;
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  documents: {
    aadharNumber: string;
    panNumber: string;
    aadharImage?: string;
    panImage?: string;
    aadharVerified: boolean;
    panVerified: boolean;
    bankChequeImage?: string;
    chequeSubmitted: boolean;
  };
  rentalDetails: {
    startDate: Date;
    endDate: Date;
    duration: number;
    rentAmount: number;
    securityDeposit: number;
    advancePayment: number;
    totalAmount: number;
  };
  status: 'pending' | 'document_verification' | 'approved' | 'delivered' | 'returned' | 'rejected' | 'cancelled';
  paymentStatus: 'pending' | 'advance_paid' | 'full_paid' | 'refunded';
  deliveryAddress: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  inStock: boolean;
  image?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  prescription?: boolean;
  isActive: boolean;
  status: 'active' | 'inactive' | 'out-of-stock';
  merchantId?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Rental options
  availableForRent?: boolean;
  rentPrice?: number; // per day/week/month
  rentPeriod?: 'daily' | 'weekly' | 'monthly';
  minRentDuration?: number; // minimum rental period
  maxRentDuration?: number; // maximum rental period
  securityDeposit?: number; // refundable security deposit
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
