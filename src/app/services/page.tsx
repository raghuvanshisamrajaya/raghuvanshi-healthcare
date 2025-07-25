'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Calendar, Clock, User, Star, MapPin, Phone, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image?: string;
  doctor?: string;
  location?: string;
  rating?: number;
  availability: string[] | string; // Can be array of days or status string
  isActive: boolean;
  createdAt?: Date;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Sample services data (we'll populate from Firebase later)
  const sampleServices: Service[] = [
    {
      id: '1',
      name: 'General Consultation',
      description: 'Comprehensive health check-up with experienced doctors',
      price: 500,
      duration: '30 minutes',
      category: 'consultation',
      doctor: 'Dr. Rajesh Sharma',
      location: 'Main Clinic',
      rating: 4.8,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format'
    },
    {
      id: '2',
      name: 'Blood Test Package',
      description: 'Complete blood count and basic health screening',
      price: 800,
      duration: '15 minutes',
      category: 'laboratory',
      doctor: 'Lab Technician',
      location: 'Lab Center',
      rating: 4.9,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop&auto=format'
    },
    {
      id: '3',
      name: 'Cardiology Consultation',
      description: 'Heart health check-up with cardiologist',
      price: 1200,
      duration: '45 minutes',
      category: 'cardiology',
      doctor: 'Dr. Priya Mehta',
      location: 'Cardiology Wing',
      rating: 4.9,
      availability: ['Monday', 'Wednesday', 'Friday'],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop&auto=format'
    },
    {
      id: '4',
      name: 'X-Ray Scan',
      description: 'Digital X-ray imaging for various body parts',
      price: 600,
      duration: '20 minutes',
      category: 'imaging',
      doctor: 'Radiology Team',
      location: 'Imaging Center',
      rating: 4.7,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&auto=format'
    },
    {
      id: '5',
      name: 'Physiotherapy Session',
      description: 'Physical therapy and rehabilitation services',
      price: 700,
      duration: '60 minutes',
      category: 'therapy',
      doctor: 'Dr. Amit Singh',
      location: 'Physiotherapy Center',
      rating: 4.8,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format'
    },
    {
      id: '6',
      name: 'Dental Check-up',
      description: 'Comprehensive dental examination and cleaning',
      price: 800,
      duration: '40 minutes',
      category: 'dental',
      doctor: 'Dr. Sunita Verma',
      location: 'Dental Clinic',
      rating: 4.8,
      availability: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop&auto=format'
    },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    console.log('Fetching services...');
    try {
      setLoading(true);
      
      // Try to fetch from Firebase first
      const servicesQuery = query(
        collection(db, 'services'),
        orderBy('name', 'asc')
      );
      
      const serviceDocs = await getDocs(servicesQuery);
      console.log('Firebase services found:', serviceDocs.size);
      
      if (serviceDocs.empty) {
        console.log('No services in Firebase, using sample data');
        setServices(sampleServices);
        toast.success(`Loaded ${sampleServices.length} sample services`);
      } else {
        const servicesData = serviceDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Service[];
        
        const activeServices = servicesData.filter(service => service.isActive !== false);
        console.log('Active Firebase services:', activeServices.length);
        setServices(activeServices);
        toast.success(`Loaded ${activeServices.length} services from database`);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      console.log('Falling back to sample data');
      setServices(sampleServices);
      toast.error('Failed to load from database, using sample data');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'consultation', name: 'Consultation' },
    { id: 'laboratory', name: 'Laboratory' },
    { id: 'imaging', name: 'Imaging' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'dental', name: 'Dental' },
    { id: 'therapy', name: 'Therapy' },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const handleBookService = async (service: Service) => {
    if (!user) {
      toast.error('Please sign in to book services');
      return;
    }

    try {
      // Add to cart and redirect to booking page with service details
      await addToCart({
        id: service.id,
        name: service.name,
        price: service.price,
        image: service.image,
        type: 'service',
        category: service.category,
        description: service.description,
      });
      
      toast.success('Service added to booking!');
      // Redirect to booking page with this service
      window.location.href = `/booking?service=${service.id}`;
    } catch (error) {
      console.error('Error adding service to cart:', error);
      toast.error('Failed to add service to cart');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Healthcare Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare services with experienced professionals and modern facilities
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {/* Service Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-green-100">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <div class="text-center">
                                  <div class="w-16 h-16 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                                    </svg>
                                  </div>
                                  <p class="text-blue-600 font-semibold text-sm">${service.category}</p>
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
                            <Image
                              src="/logo-healthcare-gold.png"
                              alt="Raghuvanshi Healthcare"
                              width={32}
                              height={38}
                              className="w-8 h-10"
                            />
                          </div>
                          <p className="text-blue-600 font-semibold text-sm capitalize">{service.category}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-white/90 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    {service.rating && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{service.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Content */}
                  <div className="p-4">
                    {/* Service Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    
                    {/* Service Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Service Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{service.duration}</span>
                      </div>
                      
                      {service.doctor && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2 text-green-500" />
                          <span>{service.doctor}</span>
                        </div>
                      )}
                      
                      {service.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-red-500" />
                          <span>{service.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Available:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(service.availability) ? (
                          service.availability.map((day, index) => (
                            <span
                              key={`${day}-${index}`}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
                            >
                              {day.slice(0, 3)}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium">
                            {service.availability}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{service.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {user ? (
                        <>
                          <button
                            onClick={() => handleBookService(service)}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Book Now</span>
                          </button>
                          
                          <a
                            href={`https://wa.me/918824187767?text=Hi, I want to book ${encodeURIComponent(service.name)} service.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-2">Sign in to book services</p>
                          <Link
                            href="/login"
                            className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Sign In to Book
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image
                src="/logo-healthcare-gold.png"
                alt="Raghuvanshi Healthcare"
                width={64}
                height={77}
                className="h-16 w-16 mx-auto mb-4 opacity-50"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600">No services available in the selected category.</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help Choosing a Service?
            </h3>
            <p className="text-gray-600 mb-4">
              Our healthcare experts are here to help you find the right service for your needs.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="text-gray-900">+91 8824187767</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="text-gray-900">+91 6367225694</span>
              </div>
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
