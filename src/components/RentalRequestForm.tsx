'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreditCard, Upload, CheckCircle, AlertTriangle, Phone, Mail, MapPin, Calendar, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/ui/ImageUploader';

interface RentalRequestFormProps {
  product: {
    id: string;
    name: string;
    price: number;
    rentPrice?: number;
    rentPeriod?: string;
    securityDeposit?: number;
    minRentDuration?: number;
    maxRentDuration?: number;
    image?: string;
  };
  onSuccess?: () => void;
}

export default function RentalRequestForm({ product, onSuccess }: RentalRequestFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    customerDetails: {
      fullName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    documents: {
      aadharNumber: '',
      panNumber: '',
      aadharImage: '',
      panImage: '',
      bankChequeImage: ''
    },
    rentalDetails: {
      startDate: '',
      duration: product.minRentDuration || 1,
      advancePayment: 0
    }
  });

  const calculateRentalCost = () => {
    const rentPerPeriod = product.rentPrice || 0;
    const duration = formData.rentalDetails.duration;
    const rentAmount = rentPerPeriod * duration;
    const securityDeposit = product.securityDeposit || 0;
    const advancePayment = Math.max(rentAmount * 0.3, 1000); // 30% advance or minimum 1000
    const totalAmount = rentAmount + securityDeposit;

    return {
      rentAmount,
      securityDeposit,
      advancePayment,
      totalAmount
    };
  };

  const costs = calculateRentalCost();

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit rental request');
      return;
    }

    // Validate required fields
    if (!formData.customerDetails.fullName || !formData.customerDetails.phone || 
        !formData.customerDetails.address || !formData.documents.aadharNumber || 
        !formData.documents.panNumber || !formData.documents.bankChequeImage) {
      toast.error('Please fill all required fields and upload bank cheque');
      return;
    }

    setLoading(true);

    try {
      const startDate = new Date(formData.rentalDetails.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + formData.rentalDetails.duration);

      const rentalRequest = {
        userId: user.uid,
        productId: product.id,
        productName: product.name,
        customerDetails: formData.customerDetails,
        documents: {
          ...formData.documents,
          aadharVerified: false,
          panVerified: false,
          chequeSubmitted: !!formData.documents.bankChequeImage
        },
        rentalDetails: {
          startDate,
          endDate,
          duration: formData.rentalDetails.duration,
          rentAmount: costs.rentAmount,
          securityDeposit: costs.securityDeposit,
          advancePayment: costs.advancePayment,
          totalAmount: costs.totalAmount
        },
        status: 'pending',
        paymentStatus: 'pending',
        deliveryAddress: `${formData.customerDetails.address}, ${formData.customerDetails.city}, ${formData.customerDetails.state} - ${formData.customerDetails.pincode}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'rentalRequests'), rentalRequest);
      
      toast.success('Rental request submitted successfully! We will contact you soon.');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/rental-status/${docRef.id}`);
      }
    } catch (error) {
      console.error('Error submitting rental request:', error);
      toast.error('Failed to submit rental request');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rent: {product.name}</h1>
            <p className="text-gray-600">Complete the form to request this product on rent</p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                <span>8824187767</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                <span>6367225694</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                <span>raghuvanshisamrajya@gmail.com</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Rent Price</div>
            <div className="text-xl font-bold text-blue-600">
              ₹{product.rentPrice} / {product.rentPeriod}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2">Personal Details</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full transition-all ${step >= 2 ? 'bg-blue-600 w-full' : 'bg-gray-200 w-0'}`}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2">Documents</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full transition-all ${step >= 3 ? 'bg-blue-600 w-full' : 'bg-gray-200 w-0'}`}></div>
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2">Rental Details</span>
          </div>
        </div>
      </div>

      {/* Step 1: Personal Details */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.customerDetails.fullName}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, fullName: e.target.value }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.customerDetails.email}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, email: e.target.value }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.customerDetails.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, phone: e.target.value }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.customerDetails.city}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, city: e.target.value }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <input
                type="text"
                value={formData.customerDetails.state}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, state: e.target.value }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your state"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
              <input
                type="text"
                value={formData.customerDetails.pincode}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, pincode: e.target.value }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your PIN code"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
              <textarea
                value={formData.customerDetails.address}
                onChange={(e) => setFormData({
                  ...formData,
                  customerDetails: { ...formData.customerDetails, address: e.target.value }
                })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your complete address"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Document Upload</h2>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="font-medium text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Bank cheque submission is mandatory during product delivery. Without the cheque, your rental order will be declined.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Number *</label>
                <input
                  type="text"
                  value={formData.documents.aadharNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: { ...formData.documents, aadharNumber: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234-5678-9012"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number *</label>
                <input
                  type="text"
                  value={formData.documents.panNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: { ...formData.documents, panNumber: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ABCDE1234F"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                onImageSelect={(imageData) => setFormData({
                  ...formData,
                  documents: { ...formData.documents, aadharImage: imageData }
                })}
                currentImage={formData.documents.aadharImage}
                className="w-full"
              />

              <ImageUploader
                onImageSelect={(imageData) => setFormData({
                  ...formData,
                  documents: { ...formData.documents, panImage: imageData }
                })}
                currentImage={formData.documents.panImage}
                className="w-full"
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Bank Cheque Upload *</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a bank cheque image. This cheque must be submitted physically during product delivery.
              </p>
              <ImageUploader
                onImageSelect={(imageData) => setFormData({
                  ...formData,
                  documents: { ...formData.documents, bankChequeImage: imageData }
                })}
                currentImage={formData.documents.bankChequeImage}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Rental Details */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Rental Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.rentalDetails.startDate}
                onChange={(e) => setFormData({
                  ...formData,
                  rentalDetails: { ...formData.rentalDetails, startDate: e.target.value }
                })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Select rental start date"
                placeholder="Select start date"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration ({product.rentPeriod}) *
              </label>
              <input
                type="number"
                value={formData.rentalDetails.duration}
                onChange={(e) => setFormData({
                  ...formData,
                  rentalDetails: { ...formData.rentalDetails, duration: Number(e.target.value) }
                })}
                min={product.minRentDuration || 1}
                max={product.maxRentDuration || 365}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Enter rental duration"
                placeholder="Enter duration"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: {product.minRentDuration || 1}, Max: {product.maxRentDuration || 365}
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Cost Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rent ({formData.rentalDetails.duration} {product.rentPeriod}s × ₹{product.rentPrice}):</span>
                <span>₹{costs.rentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit (Refundable):</span>
                <span>₹{costs.securityDeposit.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>₹{costs.totalAmount.toLocaleString()}</span>
              </div>
              <div className="text-blue-600 flex justify-between">
                <span>Advance Payment Required:</span>
                <span>₹{costs.advancePayment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Rental Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
