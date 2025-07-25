'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Search, Plus, Edit, Trash2, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'admin' | 'doctor' | 'user' | 'merchant';
  createdAt: Date;
  status: 'active' | 'inactive';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  doctorId?: string; // Auto-generated when role is set to doctor
  merchantId?: string; // Auto-generated when role is set to merchant
}

export default function AdminUsers() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      fetchUsers();
    }
  }, [user, userData, loading, router]);

  const createTestDoctors = async () => {
    try {
      console.log('Creating test doctor users...');
      
      const testDoctors = [
        {
          email: 'dr.sharma@raghuvanshi.com',
          displayName: 'Dr. Sarah Sharma',
          firstName: 'Sarah',
          lastName: 'Sharma',
          role: 'doctor',
          doctorId: generateDoctorId(),
          specialization: 'General Medicine',
          phone: '+91 9876543220',
          status: 'active',
          createdAt: new Date()
        },
        {
          email: 'dr.patel@raghuvanshi.com',
          displayName: 'Dr. Michael Patel',
          firstName: 'Michael',
          lastName: 'Patel',
          role: 'doctor',
          doctorId: generateDoctorId(),
          specialization: 'Internal Medicine',
          phone: '+91 9876543221',
          status: 'active',
          createdAt: new Date()
        },
        {
          email: 'dr.singh@raghuvanshi.com',
          displayName: 'Dr. Emily Singh',
          firstName: 'Emily',
          lastName: 'Singh',
          role: 'doctor',
          doctorId: generateDoctorId(),
          specialization: 'Dentistry',
          phone: '+91 9876543222',
          status: 'active',
          createdAt: new Date()
        }
      ];

      for (const doctor of testDoctors) {
        const docRef = await addDoc(collection(db, 'users'), doctor);
        console.log(`Created doctor user: ${doctor.displayName} (${doctor.doctorId})`);
      }

      toast.success('Test doctor users created successfully!');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error creating test doctors:', error);
      toast.error('Error creating test doctors: ' + (error as Error).message);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );

      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown User',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || 'active',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          doctorId: data.doctorId || undefined,
          merchantId: data.merchantId || undefined,
        };
      }) as User[];

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users data');
      // Fallback sample data
      setUsers([
        { 
          id: '1', 
          displayName: 'John Doe', 
          email: 'john@example.com', 
          role: 'user', 
          createdAt: new Date('2024-01-15'), 
          status: 'active' 
        },
        { 
          id: '2', 
          displayName: 'Dr. Jane Smith', 
          email: 'jane.smith@example.com', 
          role: 'doctor', 
          createdAt: new Date('2024-02-10'), 
          status: 'active' 
        },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  // Helper function to generate unique IDs
  const generateDoctorId = (): string => {
    return `DOC${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const generateMerchantId = (): string => {
    return `MER${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return;

    if (!confirm(`Are you sure you want to change the role to ${newRole}?`)) {
      return;
    }

    try {
      const updateData: any = { role: newRole };
      
      // Generate IDs when assigning doctor or merchant roles
      if (newRole === 'doctor' && !currentUser.doctorId) {
        updateData.doctorId = generateDoctorId();
        toast.success(`Doctor ID ${updateData.doctorId} assigned!`);
      } else if (newRole === 'merchant' && !currentUser.merchantId) {
        updateData.merchantId = generateMerchantId();
        toast.success(`Merchant ID ${updateData.merchantId} assigned!`);
      }
      
      // Clear IDs when changing away from doctor/merchant roles
      if (newRole !== 'doctor' && currentUser.doctorId) {
        updateData.doctorId = null;
      }
      if (newRole !== 'merchant' && currentUser.merchantId) {
        updateData.merchantId = null;
      }

      await updateDoc(doc(db, 'users', userId), updateData);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updateData } : user
      ));
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error updating user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error deleting user');
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'merchant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading || loadingData) {
    return (
      <AdminLayout title="Users Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading users data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Users Management">
      <div className="space-y-6">
        {/* ID Assignment Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Automatic ID Assignment
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  When you assign <strong>Doctor</strong> or <strong>Merchant</strong> roles to users, 
                  unique professional IDs will be automatically generated:
                </p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li><strong>Doctor Role:</strong> Generates DOC ID (e.g., DOC1735027123456)</li>
                  <li><strong>Merchant Role:</strong> Generates MER ID (e.g., MER1735027123789)</li>
                  <li><strong>Role Changes:</strong> IDs are cleared when roles are changed back to User/Admin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Header and Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Users Management
              </h2>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <button 
                onClick={createTestDoctors}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Test Doctors
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              title="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="merchant">Merchant</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.doctorId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Users className="h-3 w-3 mr-1" />
                          {user.doctorId}
                        </span>
                      ) : user.merchantId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Users className="h-3 w-3 mr-1" />
                          {user.merchantId}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          title={`Change role for ${user.displayName}`}
                        >
                          <option value="user">User</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                          <option value="merchant">Merchant</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete user"
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'doctor').length}</div>
            <div className="text-sm text-gray-600">Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
