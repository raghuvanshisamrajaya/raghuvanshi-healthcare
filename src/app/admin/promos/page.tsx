'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Percent, Plus, Search, Edit, Trash2, Eye, Calendar, Tag, Database } from 'lucide-react';
import toast from 'react-hot-toast';

interface Promo {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive' | 'expired';
  applicableToProducts: string[];
  applicableToServices: string[];
  createdAt: Date;
}

export default function AdminPromos() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promo>>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'active'
  });

  const filteredPromos = promos.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      console.log('User authenticated, checking Firebase and loading promos...');
      checkFirebaseConnection();
      fetchPromos();
    }
  }, [user, userData, loading, router]);

  const checkFirebaseConnection = async () => {
    try {
      console.log('Checking Firebase connection...');
      
      // Check if other collections have data
      const [usersSnapshot, servicesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'services'))
      ]);
      
      console.log('Users collection size:', usersSnapshot.size);
      console.log('Services collection size:', servicesSnapshot.size);
      
      if (usersSnapshot.empty && servicesSnapshot.empty) {
        console.log('Firebase collections appear empty - may need to populate data');
        toast.error('Firebase appears empty. Please run data population first.');
      }
    } catch (error) {
      console.error('Firebase connection check failed:', error);
      toast.error('Failed to connect to Firebase');
    }
  };

  const fetchPromos = async () => {
    try {
      setLoadingData(true);
      console.log('Fetching promos from Firebase...');
      
      // Try simple query first without orderBy
      const promosRef = collection(db, 'promos');
      const promosSnapshot = await getDocs(promosRef);
      
      console.log('Promos snapshot size:', promosSnapshot.size);
      console.log('Promos snapshot empty:', promosSnapshot.empty);
      
      if (promosSnapshot.empty) {
        console.log('No promos found in Firebase collection');
        toast.error('No promos found. Please populate data first.');
      }
      
      const promosData = promosSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw promo data:', data);
        return {
          id: doc.id,
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          discountType: data.discountType || 'percentage',
          discountValue: data.discountValue || 0,
          minOrderAmount: data.minOrderAmount || 0,
          maxDiscountAmount: data.maxDiscountAmount,
          usageLimit: data.usageLimit || 100,
          usedCount: data.usedCount || 0,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          status: data.status || 'active',
          applicableToProducts: data.applicableToProducts || [],
          applicableToServices: data.applicableToServices || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Promo[];

      console.log('Processed promos:', promosData);
      
      // Sort client-side instead
      promosData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setPromos(promosData);
      
      if (promosData.length > 0) {
        toast.success(`Loaded ${promosData.length} promos successfully`);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Specific error details:', errorMessage);
      
      // Check if it's a permission or index error
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        toast.error('Permission denied - check Firebase rules');
      } else if (errorMessage.includes('index')) {
        toast.error('Firebase index error - check console for details');
      } else {
        toast.error('Error loading promos data: ' + errorMessage);
      }
      
      // Don't use fallback sample data - keep promos empty to show the issue
      console.log('Firebase query failed, leaving promos empty');
      setPromos([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddPromo = async () => {
    try {
      // Validate required fields
      if (!newPromo.code || !newPromo.name || !newPromo.discountValue) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate dates
      const startDate = newPromo.startDate ? new Date(newPromo.startDate) : new Date();
      const endDate = newPromo.endDate ? new Date(newPromo.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      if (endDate <= startDate) {
        toast.error('End date must be after start date');
        return;
      }

      console.log('Adding new promo:', newPromo);
      
      const promoData = {
        code: newPromo.code.toUpperCase(),
        name: newPromo.name,
        description: newPromo.description || '',
        discountType: newPromo.discountType || 'percentage',
        discountValue: Number(newPromo.discountValue),
        minOrderAmount: Number(newPromo.minOrderAmount) || 0,
        maxDiscountAmount: newPromo.maxDiscountAmount || null,
        usageLimit: Number(newPromo.usageLimit) || 100,
        usedCount: 0,
        startDate: startDate,
        endDate: endDate,
        status: newPromo.status || 'active',
        applicableToProducts: newPromo.applicableToProducts || [],
        applicableToServices: newPromo.applicableToServices || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Promo data to save:', promoData);
      
      const docRef = await addDoc(collection(db, 'promos'), promoData);
      console.log('Promo added with ID:', docRef.id);
      
      toast.success('Promo code created successfully');
      setShowAddModal(false);
      await fetchPromos(); // Refresh the list
      
      // Reset form
      setNewPromo({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        usageLimit: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    } catch (error) {
      console.error('Error adding promo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('permission')) {
        toast.error('Permission denied - check Firebase rules');
      } else {
        toast.error('Error creating promo code: ' + errorMessage);
      }
    }
  };

  const handleUpdatePromo = async (promoId: string, updates: Partial<Promo>) => {
    try {
      await updateDoc(doc(db, 'promos', promoId), { ...updates, updatedAt: new Date() });
      setPromos(promos.map(promo => 
        promo.id === promoId ? { ...promo, ...updates } : promo
      ));
      toast.success('Promo updated successfully');
    } catch (error) {
      console.error('Error updating promo:', error);
      toast.error('Error updating promo');
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        await deleteDoc(doc(db, 'promos', promoId));
        setPromos(promos.filter(promo => promo.id !== promoId));
        toast.success('Promo deleted successfully');
      } catch (error) {
        console.error('Error deleting promo:', error);
        toast.error('Error deleting promo');
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (endDate: Date) => {
    return new Date() > endDate;
  };

  if (loading || loadingData) {
    return (
      <AdminLayout title="Promo Codes Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading promo codes...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Promo Codes Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
            <p className="text-gray-600">Manage discount codes and promotional offers</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Promo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Promos</p>
                <p className="text-2xl font-semibold text-gray-900">{promos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Promos</p>
                <p className="text-2xl font-semibold text-gray-900">{promos.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Percent className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Usage</p>
                <p className="text-2xl font-semibold text-gray-900">{promos.reduce((sum, p) => sum + p.usedCount, 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-semibold text-gray-900">{promos.filter(p => isExpired(p.endDate)).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by code or name..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Promos Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{promo.code}</div>
                        <div className="text-sm text-gray-500">{promo.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                      </div>
                      <div className="text-sm text-gray-500">Min: ₹{promo.minOrderAmount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{promo.usedCount} / {promo.usageLimit}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                          style={{width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{promo.startDate.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">to {promo.endDate.toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(isExpired(promo.endDate) ? 'expired' : promo.status)}`}>
                        {isExpired(promo.endDate) ? 'Expired' : promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={promo.status}
                          onChange={(e) => handleUpdatePromo(promo.id, { status: e.target.value as any })}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          title={`Change status for ${promo.code}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <button 
                          onClick={() => handleDeletePromo(promo.id)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete promo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Promo Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Add New Promo Code</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={newPromo.code || ''}
                    onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SUMMER50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newPromo.name || ''}
                    onChange={(e) => setNewPromo({...newPromo, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Summer Sale"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newPromo.description || ''}
                    onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your promo offer..."
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="promoDiscountType" className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    id="promoDiscountType"
                    value={newPromo.discountType || 'percentage'}
                    onChange={(e) => setNewPromo({...newPromo, discountType: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select discount type"
                    aria-label="Discount type"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="promoDiscountValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value {newPromo.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    id="promoDiscountValue"
                    value={newPromo.discountValue || ''}
                    onChange={(e) => setNewPromo({...newPromo, discountValue: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Discount value"
                    placeholder={newPromo.discountType === 'percentage' ? '10' : '100'}
                    min="0"
                    max={newPromo.discountType === 'percentage' ? '100' : undefined}
                  />
                </div>
                <div>
                  <label htmlFor="promoMinOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    id="promoMinOrderAmount"
                    value={newPromo.minOrderAmount || ''}
                    onChange={(e) => setNewPromo({...newPromo, minOrderAmount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Minimum order amount required for this promo"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="promoUsageLimit" className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    id="promoUsageLimit"
                    value={newPromo.usageLimit || ''}
                    onChange={(e) => setNewPromo({...newPromo, usageLimit: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Maximum number of times this promo can be used"
                    placeholder="100"
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="promoStartDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="promoStartDate"
                    value={newPromo.startDate ? 
                      (newPromo.startDate instanceof Date ? 
                        newPromo.startDate.toISOString().split('T')[0] : 
                        new Date(newPromo.startDate).toISOString().split('T')[0]
                      ) : ''
                    }
                    onChange={(e) => setNewPromo({...newPromo, startDate: e.target.value ? new Date(e.target.value) : undefined})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Promo start date"
                  />
                </div>
                <div>
                  <label htmlFor="promoEndDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="promoEndDate"
                    value={newPromo.endDate ? 
                      (newPromo.endDate instanceof Date ? 
                        newPromo.endDate.toISOString().split('T')[0] : 
                        new Date(newPromo.endDate).toISOString().split('T')[0]
                      ) : ''
                    }
                    onChange={(e) => setNewPromo({...newPromo, endDate: e.target.value ? new Date(e.target.value) : undefined})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Promo end date"
                    min={newPromo.startDate ? 
                      (newPromo.startDate instanceof Date ? 
                        newPromo.startDate.toISOString().split('T')[0] : 
                        new Date(newPromo.startDate).toISOString().split('T')[0]
                      ) : ''
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPromo({
                      code: '',
                      name: '',
                      description: '',
                      discountType: 'percentage',
                      discountValue: 0,
                      minOrderAmount: 0,
                      usageLimit: 100,
                      startDate: new Date(),
                      endDate: new Date(),
                      status: 'active'
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPromo}
                  disabled={!newPromo.code || !newPromo.name || !newPromo.discountValue}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Promo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
