'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  Heart,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { validateEmail, validatePhone, validateName, validatePassword } from '@/utils/validation';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, user, userData, loading, redirectAfterLogin } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user && userData) {
      redirectAfterLogin(router);
    }
  }, [user, userData, loading, redirectAfterLogin, router]);

  // Handle post-signup redirection
  useEffect(() => {
    if (user && userData && !isLoading) {
      // For new signups, redirect to home page for regular users
      console.log('Post-signup redirection triggered for role:', userData.role);
      if (userData.role === 'user') {
        router.push('/');
      } else {
        redirectAfterLogin(router);
      }
    }
  }, [user, userData, isLoading, router, redirectAfterLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate first name
    const firstNameValidation = validateName(formData.firstName);
    if (!firstNameValidation.isValid) {
      toast.error(`First name: ${firstNameValidation.message}`);
      return;
    }

    // Validate last name
    const lastNameValidation = validateName(formData.lastName);
    if (!lastNameValidation.isValid) {
      toast.error(`Last name: ${lastNameValidation.message}`);
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        toast.error(phoneValidation.message);
        return;
      }
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      const displayName = `${formData.firstName} ${formData.lastName}`;
      // Default role is 'user' for all new signups
      await signUp(formData.email, formData.password, displayName, 'user', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone
      });
      
      toast.success('Account created successfully!');
      
      // Wait a moment for context to update, then redirect
      setTimeout(() => {
        redirectAfterLogin(router);
      }, 500);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const benefits = [
    'Book appointments online',
    'Access medical records',
    'Order medicines',
    'Consult with doctors',
    'Emergency support',
    'Health tracking'
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left Column - Benefits */}
            <div className="hidden lg:block">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-2">
                      <Image
                        src="/logo-healthcare-gold.png"
                        alt="Raghuvanshi Healthcare Logo"
                        width={60}
                        height={72}
                        className="w-15 h-18"
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Join <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent font-semibold">Raghuvanshi Healthcare</span>
                  </h2>
                  <p className="text-gray-600">
                    Create your account and get access to comprehensive healthcare services
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    What you'll get:
                  </h3>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-healthcare-green mr-3" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="mt-8 lg:mt-0">
              <div className="max-w-md mx-auto">
                <div className="text-center lg:hidden mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-2">
                      <Image
                        src="/logo-healthcare-gold.png"
                        alt="Raghuvanshi Healthcare Logo"
                        width={50}
                        height={60}
                        className="w-12 h-15"
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                  <p className="mt-2 text-gray-600">
                    Join <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent font-semibold">Raghuvanshi Healthcare</span> today
                  </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name *
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue"
                            placeholder="First name"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name *
                        </label>
                        <div className="mt-1">
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue"
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="Create password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-center">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-healthcare-blue focus:ring-healthcare-blue border-gray-300 rounded"
                      />
                      <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                        I agree to the{' '}
                        <Link href="/terms" className="text-healthcare-blue hover:text-blue-600">
                          Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-healthcare-blue hover:text-blue-600">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <Button
                        type="submit"
                        className="w-full flex justify-center items-center"
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                        {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                      <span className="text-gray-600">Already have an account? </span>
                      <Link
                        href="/login"
                        className="text-healthcare-blue hover:text-blue-600 font-medium"
                      >
                        Sign in here
                      </Link>
                    </div>
                  </form>
                </div>

                {/* Security Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="text-sm text-blue-800">
                      <strong>Secure Registration:</strong> Your personal information is encrypted and protected.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
