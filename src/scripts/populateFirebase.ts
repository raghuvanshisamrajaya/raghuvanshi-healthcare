'use client';

import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export const populateFirebaseData = async (currentUser?: User) => {
  try {
    // Get current user ID or use default
    const currentUserId = currentUser?.uid || auth.currentUser?.uid || 'sample-user-default';
    const currentUserEmail = currentUser?.email || auth.currentUser?.email || 'user@example.com';
    
    console.log('Populating data for user:', currentUserId, currentUserEmail);

    // Sample Users - including current user
    const users = [
      {
        uid: 'admin-user-1',
        email: 'admin@raghuvanshi.com',
        displayName: 'Admin User',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+91-9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uid: 'doctor-user-1',
        email: 'doctor@raghuvanshi.com',
        displayName: 'Dr. Rajesh Sharma',
        role: 'doctor',
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phoneNumber: '+91-9876543211',
        specialization: 'General Medicine',
        doctorId: 'DOC001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add current user to users collection
      {
        uid: currentUserId,
        email: currentUserEmail,
        displayName: currentUser?.displayName || 'Current User',
        role: 'user',
        firstName: 'Current',
        lastName: 'User',
        phoneNumber: '+91-9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of users) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`Added user: ${user.displayName}`);
    }

    // Sample Services
    const services = [
      {
        name: 'General Consultation',
        description: 'Complete health checkup and medical consultation with experienced doctors',
        price: 500,
        duration: 30,
        category: 'Consultation',
        availability: 'available',
        maxBookings: 20,
        currentBookings: 5,
        image: '/images/consultation.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cardiology Consultation',
        description: 'Specialized heart and cardiovascular system examination',
        price: 1200,
        duration: 45,
        category: 'Cardiology',
        availability: 'available',
        maxBookings: 10,
        currentBookings: 3,
        image: '/images/cardiology.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Blood Test Package',
        description: 'Comprehensive blood analysis and health screening',
        price: 800,
        duration: 15,
        category: 'Diagnostic',
        availability: 'available',
        maxBookings: 25,
        currentBookings: 8,
        image: '/images/blood-test.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vaccination',
        description: 'COVID-19, Flu, and other routine vaccinations',
        price: 800,
        duration: 20,
        category: 'Preventive',
        availability: 'available',
        maxBookings: 30,
        currentBookings: 12,
        image: '/images/vaccination.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Physiotherapy Session',
        description: 'Professional physiotherapy for rehabilitation and recovery',
        price: 800,
        duration: 45,
        category: 'Therapy',
        availability: 'available',
        maxBookings: 15,
        currentBookings: 6,
        image: '/images/physiotherapy.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const service of services) {
      const docRef = await addDoc(collection(db, 'services'), service);
      console.log(`Added service: ${service.name} with ID: ${docRef.id}`);
    }

    // Sample Products
    const products = [
      {
        name: 'Digital Blood Pressure Monitor',
        description: 'Accurate automatic blood pressure measurement device',
        price: 2500,
        originalPrice: 3000,
        category: 'Medical Equipment',
        stock: 50,
        inStock: true,
        rating: 4.6,
        reviews: 167,
        discount: 17,
        prescription: false,
        image: '/images/bp-monitor.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Digital Thermometer',
        description: 'Fast and accurate temperature measurement',
        price: 349,
        category: 'Medical Equipment',
        stock: 100,
        inStock: true,
        rating: 4.4,
        reviews: 89,
        prescription: false,
        image: '/images/thermometer.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Paracetamol 500mg',
        description: 'Pain relief and fever reducer tablets',
        price: 45,
        originalPrice: 60,
        category: 'Medicines',
        stock: 150,
        inStock: true,
        rating: 4.5,
        reviews: 234,
        discount: 25,
        prescription: true,
        image: '/images/paracetamol.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vitamin D3 Tablets',
        description: 'Essential vitamin D3 supplement for bone health',
        price: 299,
        originalPrice: 399,
        category: 'Vitamins & Supplements',
        stock: 200,
        inStock: true,
        rating: 4.7,
        reviews: 156,
        discount: 25,
        prescription: false,
        image: '/images/vitamin-d3.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hand Sanitizer 500ml',
        description: '70% alcohol-based hand sanitizer',
        price: 199,
        originalPrice: 249,
        category: 'Personal Care',
        stock: 75,
        inStock: true,
        rating: 4.3,
        reviews: 203,
        discount: 20,
        prescription: false,
        image: '/images/antiseptic.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'First Aid Kit',
        description: 'Complete first aid kit for home and travel',
        price: 899,
        originalPrice: 1199,
        category: 'First Aid',
        stock: 300,
        inStock: true,
        rating: 4.8,
        reviews: 91,
        discount: 25,
        prescription: false,
        image: '/images/surgical-mask.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const product of products) {
      const docRef = await addDoc(collection(db, 'products'), product);
      console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
    }

    // Sample Bookings/Appointments
    const bookings = [
      {
        invoiceId: 'INV-2025-001',
        patientName: currentUser?.displayName || 'John Doe',
        patientEmail: currentUserEmail,
        patientInfo: {
          name: currentUser?.displayName || 'John Doe',
          email: currentUserEmail,
          phone: '+91 9876543210',
          age: 32,
          gender: 'male'
        },
        serviceName: 'General Consultation',
        appointmentDate: new Date('2025-07-25'),
        appointmentTime: '10:00 AM',
        status: 'confirmed',
        paymentStatus: 'paid',
        urgency: 'normal',
        totalAmount: 500,
        symptoms: 'Fever and headache',
        notes: 'Patient reports symptoms for 2 days',
        doctorAssigned: 'Dr. Sarah Johnson',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        invoiceId: 'INV-2025-002',
        patientName: 'Jane Smith',
        patientEmail: 'jane.smith@example.com',
        patientInfo: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+91 9876543211',
          age: 28,
          gender: 'female'
        },
        serviceName: 'Blood Test Package',
        appointmentDate: new Date('2025-07-22'),
        appointmentTime: '9:30 AM',
        status: 'completed',
        paymentStatus: 'paid',
        urgency: 'normal',
        totalAmount: 800,
        symptoms: 'Routine checkup',
        notes: 'Annual health screening',
        doctorAssigned: 'Dr. Michael Chen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        invoiceId: 'INV-2025-003',
        patientName: 'Robert Wilson',
        patientEmail: 'robert.wilson@example.com',
        patientInfo: {
          name: 'Robert Wilson',
          email: 'robert.wilson@example.com',
          phone: '+91 9876543212',
          age: 45,
          gender: 'male'
        },
        serviceName: 'Cardiology Consultation',
        appointmentDate: new Date('2025-07-26'),
        appointmentTime: '2:00 PM',
        status: 'pending',
        paymentStatus: 'paid',
        urgency: 'priority',
        totalAmount: 1200,
        symptoms: 'Chest discomfort',
        notes: 'Family history of heart disease',
        doctorAssigned: 'Dr. Emily Carter',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const booking of bookings) {
      const docRef = await addDoc(collection(db, 'bookings'), booking);
      console.log(`Added booking: ${booking.invoiceId} with ID: ${docRef.id}`);
    }

    // Sample Orders - using current user ID
    const orders = [
      {
        orderNumber: 'ORD17529230001',
        userId: currentUserId, // Use current user ID
        userEmail: currentUserEmail,
        customerInfo: {
          name: currentUser?.displayName || 'Current User',
          email: currentUserEmail,
          phone: '+91-9876543210'
        },
        shippingAddress: {
          fullName: currentUser?.displayName || 'Current User',
          phone: '+91-9876543210',
          email: currentUserEmail,
          address: '123 Medical Street',
          city: 'Health City',
          state: 'Wellness State',
          pincode: '123456',
          landmark: 'Near City Hospital'
        },
        items: [
          {
            id: 'product-1',
            name: 'Digital Blood Pressure Monitor',
            price: 2500,
            quantity: 1,
            image: '/images/bp-monitor.jpg',
            type: 'product'
          }
        ],
        paymentMethod: {
          type: 'card'
        },
        orderSummary: {
          subtotal: 2500,
          tax: 450,
          shipping: 100,
          total: 3050
        },
        status: 'delivered',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        orderNumber: 'ORD17529230002',
        userId: currentUserId, // Use current user ID
        userEmail: currentUserEmail,
        customerInfo: {
          name: currentUser?.displayName || 'Current User',
          email: currentUserEmail,
          phone: '+91-9876543211'
        },
        shippingAddress: {
          fullName: currentUser?.displayName || 'Current User',
          phone: '+91-9876543211',
          email: currentUserEmail,
          address: '456 Health Avenue',
          city: 'Medical Town',
          state: 'Care State',
          pincode: '654321',
          landmark: 'Opposite Pharmacy'
        },
        items: [
          {
            id: 'product-2',
            name: 'Digital Thermometer',
            price: 500,
            quantity: 2,
            image: '/images/thermometer.jpg',
            type: 'product'
          }
        ],
        paymentMethod: {
          type: 'upi'
        },
        orderSummary: {
          subtotal: 1000,
          tax: 180,
          shipping: 50,
          total: 1230
        },
        status: 'pending',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    for (const order of orders) {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log(`Added order: ${order.orderNumber} with ID: ${docRef.id}`);
    }

    // Sample Promo Codes
    const promos = [
      {
        code: 'HEALTH50',
        name: 'Health Checkup 50% Off',
        description: 'Get 50% discount on all health checkup services',
        discountType: 'percentage',
        discountValue: 50,
        minOrderAmount: 500,
        maxDiscountAmount: 1000,
        usageLimit: 100,
        usedCount: 25,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-12-31'),
        status: 'active',
        applicableToProducts: [],
        applicableToServices: ['General Consultation', 'Blood Test Package'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NEWUSER100',
        name: 'New User Discount',
        description: '₹100 off for first-time users',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 300,
        usageLimit: 500,
        usedCount: 87,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-12-31'),
        status: 'active',
        applicableToProducts: [],
        applicableToServices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MEDS20',
        name: '20% Off Medicines',
        description: '20% discount on all pharmaceutical products',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 200,
        maxDiscountAmount: 500,
        usageLimit: 200,
        usedCount: 45,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-09-30'),
        status: 'active',
        applicableToProducts: ['Paracetamol 500mg', 'Vitamin D3 Tablets'],
        applicableToServices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EXPIRED10',
        name: 'Expired Promo',
        description: 'This promo has expired',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 100,
        usageLimit: 50,
        usedCount: 50,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        status: 'expired',
        applicableToProducts: [],
        applicableToServices: [],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date()
      }
    ];

    for (const promo of promos) {
      const docRef = await addDoc(collection(db, 'promos'), promo);
      console.log(`Added promo: ${promo.code} with ID: ${docRef.id}`);
    }

    console.log('✅ Firebase data population completed successfully!');
    return { success: true, message: `All sample data has been added to Firebase for user: ${currentUserEmail}` };

  } catch (error) {
    console.error('❌ Error populating Firebase data:', error);
    return { success: false, message: 'Failed to populate data', error };
  }
};
