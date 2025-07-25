'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  BarChart3,
  Plus,
  Home
} from 'lucide-react';

interface MerchantLayoutProps {
  children: ReactNode;
}

export default function MerchantLayout({ children }: MerchantLayoutProps) {
  const { userData } = useAuth();
  const pathname = usePathname();

  const merchantNavItems = [
    {
      href: '/merchant',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/merchant/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/merchant/orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/merchant/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      href: '/merchant/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen pt-20">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-healthcare-blue rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Merchant Panel</h2>
                <p className="text-sm text-gray-500">{userData?.displayName}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {merchantNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-healthcare-blue text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 pt-20">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
