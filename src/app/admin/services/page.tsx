'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Plus, Search, Edit, Trash2, Eye, Clock, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductImage } from '@/utils/imageUtils';
import ImageUploader from '@/components/ui/ImageUploader';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  availability: 'available' | 'unavailable' | 'limited';
  maxBookings: number;
  currentBookings: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminServices() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('url');
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: '',
    availability: 'available',
    maxBookings: 10,
    currentBookings: 0,
    isActive: true,
    image: ''
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesAvailability = availabilityFilter === 'all' || service.availability === availabilityFilter;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Get unique categories
  const categories = services
    .map(s => s.category)
    .filter((category, index, array) => array.indexOf(category) === index);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      fetchServices();
    }
  }, [user, userData, loading, router]);

  const fetchServices = async () => {
    try {
      console.log('Fetching services...');
      const servicesRef = collection(db, 'services');
      const servicesQuery = query(servicesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(servicesQuery);
      
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Service[];

      console.log('Fetched services:', servicesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to sample data
      setServices([
        {
          id: '1',
          name: 'General Consultation',
          description: 'Comprehensive health checkup with our experienced doctors',
          price: 500,
          duration: 30,
          category: 'Consultation',
          availability: 'available',
          maxBookings: 20,
          currentBookings: 5,
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '2', 
          name: 'Blood Test Package',
          description: 'Complete blood count and basic metabolic panel',
          price: 1200,
          duration: 15,
          category: 'Diagnostic',
          availability: 'available',
          maxBookings: 15,
          currentBookings: 3,
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '3',
          name: 'Vaccination',
          description: 'COVID-19, Flu, and other routine vaccinations',
          price: 800,
          duration: 20,
          category: 'Prevention',
          availability: 'limited',
          maxBookings: 10,
          currentBookings: 8,
          isActive: true,
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddService = async () => {
    try {
      if (!newService.name || !newService.category || !newService.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      const serviceData = {
        ...newService,
        createdAt: new Date(),
        currentBookings: 0,
        isActive: true // Ensure services are active by default
      };

      const docRef = await addDoc(collection(db, 'services'), serviceData);
      
      setServices([...services, { ...serviceData, id: docRef.id } as Service]);
      setShowAddModal(false);
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: '',
        availability: 'available',
        maxBookings: 10,
        currentBookings: 0,
        isActive: true,
        image: ''
      });
      toast.success('Service added successfully!');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  const handleEditService = async () => {
    if (!editingService) return;

    try {
      const serviceRef = doc(db, 'services', editingService.id);
      await updateDoc(serviceRef, {
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        duration: editingService.duration,
        category: editingService.category,
        availability: editingService.availability,
        maxBookings: editingService.maxBookings,
        image: editingService.image
      });

      setServices(services.map(s => 
        s.id === editingService.id ? editingService : s
      ));
      setEditingService(null);
      toast.success('Service updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await deleteDoc(doc(db, 'services', serviceId));
      setServices(services.filter(s => s.id !== serviceId));
      toast.success('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleUpdateAvailability = async (serviceId: string, availability: 'available' | 'unavailable' | 'limited') => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, { availability });

      setServices(services.map(s => 
        s.id === serviceId ? { ...s, availability } : s
      ));
      toast.success('Service availability updated!');
    } catch (error) {
      console.error('Error updating service availability:', error);
      toast.error('Failed to update service availability');
    }
  };

  const getAvailabilityStatus = (service: Service) => {
    if (service.availability === 'unavailable') {
      return { text: 'Unavailable', color: 'text-red-600 bg-red-100' };
    }
    if (service.availability === 'limited' || service.currentBookings >= service.maxBookings) {
      return { text: 'Limited', color: 'text-orange-600 bg-orange-100' };
    }
    return { text: 'Available', color: 'text-green-600 bg-green-100' };
  };

  const getTotalRevenue = () => {
    return services.reduce((total, service) => total + (service.price * service.currentBookings), 0);
  };

  const getActiveServicesCount = () => {
    return services.filter(service => service.availability === 'available').length;
  };

  const getTotalBookings = () => {
    return services.reduce((total, service) => total + service.currentBookings, 0);
  };

  if (loading || loadingData) {
    return (
      <AdminLayout title="Services Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading services...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Services Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-semibold text-gray-900">{services.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Services</p>
                <p className="text-2xl font-semibold text-gray-900">{getActiveServicesCount()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalBookings()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{getTotalRevenue().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Heart className="h-6 w-6 mr-2" />
                Services Management
              </h2>
              <p className="text-gray-600">Manage your healthcare services and appointments</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by category"
              aria-label="Filter services by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by availability"
              aria-label="Filter services by availability"
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Services Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => {
                  const status = getAvailabilityStatus(service);
                  return (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {/* Service Image */}
                          <div className="flex-shrink-0">
                            <ProductImage
                              src={service.image}
                              alt={service.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{service.price}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{service.currentBookings} / {service.maxBookings}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                            style={{"width": `${Math.min((service.currentBookings / service.maxBookings) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            value={service.availability}
                            onChange={(e) => handleUpdateAvailability(service.id, e.target.value as any)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            title={`Change availability for ${service.name}`}
                          >
                            <option value="available">Available</option>
                            <option value="limited">Limited</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                          <button 
                            onClick={() => setEditingService(service)}
                            className="text-blue-600 hover:text-blue-900" 
                            title="Edit service"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-hidden m-4 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add New Service</h3>
              <button
                onClick={() => setShowAddModal(false)}
                title="Close modal"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  id="serviceName"
                  value={newService.name || ''}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter service name"
                  title="Service name"
                />
              </div>
              <div>
                <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="serviceDescription"
                  value={newService.description || ''}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter service description"
                  title="Service description"
                />
              </div>
              
              {/* Service Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
                <div className="space-y-3">
                  {/* Image Method Selection */}
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="imageMethod"
                        value="url"
                        checked={imageInputMethod === 'url'}
                        onChange={(e) => setImageInputMethod(e.target.value as 'url' | 'upload')}
                      />
                      <span className="ml-2">Image URL</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="imageMethod"
                        value="upload"
                        checked={imageInputMethod === 'upload'}
                        onChange={(e) => setImageInputMethod(e.target.value as 'url' | 'upload')}
                      />
                      <span className="ml-2">Upload Image</span>
                    </label>
                  </div>

                  {/* Image Input Based on Method */}
                  {imageInputMethod === 'url' ? (
                    <input
                      type="url"
                      value={newService.image || ''}
                      onChange={(e) => setNewService({...newService, image: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://example.com/image.jpg"
                    />
                  ) : (
                    <ImageUploader
                      onImageSelect={(imageData) => setNewService({...newService, image: imageData})}
                      currentImage={newService.image}
                    />
                  )}

                  {/* Image Preview */}
                  {newService.image && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <ProductImage
                        src={newService.image}
                        alt="Service preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  id="serviceCategory"
                  value={newService.category || ''}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Consultation, Diagnostic"
                  title="Service category"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    id="servicePrice"
                    value={newService.price || 0}
                    onChange={(e) => setNewService({...newService, price: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="1"
                    title="Service price in Rupees"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-700">Duration (min)</label>
                  <input
                    type="number"
                    id="serviceDuration"
                    value={newService.duration || 30}
                    onChange={(e) => setNewService({...newService, duration: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="5"
                    step="5"
                    title="Service duration in minutes"
                    placeholder="30"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="serviceMaxBookings" className="block text-sm font-medium text-gray-700">Max Bookings</label>
                <input
                  type="number"
                  id="serviceMaxBookings"
                  value={newService.maxBookings || 10}
                  onChange={(e) => setNewService({...newService, maxBookings: Number(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                  title="Maximum number of bookings allowed"
                  placeholder="10"
                />
              </div>
              <div>
                <label htmlFor="serviceAvailability" className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                  id="serviceAvailability"
                  value={newService.availability || 'available'}
                  onChange={(e) => setNewService({...newService, availability: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Service availability status"
                  aria-label="Service availability"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Service</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editServiceName" className="block text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  id="editServiceName"
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Service name"
                  placeholder="Service name"
                />
              </div>
              <div>
                <label htmlFor="editServiceDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="editServiceDescription"
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  title="Service description"
                  placeholder="Service description"
                />
              </div>
              <div>
                <label htmlFor="editServiceCategory" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  id="editServiceCategory"
                  value={editingService.category || ''}
                  onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Service category"
                  placeholder="Service category"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editServicePrice" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    id="editServicePrice"
                    value={editingService.price || 0}
                    onChange={(e) => setEditingService({...editingService, price: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="1"
                    title="Service price in Rupees"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="editServiceDuration" className="block text-sm font-medium text-gray-700">Duration (min)</label>
                  <input
                    type="number"
                    id="editServiceDuration"
                    value={editingService.duration || 30}
                    onChange={(e) => setEditingService({...editingService, duration: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="5"
                    step="5"
                    title="Service duration in minutes"
                    placeholder="30"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="editServiceMaxBookings" className="block text-sm font-medium text-gray-700">Max Bookings</label>
                <input
                  type="number"
                  id="editServiceMaxBookings"
                  value={editingService.maxBookings || 10}
                  onChange={(e) => setEditingService({...editingService, maxBookings: Number(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                  title="Maximum number of bookings allowed"
                  placeholder="10"
                />
              </div>
              <div>
                <label htmlFor="editServiceAvailability" className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                  id="editServiceAvailability"
                  value={editingService.availability || 'available'}
                  onChange={(e) => setEditingService({...editingService, availability: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  title="Service availability status"
                  aria-label="Service availability"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingService(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditService}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Service
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
