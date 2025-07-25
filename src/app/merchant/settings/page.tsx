'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/components/layout/MerchantLayout';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Store,
  CreditCard,
  Shield,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  updateProfile,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { 
  doc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface MerchantSettings {
  displayName: string;
  email: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  businessAddress: string;
  notifications: {
    orderUpdates: boolean;
    productAlerts: boolean;
    promotionalEmails: boolean;
  };
  paymentDetails: {
    bankAccount: string;
    ifscCode: string;
    accountHolder: string;
  };
}

export default function MerchantSettings() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<MerchantSettings>({
    displayName: '',
    email: '',
    phone: '',
    storeName: '',
    storeDescription: '',
    businessAddress: '',
    notifications: {
      orderUpdates: true,
      productAlerts: true,
      promotionalEmails: false
    },
    paymentDetails: {
      bankAccount: '',
      ifscCode: '',
      accountHolder: ''
    }
  });
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'merchant')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'merchant') {
      loadSettings();
    }
  }, [user, userData, loading, router]);

  const loadSettings = async () => {
    try {
      setLoadingData(true);
      
      // Load user data from Firestore
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setSettings({
          displayName: userData?.displayName || user.displayName || '',
          email: userData?.email || user.email || '',
          phone: userData?.phone || '',
          storeName: userData?.storeName || '',
          storeDescription: userData?.storeDescription || '',
          businessAddress: userData?.businessAddress || '',
          notifications: userData?.notifications || {
            orderUpdates: true,
            productAlerts: true,
            promotionalEmails: false
          },
          paymentDetails: userData?.paymentDetails || {
            bankAccount: '',
            ifscCode: '',
            accountHolder: ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      if (!user) return;
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: settings.displayName
      });
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: settings.displayName,
        phone: settings.phone,
        storeName: settings.storeName,
        storeDescription: settings.storeDescription,
        businessAddress: settings.businessAddress,
        notifications: settings.notifications,
        paymentDetails: settings.paymentDetails,
        updatedAt: new Date()
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      
      setIsSaving(true);
      
      if (user) {
        await updatePassword(user, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully!');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to change your password');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading settings...</p>
        </div>
      </MerchantLayout>
    );
  }

  if (!user || userData?.role !== 'merchant') {
    return null;
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and store preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'store', label: 'Store Settings', icon: Store },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'payment', label: 'Payment', icon: CreditCard },
              { id: 'security', label: 'Security', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your display name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Store Settings Tab */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your store name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  value={settings.storeDescription}
                  onChange={(e) => setSettings({...settings, storeDescription: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your store and products..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <textarea
                  value={settings.businessAddress}
                  onChange={(e) => setSettings({...settings, businessAddress: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your complete business address..."
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Store Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {key === 'orderUpdates' ? 'Order Updates' :
                       key === 'productAlerts' ? 'Product Alerts' :
                       'Promotional Emails'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {key === 'orderUpdates' ? 'Get notified when orders are placed or updated' :
                       key === 'productAlerts' ? 'Get alerts about low stock and product issues' :
                       'Receive promotional emails and marketing updates'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                      aria-label={`Toggle ${key}`}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Notifications'}
              </button>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={settings.paymentDetails.accountHolder}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentDetails: {
                      ...settings.paymentDetails,
                      accountHolder: e.target.value
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account holder name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={settings.paymentDetails.bankAccount}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentDetails: {
                      ...settings.paymentDetails,
                      bankAccount: e.target.value
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bank account number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={settings.paymentDetails.ifscCode}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentDetails: {
                      ...settings.paymentDetails,
                      ifscCode: e.target.value
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Payment Details'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleChangePassword}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
