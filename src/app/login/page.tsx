'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
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
  Heart,
  Shield,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/utils/validation';
import { getRoleBasedRedirectPath } from '@/utils/roleRedirect';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, userData, user, redirectAfterLogin, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user && userData) {
      console.log('User already logged in, redirecting...');
      redirectAfterLogin(router);
    }
  }, [user, userData, loading, redirectAfterLogin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ email: '', password: '' });
    
    // Validate fields
    const emailValidation = validateEmail(formData.email);
    let hasErrors = false;
    
    if (!emailValidation.isValid) {
      setErrors(prev => ({ ...prev, email: emailValidation.message }));
      hasErrors = true;
    }
    
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      hasErrors = true;
    }
    
    if (hasErrors) {
      toast.error('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with:', formData.email);
      // The signIn function in AuthContext will handle redirection automatically
      await signIn(formData.email, formData.password);
      console.log('Sign in completed, redirection handled by AuthContext');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-2">
                <Image
                  src="/logo-healthcare-gold.png"
                  alt="Raghuvanshi Healthcare Logo"
                  width={80}
                  height={95}
                  className="w-20 h-24"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">
              Sign in to your <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent font-semibold">Raghuvanshi Healthcare</span> account
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
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
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-healthcare-blue focus:border-healthcare-blue'}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-healthcare-blue focus:border-healthcare-blue'}`}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-healthcare-blue focus:ring-healthcare-blue border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-healthcare-blue hover:text-blue-600 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center items-center"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => toast.success('Google login coming soon!')}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => toast.success('Facebook login coming soon!')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  href="/signup"
                  className="text-healthcare-blue hover:text-blue-600 font-medium"
                >
                  Sign up here
                </Link>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div className="text-sm text-blue-800">
                <strong>Secure Login:</strong> Your data is protected with industry-standard encryption.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
