// Razorpay configuration
export const razorpayConfig = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_N6S28HFlGHwqs0',
  keySecret: process.env.RAZORPAY_KEY_SECRET || 'V5JFFTeua12XsoENZspbKHIo',
  currency: 'INR',
  company: {
    name: 'Raghuvanshi Healthcare',
    description: 'Premium Healthcare Services',
    logo: '/logo-healthcare-gold.png',
    theme: '#004AAD'
  }
};

// Payment options interface
export interface PaymentOptions {
  amount: number;
  currency?: string;
  orderId?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

// Payment result interface
export interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Payment error interface
export interface PaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, any>;
}
