'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Heart, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  ShoppingBag,
  ShoppingCart,
  Calendar,
  Phone,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/components/providers/ThemeProvider';
import Button from '@/components/ui/Button';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userData, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/services', label: 'Services' },
    { href: '/booking', label: 'Book Appointment' },
    { href: '/contact', label: 'Contact' },
    { href: '/about', label: 'About' },
  ];

  const getDashboardLink = () => {
    if (!userData) return '/dashboard';
    
    switch (userData.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'merchant':
        return '/merchant';
      default:
        return '/dashboard';
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image
                src="/logo-healthcare-gold.png"
                alt="Raghuvanshi Healthcare Logo"
                width={40}
                height={48}
                className="w-10 h-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold font-heading bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
                Raghuvanshi
              </h1>
              <p className="text-xs font-medium -mt-1 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Healthcare
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-healthcare-blue dark:hover:text-healthcare-green font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-healthcare-blue group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>

            {/* Emergency Call */}
            <Link
              href="tel:+918824187767"
              className="hidden md:flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Emergency</span>
            </Link>

            {/* Cart */}
            {user && (
              <Link
                href="/cart"
                className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            )}

            {/* User Authentication */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-healthcare-blue text-white hover:bg-primary-700 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {userData?.displayName || 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                    >
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      
                      {userData?.role === 'user' && (
                        <>
                          <Link
                            href="/cart"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Cart ({getCartItemCount()})</span>
                          </Link>
                          
                          <Link
                            href="/user/bookings"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Calendar className="w-4 h-4" />
                            <span>My Bookings</span>
                          </Link>
                          
                          <Link
                            href="/orders"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>My Orders</span>
                          </Link>
                        </>
                      )}
                      
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-4 py-6 space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-gray-700 dark:text-gray-300 hover:text-healthcare-blue dark:hover:text-healthcare-green font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                {user ? (
                  <div className="space-y-3">
                    <Link
                      href={getDashboardLink()}
                      className="block text-gray-700 dark:text-gray-300 hover:text-healthcare-blue dark:hover:text-healthcare-green font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-red-600 hover:text-red-700 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
                
                <Link
                  href="tel:+918824187767"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Phone className="w-4 h-4" />
                  <span>Emergency Call</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;
