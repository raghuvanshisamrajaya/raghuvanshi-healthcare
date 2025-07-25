'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreditCard, MapPin, User, Phone, Mail, ShoppingBag, Lock, Shield, Wallet, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRazorpay } from '@/hooks/useRazorpay';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export default function CheckoutPage() {
  const { cart, loading, clearCart, getCartTotal } = useCart();
  const { user, userData } = useAuth();
  const router = useRouter();
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: userData?.displayName || '',
    phone: userData?.phoneNumber || '',
    email: userData?.email || '',
    address: userData?.address || '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  if (!user) {
    router.push('/login');
    return null;
  }

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

  if (!cart || cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.18);
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!shippingAddress.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!shippingAddress.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!shippingAddress.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!shippingAddress.pincode.trim()) {
      toast.error('Please enter your pincode');
      return false;
    }
    return true;
  };

  const generateOrderNumber = () => {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const createOrder = async (paymentData?: any) => {
    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      userId: user.uid,
      items: cart.items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(paymentData && {
        paymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        paidAt: new Date()
      })
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return { orderId: docRef.id, orderNumber };
  };

  const handleRazorpayPayment = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);

      // First, try to create an order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          notes: {
            userId: user.uid,
            type: 'product_order',
            itemCount: cart.items.length.toString()
          }
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      console.log('Order created:', orderData);

      // Check if this is a mock order (when Razorpay is not available)
      if (orderData.mock) {
        console.log('Mock order detected - proceeding with demo payment');
        
        // For mock orders, simulate payment success after a brief delay
        toast.loading('Processing payment...', { duration: 2000 });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create the order in our database with mock payment data
        const mockPaymentData = {
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_order_id: orderData.id,
          razorpay_signature: `sig_mock_${Date.now()}`,
        };

        const { orderId, orderNumber } = await createOrder(mockPaymentData);
        clearCart();
        toast.success('Order placed successfully! (Demo Mode)');
        router.push(`/order-confirmation/${orderId}?orderNumber=${orderNumber}`);
        return;
      }

      // Real Razorpay payment flow
      const paymentResult = await initiatePayment({
        amount: total,
        currency: 'INR',
        name: 'Product Order',
        description: `Order for ${cart.items.length} items`,
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        notes: {
          userId: user.uid,
          type: 'product_order',
          itemCount: cart.items.length.toString()
        }
      });

      if (paymentResult) {
        const { orderId, orderNumber } = await createOrder(paymentResult);
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order-confirmation/${orderId}?orderNumber=${orderNumber}`);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      
      // If there's any error, offer alternative payment methods
      if (error.message.includes('authentication') || error.message.includes('Payment gateway') || error.message.includes('Failed to create order')) {
        toast.error('Online payment temporarily unavailable. Please choose Cash on Delivery or contact us.');
        setPaymentMethod('cod');
      } else {
        toast.error(error.message || 'Payment failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCODOrder = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);
      const { orderId, orderNumber } = await createOrder();
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-confirmation/${orderId}?orderNumber=${orderNumber}`);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCODOrder();
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter pincode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter landmark"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Razorpay Payment */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="payment-razorpay"
                          name="paymentMethod"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="mr-3"
                          aria-label="Pay Online via Razorpay"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">Pay Online</h3>
                          <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                        </div>
                      </div>
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>

                    {paymentMethod === 'razorpay' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center justify-center p-2 bg-white rounded border text-xs">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Cards
                          </div>
                          <div className="flex items-center justify-center p-2 bg-white rounded border text-xs">
                            <Wallet className="w-4 h-4 mr-1" />
                            Wallets
                          </div>
                          <div className="flex items-center justify-center p-2 bg-white rounded border text-xs">
                            <Phone className="w-4 h-4 mr-1" />
                            UPI
                          </div>
                          <div className="flex items-center justify-center p-2 bg-white rounded border text-xs">
                            <CreditCard className="w-4 h-4 mr-1" />
                            NetBanking
                          </div>
                        </div>
                        <div className="flex items-center mt-3 text-xs text-gray-600">
                          <Lock className="w-3 h-3 mr-1" />
                          <span>Secured by 256-bit SSL encryption</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="payment-cod"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mr-3"
                        aria-label="Cash on Delivery"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative Payment Methods */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Alternative Payment Options</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    If you face any issues with online payment, you can also pay via:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/918824187767?text=Hi, I want to pay ₹${total} for my order with ${cart.items.length} items`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp Payment
                    </a>
                    <a
                      href="tel:+918824187767"
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call: 8824187767
                    </a>
                    <a
                      href="tel:+916367225694"
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call: 6367225694
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="flex items-center mb-6">
                  <Image
                    src="/logo-healthcare-gold.png"
                    alt="Raghuvanshi Healthcare"
                    width={40}
                    height={48}
                    className="w-10 h-12 mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">Order Summary</h3>
                    <p className="text-sm text-gray-600">{cart.items.length} items</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {cart.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%):</span>
                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || paymentLoading}
                  className="w-full mt-6 text-lg py-3"
                  variant="primary"
                >
                  {isProcessing || paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay ₹{total.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Your data is protected with 256-bit SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
