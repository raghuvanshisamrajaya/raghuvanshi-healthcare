'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Home, Users, Calendar, Package, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/services', label: 'Services', icon: Settings },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/rentals', label: 'Rental Requests', icon: FileText },
    { href: '/admin/promos', label: 'Promos', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex-shrink-0 flex items-center">
                <Home className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-1" />
                <span>{userData?.displayName || 'Admin'}</span>
              </div>
              
              <Link
                href="/admin/settings"
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
              >
                <Settings className="h-5 w-5" />
              </Link>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
