'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Bell, Shield, Palette, Globe, Mail, Database, Save } from 'lucide-react';

export default function AdminSettings() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Raghuvanshi Healthcare',
      siteDescription: 'Complete healthcare management system',
      contactEmail: 'contact@raghuvanshi.com',
      phoneNumber: '+1 (555) 123-4567',
      address: '123 Healthcare St, Medical City, MC 12345'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      logo: '',
      favicon: ''
    }
  });

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }
  }, [user, userData, loading, router]);

  const handleSave = (section: string) => {
    // Here you would typically save to your backend
    console.log(`Saving ${section} settings:`, settings[section as keyof typeof settings]);
    // Show success message
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            System Settings
          </h2>
          <p className="text-gray-600">Configure your healthcare management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        id="siteName"
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, siteName: e.target.value }
                        })}
                        title="Enter site name"
                        placeholder="Enter site name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        id="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, contactEmail: e.target.value }
                        })}
                        title="Enter contact email address"
                        placeholder="Enter contact email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={settings.general.phoneNumber}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, phoneNumber: e.target.value }
                        })}
                        title="Enter phone number"
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        id="address"
                        value={settings.general.address}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, address: e.target.value }
                        })}
                        rows={3}
                        title="Enter address"
                        placeholder="Enter address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteDescription: e.target.value }
                      })}
                      rows={3}
                      title="Enter site description"
                      placeholder="Enter site description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSave('general')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                          })}
                          title="Toggle email notifications"
                          aria-label="Toggle email notifications"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                          })}
                          title="Toggle SMS notifications"
                          aria-label="Toggle SMS notifications"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
                        <p className="text-sm text-gray-500">Send reminders before appointments</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.appointmentReminders}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, appointmentReminders: e.target.checked }
                          })}
                          title="Toggle appointment reminders"
                          aria-label="Toggle appointment reminders"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">System Alerts</h4>
                        <p className="text-sm text-gray-500">Receive system and security alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.systemAlerts}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, systemAlerts: e.target.checked }
                          })}
                          title="Toggle system alerts"
                          aria-label="Toggle system alerts"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSave('notifications')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                        })}
                        title="Enter session timeout in minutes"
                        placeholder="Enter timeout minutes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                        })}
                        title="Enter maximum login attempts"
                        placeholder="Enter max attempts"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (days)
                      </label>
                      <input
                        id="passwordExpiry"
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                        })}
                        title="Enter password expiry in days"
                        placeholder="Enter expiry days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, twoFactorAuth: e.target.checked }
                        })}
                        title="Toggle two-factor authentication"
                        aria-label="Toggle two-factor authentication"
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <button
                    onClick={() => handleSave('security')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        id="theme"
                        value={settings.appearance.theme}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme: e.target.value }
                        })}
                        title="Select theme"
                        aria-label="Select theme"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <input
                        id="primaryColor"
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, primaryColor: e.target.value }
                        })}
                        title="Select primary color"
                        aria-label="Select primary color"
                        className="w-full h-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSave('appearance')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
