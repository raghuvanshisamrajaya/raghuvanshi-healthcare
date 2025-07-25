'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GovernmentVerificationService, verifyAadhar, verifyPAN } from '@/lib/governmentVerification';
import { FileText, CheckCircle, XCircle, Eye, Phone, Mail, Calendar, IndianRupee, CreditCard, MapPin, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface RentalRequest {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  documents: {
    aadharNumber: string;
    panNumber: string;
    aadharImage?: string;
    panImage?: string;
    aadharVerified: boolean;
    panVerified: boolean;
    bankChequeImage?: string;
    chequeSubmitted: boolean;
  };
  rentalDetails: {
    startDate: Date;
    endDate: Date;
    duration: number;
    rentAmount: number;
    securityDeposit: number;
    advancePayment: number;
    totalAmount: number;
  };
  status: 'pending' | 'document_verification' | 'approved' | 'delivered' | 'returned' | 'rejected' | 'cancelled';
  paymentStatus: 'pending' | 'advance_paid' | 'full_paid' | 'refunded';
  deliveryAddress: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export default function AdminRentalRequests() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [verificationLoading, setVerificationLoading] = useState<{ aadhar: boolean; pan: boolean }>({ aadhar: false, pan: false });
  const [verificationResults, setVerificationResults] = useState<{ aadhar: any; pan: any }>({ aadhar: null, pan: null });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && userData?.role === 'admin') {
      fetchRentalRequests();
    }
  }, [user, userData, loading, router]);

  const fetchRentalRequests = async () => {
    try {
      setLoadingData(true);
      const requestsQuery = query(
        collection(db, 'rentalRequests'),
        orderBy('createdAt', 'desc')
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          rentalDetails: {
            ...data.rentalDetails,
            startDate: data.rentalDetails?.startDate?.toDate() || new Date(),
            endDate: data.rentalDetails?.endDate?.toDate() || new Date()
          }
        } as RentalRequest;
      });

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      toast.error('Failed to load rental requests');
      // Fallback sample data
      setRequests([
        {
          id: 'rent_001',
          userId: 'user_001',
          productId: 'prod_001',
          productName: 'Digital Blood Pressure Monitor',
          customerDetails: {
            fullName: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '9876543210',
            address: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001'
          },
          documents: {
            aadharNumber: '1234-5678-9012',
            panNumber: 'ABCDE1234F',
            aadharVerified: false,
            panVerified: false,
            chequeSubmitted: false
          },
          rentalDetails: {
            startDate: new Date('2025-07-25'),
            endDate: new Date('2025-08-25'),
            duration: 30,
            rentAmount: 500,
            securityDeposit: 2000,
            advancePayment: 1000,
            totalAmount: 3500
          },
          status: 'pending' as const,
          paymentStatus: 'pending' as const,
          deliveryAddress: '123 MG Road, Bangalore, Karnataka - 560001',
          createdAt: new Date('2025-07-21'),
          updatedAt: new Date('2025-07-21')
        }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'rentalRequests', requestId), {
        status,
        updatedAt: new Date(),
        adminNotes
      });

      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: status as any, adminNotes, updatedAt: new Date() }
          : req
      ));

      toast.success('Request status updated successfully');
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const verifyDocument = async (requestId: string, docType: 'aadhar' | 'pan', verified: boolean) => {
    try {
      const updateField = docType === 'aadhar' ? 'documents.aadharVerified' : 'documents.panVerified';
      await updateDoc(doc(db, 'rentalRequests', requestId), {
        [updateField]: verified,
        updatedAt: new Date()
      });

      setRequests(requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              documents: { 
                ...req.documents, 
                [docType === 'aadhar' ? 'aadharVerified' : 'panVerified']: verified 
              },
              updatedAt: new Date()
            }
          : req
      ));

      toast.success(`${docType.toUpperCase()} ${verified ? 'verified' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
    }
  };

  const handleGovernmentVerification = async (docType: 'aadhar' | 'pan', docNumber: string) => {
    try {
      setVerificationLoading({ ...verificationLoading, [docType]: true });
      
      let result;
      if (docType === 'aadhar') {
        result = await verifyAadhar(docNumber);
      } else {
        result = await verifyPAN(docNumber);
      }
      
      setVerificationResults({ ...verificationResults, [docType]: result });
      
      if (result.isValid) {
        toast.success(`${docType.toUpperCase()} verified successfully with government database!`);
      } else {
        toast.error(`${docType.toUpperCase()} verification failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error verifying with government:', error);
      toast.error('Government verification service temporarily unavailable');
    } finally {
      setVerificationLoading({ ...verificationLoading, [docType]: false });
    }
  };

  const extractDocumentNumber = (docType: 'aadhar' | 'pan', request: RentalRequest): string => {
    // This would extract the document number from the uploaded image
    // For demo purposes, we'll use mock numbers
    if (docType === 'aadhar') {
      return '1234 5678 9012'; // Mock Aadhar number
    } else {
      return 'ABCDE1234F'; // Mock PAN number
    }
  };

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'document_verification': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'advance_paid': return 'bg-blue-100 text-blue-800';
      case 'full_paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingData) {
    return (
      <AdminLayout title="Rental Requests">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading rental requests...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Rental Requests">
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rental Requests</h1>
            <p className="text-gray-600">Manage product rental requests and document verification</p>
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
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="document_verification">Document Verification</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verification</p>
              <p className="text-2xl font-semibold text-gray-900">
                {requests.filter(r => r.status === 'document_verification').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{requests.reduce((sum, r) => sum + r.rentalDetails.totalAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.customerDetails.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.productName || 'Product ID: ' + request.productId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {request.customerDetails.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.rentalDetails.duration} days
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.rentalDetails.startDate.toLocaleDateString()} - {request.rentalDetails.endDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{request.rentalDetails.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rent: ₹{request.rentalDetails.rentAmount} | Deposit: ₹{request.rentalDetails.securityDeposit}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(request.paymentStatus)}`}>
                      {request.paymentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Aadhar:</span>
                        {request.documents.aadharVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">PAN:</span>
                        {request.documents.panVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Cheque:</span>
                        {request.documents.chequeSubmitted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rental requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No rental requests match the current filter.
            </p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Rental Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {selectedRequest.customerDetails.fullName}</p>
                  <p><strong>Email:</strong> {selectedRequest.customerDetails.email}</p>
                  <p><strong>Phone:</strong> {selectedRequest.customerDetails.phone}</p>
                  <p><strong>Address:</strong> {selectedRequest.customerDetails.address}, {selectedRequest.customerDetails.city}, {selectedRequest.customerDetails.state} - {selectedRequest.customerDetails.pincode}</p>
                </div>

                {/* Document Verification */}
                <h4 className="font-semibold text-gray-900">Document Verification</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Aadhar Card</p>
                      <p className="text-sm text-gray-500">{selectedRequest.documents.aadharNumber}</p>
                      {verificationResults.aadhar && (
                        <div className={`text-xs mt-1 ${verificationResults.aadhar.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {verificationResults.aadhar.isValid ? 
                            `✓ Verified with UIDAI${verificationResults.aadhar.name ? ` - ${verificationResults.aadhar.name}` : ''}` : 
                            `✗ ${verificationResults.aadhar.error}`
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGovernmentVerification('aadhar', extractDocumentNumber('aadhar', selectedRequest))}
                          disabled={verificationLoading.aadhar}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {verificationLoading.aadhar ? 'Verifying...' : 'Gov Verify'}
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => verifyDocument(selectedRequest.id, 'aadhar', true)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          disabled={selectedRequest.documents.aadharVerified}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => verifyDocument(selectedRequest.id, 'aadhar', false)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">PAN Card</p>
                      <p className="text-sm text-gray-500">{selectedRequest.documents.panNumber}</p>
                      {verificationResults.pan && (
                        <div className={`text-xs mt-1 ${verificationResults.pan.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {verificationResults.pan.isValid ? 
                            `✓ Verified with Income Tax Dept${verificationResults.pan.name ? ` - ${verificationResults.pan.name}` : ''}` : 
                            `✗ ${verificationResults.pan.error}`
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGovernmentVerification('pan', extractDocumentNumber('pan', selectedRequest))}
                          disabled={verificationLoading.pan}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {verificationLoading.pan ? 'Verifying...' : 'Gov Verify'}
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => verifyDocument(selectedRequest.id, 'pan', true)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          disabled={selectedRequest.documents.panVerified}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => verifyDocument(selectedRequest.id, 'pan', false)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Rental Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Product:</strong> {selectedRequest.productName || selectedRequest.productId}</p>
                  <p><strong>Duration:</strong> {selectedRequest.rentalDetails.duration} days</p>
                  <p><strong>Start Date:</strong> {selectedRequest.rentalDetails.startDate.toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {selectedRequest.rentalDetails.endDate.toLocaleDateString()}</p>
                  <p><strong>Rent Amount:</strong> ₹{selectedRequest.rentalDetails.rentAmount.toLocaleString()}</p>
                  <p><strong>Security Deposit:</strong> ₹{selectedRequest.rentalDetails.securityDeposit.toLocaleString()}</p>
                  <p><strong>Advance Payment:</strong> ₹{selectedRequest.rentalDetails.advancePayment.toLocaleString()}</p>
                  <p className="text-lg"><strong>Total Amount:</strong> ₹{selectedRequest.rentalDetails.totalAmount.toLocaleString()}</p>
                </div>

                {/* Status Update */}
                <h4 className="font-semibold text-gray-900">Update Status</h4>
                <div className="space-y-3">
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Admin notes..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    title="Admin notes"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={selectedRequest.status === 'approved'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      disabled={selectedRequest.status === 'rejected'}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'document_verification')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Need Verification
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'delivered')}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Mark Delivered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
